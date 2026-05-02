# Trainer Login Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor T as Trainer
    participant C as Client
    participant S as Server

    %% 1. Login (server resolves org context, returns status code)
    T->>C: Enter email & password
    C->>S: Login request
    S->>S: Validate credentials
    S->>S: Look up joined orgs for trainerId

    alt Exactly 1 approved org
        S-->>C: status: "READY"<br/>body: access_token (payload: trainerId + orgId)<br/>Set-Cookie: refresh_token (HttpOnly)
        C->>T: Enter management main page
    else Multiple orgs or only pending orgs
        S-->>C: status: "ORG_SELECTION_REQUIRED"<br/>body: access_token (payload: trainerId)<br/>Set-Cookie: refresh_token (HttpOnly)
        C->>S: Request joined org list<br/>(GET /api/organization-trainer/joined-orgs)
        S-->>C: Return joined org list<br/>(with join status & role for each)
        C->>T: Display org list
        T->>C: Select org
        C->>S: Send selected orgId<br/>(POST /api/auth/switch-org)<br/>refresh_token sent via cookie
        S-->>C: body: new access_token (payload: trainerId + orgId)<br/>Set-Cookie: new refresh_token (rotated)
        C->>T: Enter management main page
    else No joined orgs
        S-->>C: status: "NO_ORG_MEMBERSHIP"<br/>body: access_token (payload: trainerId)<br/>Set-Cookie: refresh_token (HttpOnly)
        alt Join existing org
            T->>C: Search organization
            C->>S: Send search query<br/>(GET /api/organization/search?name={name})
            S-->>C: Return search results
            T->>C: Send join request
            C->>S: Submit join request<br/>(POST /api/organization-trainer/join-request)
            S-->>C: Pending response
            C->>S: Request joined org list<br/>(GET /api/organization-trainer/joined-orgs)
            S-->>C: Return joined org list
            C->>T: Show joined org list (pending state)
        else Create new organization
            T->>C: Enter organization details
            C->>S: Create organization request<br/>(POST /api/organization)<br/>refresh_token sent via cookie
            S-->>C: Creation complete (orgId)<br/>body: new access_token (payload: trainerId + orgId)<br/>Set-Cookie: new refresh_token (rotated)
            C->>T: Enter management main page
        end
    end
```

## Login Response Status Codes

| `status` value | Meaning | Token payload | Frontend action |
|---|---|---|---|
| `READY` | Trainer has exactly 1 approved org; auto-entered | `trainerId + orgId` | Go straight to management main page |
| `ORG_SELECTION_REQUIRED` | Trainer has multiple orgs, or only pending memberships | `trainerId` | Fetch `/joined-orgs`, show selection page |
| `NO_ORG_MEMBERSHIP` | Trainer has no joined orgs at all | `trainerId` | Show search/create org flow |

## Response Shape Example

```jsonc
// Response body
{
  "status": "READY" | "ORG_SELECTION_REQUIRED" | "NO_ORG_MEMBERSHIP",
  "accessToken": "..."
}

// Response header
Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict; Path=/api/auth; Max-Age=604800
```

## Notes

- Server is the single source of truth for routing. Frontend does not decode the JWT to decide where to navigate — it just reads `status`.
- Future states can be added without breaking changes: `EMAIL_VERIFICATION_REQUIRED`, `2FA_REQUIRED`, `ACCOUNT_LOCKED`, etc.
- A "switch org" button in the management page should still call `/api/auth/switch-org` for trainers who need to change context after auto-entry.
- For `ORG_SELECTION_REQUIRED`, the client makes a separate `GET /joined-orgs` call to fetch the list — keeps the login response lean and lets the org list endpoint be the single source for org metadata.