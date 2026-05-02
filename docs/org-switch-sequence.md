# Org Context Switching Sequence Diagram

When a trainer with access to multiple orgs navigates to a different org's resource, the access token's org context must be switched. The frontend handles routing/UX, the server validates and issues new tokens.

---

## Happy Path: Frontend Pre-checks Token

```mermaid
sequenceDiagram
    autonumber
    actor T as Trainer
    participant C as Client
    participant S as Server

    T->>C: Click deep link / paste URL<br/>(/org/B/members)
    C->>C: Decode access_token<br/>Compare URL orgId (B) vs token orgId (A)

    alt Mismatch detected
        C->>S: POST /api/auth/switch-org<br/>body: { orgId: "B" }<br/>cookie: refresh_token
        S->>S: Validate refresh_token<br/>Verify trainer has access to org B<br/>Check join status = approved
        S-->>C: New access_token (payload: trainerId + orgId=B)<br/>Set-Cookie: rotated refresh_token
    else Already correct
        Note over C: Skip switch-org
    end

    C->>S: GET /api/org/B/members<br/>Authorization: Bearer <access_token>
    S->>S: Validate token<br/>Token orgId == URL orgId? ✓
    S-->>C: Member list
    C-->>T: Show members page
```

---

## Fallback Path: Server Detects Mismatch

This handles cases where the frontend pre-check didn't run (direct API call, race condition, stale token, etc.). The server is the final authority.

```mermaid
sequenceDiagram
    autonumber
    actor T as Trainer
    participant C as Client
    participant S as Server

    T->>C: Trigger request to org B resource
    C->>S: GET /api/org/B/members<br/>Authorization: Bearer <token with orgId=A>

    S->>S: Validate token signature ✓<br/>Token orgId (A) != URL orgId (B)<br/>→ Mismatch

    S-->>C: 403 Forbidden<br/>body: { code: "ORG_CONTEXT_MISMATCH",<br/>requiredOrgId: "B" }

    C->>S: POST /api/auth/switch-org<br/>body: { orgId: "B" }<br/>cookie: refresh_token
    S->>S: Validate refresh_token<br/>Verify trainer has access to org B
    S-->>C: New access_token (payload: trainerId + orgId=B)<br/>Set-Cookie: rotated refresh_token

    C->>S: Retry: GET /api/org/B/members<br/>Authorization: Bearer <new access_token>
    S->>S: Token orgId == URL orgId? ✓
    S-->>C: Member list
    C-->>T: Show members page
```

---

## Failure Path: Trainer Has No Access to Target Org

```mermaid
sequenceDiagram
    autonumber
    actor T as Trainer
    participant C as Client
    participant S as Server

    T->>C: Navigate to /org/X/members<br/>(trainer has no membership in org X)
    C->>S: POST /api/auth/switch-org<br/>body: { orgId: "X" }<br/>cookie: refresh_token
    S->>S: Validate refresh_token ✓<br/>Look up trainer membership in org X<br/>→ Not a member or status != approved
    S-->>C: 403 Forbidden<br/>body: { code: "NO_ORG_ACCESS" }
    C-->>T: Redirect to org list / show error
```

---

## Status Code Reference

| Code | HTTP | Meaning | Frontend Action |
|---|---|---|---|
| `ORG_CONTEXT_MISMATCH` | 403 | Token's orgId differs from requested resource's orgId | Call `/auth/switch-org` with `requiredOrgId`, retry |
| `NO_ORG_ACCESS` | 403 | Trainer has no membership / not approved in target org | Redirect to org selection or show error |

---

## Server-side Responsibilities

1. **Validate every request** — never trust the client's org context. Compare token's `orgId` with the resource's `orgId` (from URL or request body).
2. **Issue scoped tokens** — `/auth/switch-org` validates membership + status, then issues a token with only the active org.
3. **Rotate refresh_token** — every `/auth/switch-org` call rotates. Reused old refresh tokens trigger session-wide invalidation.
4. **Distinct error codes** — `ORG_CONTEXT_MISMATCH` (token correctable) vs `NO_ORG_ACCESS` (permission denied) so the client can react appropriately.