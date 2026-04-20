# API Design

## Base URL
```
http://localhost:3000
```

## Authentication
All endpoints require JWT token except `/api/auth/register` and `/api/auth/login`
```
Authorization: Bearer <access_token>
```

---

## Endpoints

### Auth

#### POST /api/auth/register
Register a new trainer

**Request Body** 
```json
{
    "name": "Kyu Won",
    "email": "user@example.com",
    "password": "password123",
    "confirmPassword": "password123"
}
```
- *Password requirement*
https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#implement-proper-password-strength-controls 
- email should be unique.
- compare password and confirmPassword

**Response** `201`
```
No Content
```

---

#### POST /api/auth/login
Login and receive tokens

**Request Body**
```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#transmit-passwords-only-over-tls-or-other-strong-transport 
**Response**  `200`

Body:
```json
{
    "accessToken": "jwt_access_token"
}
```

Cookie (Set by server):
```
Set-Cookie: refresh_token=xxx; HttpOnly; Secure; SameSite=Strict
```
---
#### POST /api/auth/refresh
Reissue access token using refresh token

**Request Header**
```
Cookie: refresh_token=<jwt_refresh_token> (HttpOnly, Secure, SameSite=Strict)
```

**Response** `200`
Body: 
```json
{
    "newAccessToken": "new_jwt_access_token"
}
```
Cookie (Set by server):
```
Set-Cookie: refresh_token=xxx; HttpOnly; Secure; SameSite=Strict
```

#### POST /api/auth/logout
Revoke refresh token
**Request Header**
```
Authorization: Bearer <jwt_access_token>
Cookie: refresh_token=<jwt_refresh_token> (HttpOnly, Secure, SameSite=Strict)
```

**Response** `200`
```json
{
  "message": "Logged out successfully"
}
```

#### POST /api/auth/verify-password
Verify current password before changing password

**Headers**
```
Authorization: Bearer <access_token>
```

**Request Body**
```json
{
  "currentPassword": "oldpassword123"
}
```

**Response** `200`
```
No Content
```
Cookie (Set by server):
```
Set-Cookie: password_change_token=xxx; HttpOnly; Secure; SameSite=Strict; Max-Age=300; Path=/auth/password-change
```

**Response** `401`
```json
{
  "message": "Password does not match"
}
```

---

#### PATCH /api/auth/change-password
Update password

**Headers**
```
Authorization: Bearer <access_token>
Cookie: password_change_token=<short_lived_token> (HttpOnly, Secure, SameSite=Strict)
```

**Request Body**
```json
{
  "newPassword": "newpassword456",
  "confirmPassword": "newpassword456"
}
```

**Response** `200`
```json
{
  "message": "Password is changed successfully"
}
```

**Response** `400`
```json
{
  "message": "Passwords do not match"
}
```

**Response** `400`
```json
{
  "message": "New password must be at least 8 characters"
}
```

**Response** `401`
```json
{
  "message": "Invalid or expired password change token"
}
```
---

#### All endpoints except `/api/auth/register` and `/api/auth/login` require a valid JWT access token in the Authorization header.
```
Authorization: Bearer <jwt_access_token>
```

### Trainer
> **Note:** Not yet implemented. TrainersController is currently empty.

#### GET /api/trainer
Get trainer info

**Response** `200`
```json
{
    "name": "Kyu Won",
    "email": "user@example.com"
}
```

### Member
#### POST /api/members/register
Register a new member.

**Request Body**
```json
{
    "name": "Jay Choi",
    "phone": "000-0000-0000",
    "sessionPassName": "PT 30회권", 
    "sessionPassTotalSessions": 30, 
    "sessionPassPrice": 1500000, 
    "sessionPassValidDays": 90, 
    "paymentType": "CARD", 
    "paymentStatus": "PAID" 
}
```

**Response** 200
```
No Content
```

#### GET /api/members
Get a member list

**Response** 200
```json
[
   {
    "name": "Jay Choi",
    "phone": "000-0000-0000",
    "sessionPassName": "10-sessions",
    "paymentStatus": "paid",
    "remainingSessions": 9,
    "membershipExpiryDate": "2026-08-10"
    },
    {
    "name": "Jenna Choi",
    "phone": "111-1111-1111",
    "sessionPassName": "20-sessions",
    "paymentStatus": "pending",
    "remainingSessions": 17,
    "membershipExpiryDate": "2026-10-10"
    },{
    "name": "SJ Choi",
    "phone": "222-2222-2222",
    "sessionPassName": "10-sessions",
    "paymentStatus": "paid",
    "remainingSessions": 3,
    "membershipExpiryDate": "2026-06-20"
    },
    ...
]
```

#### Get /api/members?name="Jay"

**Response Body** `200`
```json
[
    {
        "id": <uuid>,
        "name": "Jay Choi",
        "phone": "000-0000-0000",
        "sessionPassName": "10-sessions",
        "paymentStatus": "paid",
        "remainingSessions": 9,
        "membershipExpiryDate": "2026-08-10"
    },
    {
        "id": <uuid>,
        "name": "Jay Won",
        "phone": "333-3333-3333",
        "sessionPassName": "20-sessions",
        "paymentStatus": "paid",
        "remainingSessions": 4,
        "membershipExpiryDate": "2026-5-05"
    },
    ...
]
```

#### GET /api/members/:id

**Response Body** `200`

```json
{
    "id": "<uuid>",
    "name": "Jay Choi",
    "phone": "000-0000-0000",
    "sessionPassName": "10-sessions",
    "remainingSessions": 9,
    "AttendedSessions": 1,
    "NoShowSessions": 0,
    "membershipExpiryDate": "2026-08-10",
    "paymentStatus": "paid",
    "paymentMethod": "card"
}
```

**Response** `404`
```json
{ "message": "Member not found" }
```

---

#### DELETE /api/members/:id
Delete a member.

**Response** `200`
```
No Content
```

**Response** `404`
```json
{ "message": "Member not found" }
```

---

### SessionPass

#### POST /api/session-pass
Create a new session pass template

**Headers**
```
Authorization: Bearer <access_token>
```

**Request Body**
```json
{
    "name": "30-sessions",
    "totalSessions": 30,
    "price": 1500000,
    "validDays": 90
}
```

**Response** `201`
```json
{
    "id": "uuid",
    "name": "30-sessions",
    "totalSessions": 30,
    "price": 1500000,
    "validDays": 90,
    "createdAt": "2026-04-12T00:00:00.000Z",
    "updatedAt": "2026-04-12T00:00:00.000Z"
}
```

---

#### GET /api/session-pass
Get all session passes

**Headers**
```
Authorization: Bearer <access_token>
```

**Response** `200`
```json
[
    {
        "id": "uuid-1",
        "name": "PT 10회권",
        "totalSessions": 10,
        "price": 600000,
        "validDays": 30
    },
    {
        "id": "uuid-2",
        "name": "PT 30회권",
        "totalSessions": 30,
        "price": 1500000,
        "validDays": 90
    }
]
```

---

#### GET /api/session-pass/:id
Get a session pass by ID

**Headers**
```
Authorization: Bearer <access_token>
```

**Response** `200`
```json
{
    "id": "uuid",
    "name": "PT 30회권",
    "totalSessions": 30,
    "price": 1500000,
    "validDays": 90,
    "createdAt": "2026-04-12T00:00:00.000Z",
    "updatedAt": "2026-04-12T00:00:00.000Z"
}
```

**Response** `404`
```json
{
    "message": "Session pass not found"
}
```

---

#### PATCH /api/session-pass/:id
Update a session pass (partial update)

**Headers**
```
Authorization: Bearer <access_token>
```

**Request Body** (all fields optional)
```json
{
    "name": "PT 30회권 (할인)",
    "totalSessions": 30,
    "price": 1200000,
    "validDays": 120
}
```

**Response** `200`
```json
{
    "id": "uuid",
    "name": "PT 30회권 (할인)",
    "totalSessions": 30,
    "price": 1200000,
    "validDays": 120,
    "createdAt": "2026-04-12T00:00:00.000Z",
    "updatedAt": "2026-04-12T01:00:00.000Z"
}
```

**Response** `404`
```json
{
    "message": "Session pass not found"
}
```

---

#### DELETE /api/session-pass/:id
Delete a session pass

**Headers**
```
Authorization: Bearer <access_token>
```

**Response** `204`
```
No Content
```

**Response** `404`
```json
{
    "message": "Session pass not found"
}
```

---

#### PATCH /api/session-pass/activate/:id
Activate or deactivate a session pass.

**Headers**
```
Authorization: Bearer <access_token>
```

**Request Body**
```json
{
    "isActivated": true
}
```

**Response** `200` — returns updated session pass

**Response** `404`
```json
{
    "message": "Session pass not found"
}
```

---

### Membership

#### POST /api/membership
Create a new membership for a member

**Headers**
```
Authorization: Bearer <access_token>
```

**Request Body**
```json
{
    "memberId": "member-uuid",
    "sessionPassId": "session-pass-uuid",
    "sessionPassName": "PT 30회권",
    "sessionPassTotalSessions": 30,
    "sessionPassPrice": 1500000,
    "sessionPassValidDays": 90,
    "paymentType": "CARD",
    "paymentStatus": "PAID",
    "paidAt": "2026-04-12T00:00:00.000Z",
    "membershipStartedAt": "2026-04-12T00:00:00.000Z",
    "membershipExpiredAt": "2026-07-12T00:00:00.000Z"
}
```

- `sessionPassId` is optional (can create membership without predefined session pass)
- `paidAt`, `membershipStartedAt`, `membershipExpiredAt` are optional
- `remainingSessions` defaults to `sessionPassTotalSessions`
- `usedSession` defaults to `0`

**Response** `201`
```json
{
    "id": "uuid",
    "memberId": "member-uuid",
    "sessionPassId": "session-pass-uuid",
    "sessionPassName": "PT 30회권",
    "sessionPassTotalSessions": 30,
    "sessionPassPrice": 1500000,
    "sessionPassValidDays": 90,
    "paymentType": "CARD",
    "paymentStatus": "PAID",
    "paidAt": "2026-04-12T00:00:00.000Z",
    "membershipStartedAt": "2026-04-12T00:00:00.000Z",
    "membershipExpiredAt": "2026-07-12T00:00:00.000Z",
    "remainingSessions": 30,
    "usedSession": 0,
    "createdAt": "2026-04-12T00:00:00.000Z",
    "updatedAt": "2026-04-12T00:00:00.000Z"
}
```

---

#### GET /api/membership/:id
Get a membership by ID

**Headers**
```
Authorization: Bearer <access_token>
```

**Response** `200`
```json
{
    "id": "uuid",
    "memberId": "member-uuid",
    "sessionPassId": "session-pass-uuid",
    "sessionPassName": "PT 30회권",
    "sessionPassTotalSessions": 30,
    "sessionPassPrice": 1500000,
    "sessionPassValidDays": 90,
    "paymentType": "CARD",
    "paymentStatus": "PAID",
    "paidAt": "2026-04-12T00:00:00.000Z",
    "membershipStartedAt": "2026-04-12T00:00:00.000Z",
    "membershipExpiredAt": "2026-07-12T00:00:00.000Z",
    "remainingSessions": 25,
    "usedSession": 5,
    "createdAt": "2026-04-12T00:00:00.000Z",
    "updatedAt": "2026-04-15T00:00:00.000Z"
}
```

**Response** `404`
```json
{
    "message": "Membership not found"
}
```

---

#### PATCH /api/membership/:id
Update a membership (partial update)

**Headers**
```
Authorization: Bearer <access_token>
```

**Request Body** (all fields optional)
```json
{
    "paymentStatus": "REFUNDED",
    "remainingSessions": 20,
    "membershipExpiredAt": "2026-08-12T00:00:00.000Z"
}
```

**Response** `200`
```json
{
    "id": "uuid",
    "memberId": "member-uuid",
    "sessionPassId": "session-pass-uuid",
    "sessionPassName": "PT 30회권",
    "sessionPassTotalSessions": 30,
    "sessionPassPrice": 1500000,
    "sessionPassValidDays": 90,
    "paymentType": "CARD",
    "paymentStatus": "REFUNDED",
    "paidAt": "2026-04-12T00:00:00.000Z",
    "membershipStartedAt": "2026-04-12T00:00:00.000Z",
    "membershipExpiredAt": "2026-08-12T00:00:00.000Z",
    "remainingSessions": 20,
    "usedSession": 5,
    "createdAt": "2026-04-12T00:00:00.000Z",
    "updatedAt": "2026-04-16T00:00:00.000Z"
}
```

**Response** `404`
```json
{
    "message": "Membership not found"
}
```

---

#### DELETE /api/membership/:id
Delete a membership

**Headers**
```
Authorization: Bearer <access_token>
```

**Response** `204`
```
No Content
```

**Response** `404`
```json
{
    "message": "Membership not found"
}
```

#### GET /api/membership/summary
Get membership summary aggregated by period (monthly or yearly).

**Headers**
```
Authorization: Bearer <access_token>
```

**Query Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `year` | integer | Yes | Year to query (e.g., 2026) |
| `month` | integer | Yes | Month to query (1-12) |

**Response** `200`
```json
{
    "id": "uuid",
    "memberId": "member-uuid",
    "memberName": "member-name",
    "sessionPassId": "session-pass-uuid",
    "sessionPassName": "PT 30회권",
    "sessionPassTotalSessions": 30,
    "remainingSessions": 25,
    "usedThisMonth": 3,
    "usedSession": 5,
    "membershipExpiredAt": "2026-07-12T00:00:00.000Z",
    "progress": "16%"
}
```

---

#### GET /api/membership/membership-transaction
Get membership payment transactions aggregated by period.

**Headers**
```
Authorization: Bearer <access_token>
```

**Query Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `year` | integer | Yes | Year to query (e.g., 2026) |
| `month` | integer | Yes | Month to query (1-12) |

**Response** `200`
```json
[
    {
        "memberId": "member-uuid",
        "memberName": "member-name",
        "sessionPassName": "PT 30회권",
        "sessionPassPrice": 1500000,
        "paymentType": "CARD",
        "paymentStatus": "PAID",
        "paidAt": "2026-04-12T00:00:00.000Z"
    }
]
```

### Schedule

All endpoints require a valid JWT access token in the Authorization header.
```
Authorization: Bearer <jwt_access_token>
```

---

#### POST /api/schedule
Create a new PT session schedule.

**Headers**
```
Authorization: Bearer <access_token>
```

**Request Body**
```json
{
    "memberId": "member-uuid",
    "membershipId": "membership-uuid",
    "scheduledAt": "2026-04-20T10:00:00.000Z",
    "sessionDuration": 60,
    "status": "SCHEDULED",
    "cancelReason": null
}
```

**Business rules**
- Verifies that `membershipId` belongs to the authenticated trainer (BOLA defense).
- Rejects if the membership has no remaining sessions.
- Database-level Exclusion Constraint rejects overlapping schedules for the same trainer.
- If `status === "ATTENDED"`, atomically decrements `remainingSessions` and creates a `RevenueRecognition` record in the same transaction.

**Response** `201`
```json
{
    "id": "schedule-uuid",
    "trainerId": "trainer-uuid",
    "memberId": "member-uuid",
    "membershipId": "membership-uuid",
    "scheduledAt": "2026-04-20T10:00:00.000Z",
    "sessionDuration": 60,
    "endsAt": "2026-04-20T11:00:00.000Z",
    "status": "SCHEDULED",
    "cancelReason": null,
    "createdAt": "2026-04-14T00:00:00.000Z",
    "updatedAt": "2026-04-14T00:00:00.000Z"
}
```

**Response** `403`
```json
{ "message": "Invalid or depleted membership" }
```

**Response** `409`
```json
{ "message": "Schedule conflicts with existing session" }
```

---

#### GET /api/schedule
List all schedules for the authenticated trainer. Optionally filter by member.

**Query Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `member-id` | string (uuid) | No | Filter schedules for a specific member |

**Example**
```
GET /api/schedule
GET /api/schedule?member-id=member-uuid
```

**Response** `200`
```json
[
    {
        "id": "schedule-uuid-1",
        "member": {
            "id": "member-uuid",
            "name": "김민수",
            "phoneNumber": "01012345678"
        },
        "membership": {
            "id": "membership-uuid",
            "remainingSessions": 25
        },
        "scheduledAt": "2026-04-20T10:00:00.000Z",
        "sessionDuration": 60,
        "status": "SCHEDULED",
        "cancelReason": null
    }
]
```

---

#### GET /api/schedule/:id
Get detailed information about a single schedule.

**Response** `200`
```json
{
    "id": "schedule-uuid",
    "member": {
        "id": "member-uuid",
        "name": "김민수",
        "phoneNumber": "01012345678"
    },
    "membership": {
        "id": "membership-uuid",
        "remainingSessions": 25,
        "usedSessions": 5,
        "expiredAt": "2026-07-20T00:00:00.000Z"
    },
    "scheduledAt": "2026-04-20T10:00:00.000Z",
    "sessionDuration": 60,
    "status": "SCHEDULED",
    "cancelReason": null
}
```

**Response** `404`
```json
{ "message": "Schedule not found" }
```

---

#### PATCH /api/schedule/:id
Update a schedule (partial update). Used for rescheduling, status changes (check-in, cancellation, no-show).

**Request Body** (all fields optional)
```json
{
    "scheduledAt": "2026-04-20T14:00:00.000Z",
    "sessionDuration": 90,
    "status": "ATTENDED",
    "cancelReason": null
}
```

**Business rules**
- `endsAt` is automatically recalculated when `scheduledAt` or `sessionDuration` changes.
- Status transition to `ATTENDED` decrements `remainingSessions` and records revenue atomically.
- Database-level Exclusion Constraint re-validates on time changes.

**Response** `200` — returns updated schedule

**Response** `404`
```json
{ "message": "Schedule not found" }
```

**Response** `409`
```json
{ "message": "Schedule conflicts with existing session" }
```

---

#### DELETE /api/schedule/:id
Delete a schedule.

**Response** `204` No Content

**Response** `404`
```json
{ "message": "Schedule not found" }
```

---

#### Schedule Status Enum
| Value | Meaning |
|-------|---------|
| `SCHEDULED` | Booked, pending |
| `ATTENDED` | Session completed (triggers session decrement + revenue recognition) |
| `NOSHOW` | Member did not attend |
| `CANCELLED` | Cancelled before session time |

### TrainerExpense

All endpoints require a valid JWT access token and operate only on the
authenticated trainer's expenses (BOLA defense enforced via `trainerId` filter).

---

#### POST /api/trainer-expense
Create a new expense record.

**Headers**
```
Authorization: Bearer <access_token>
```

**Request Body**
```json
{
    "category": "RENT",
    "amount": 2000000,
    "memo": "April studio rent",
    "paidAt": "2026-04-01T00:00:00.000Z"
}
```

**Field constraints**
- `category`: enum — `"RENT" | "UTILITY" | "SUPPLY" | "OTHER"`
- `amount`: integer, `0 <= amount <= 100,000,000` (stored in KRW as integer to avoid floating-point errors)
- `memo`: string, max 500 chars
- `paidAt`: ISO 8601 datetime

**Response** `201`
```json
{
    "id": "expense-uuid",
    "trainerId": "trainer-uuid",
    "category": "RENT",
    "amount": 2000000,
    "memo": "April studio rent",
    "paidAt": "2026-04-01T00:00:00.000Z",
    "createdAt": "2026-04-15T00:00:00.000Z",
    "updatedAt": "2026-04-15T00:00:00.000Z"
}
```

**Response** `400` — Validation error (invalid category, negative amount, etc.)

---

#### GET /api/trainer-expense
List all expense records for the authenticated trainer.

**Query Parameters** (all optional)
| Name | Type | Description |
|------|------|-------------|
| `category` | enum | Filter by category |
| `start-date` | ISO 8601 | Inclusive lower bound on `paidAt` |
| `end-date` | ISO 8601 | Inclusive upper bound on `paidAt` |

**Example**
```
GET /api/trainer-expense
GET /api/trainer-expense?category=RENT
GET /api/trainer-expense?start-date=2026-04-01&end-date=2026-04-30
```

**Response** `200`
```json
[
    {
        "id": "expense-uuid-1",
        "category": "RENT",
        "amount": 2000000,
        "memo": "April studio rent",
        "paidAt": "2026-04-01T00:00:00.000Z"
    },
    {
        "id": "expense-uuid-2",
        "category": "SUPPLY",
        "amount": 150000,
        "memo": "Resistance bands",
        "paidAt": "2026-04-05T00:00:00.000Z"
    }
]
```

---

#### GET /api/trainer-expense/:id
Get a single expense record by ID.

**Response** `200`
```json
{
    "id": "expense-uuid",
    "trainerId": "trainer-uuid",
    "category": "RENT",
    "amount": 2000000,
    "memo": "April studio rent",
    "paidAt": "2026-04-01T00:00:00.000Z",
    "createdAt": "2026-04-15T00:00:00.000Z",
    "updatedAt": "2026-04-15T00:00:00.000Z"
}
```

**Response** `404`
```json
{ "message": "Trainer expense not found" }
```

> **Security note:** A `404` is returned whether the ID does not exist OR it belongs to another trainer. This prevents attackers from enumerating other trainers' expense IDs (BOLA defense + information leakage prevention).

---

#### PATCH /api/trainer-expense/:id
Update an expense record (partial update).

**Request Body** (all fields optional)
```json
{
    "amount": 1950000,
    "memo": "April studio rent (discount applied)"
}
```

**Response** `200` — returns the updated expense record.

**Response** `404`
```json
{ "message": "Trainer expense not found" }
```

---

#### DELETE /api/trainer-expense/:id
Delete an expense record.

**Response** `204` No Content

**Response** `404`
```json
{ "message": "Trainer expense not found" }
```

---

#### GET /api/trainer-expense/summary
Get expense summary aggregated by period.

**Headers**
```
Authorization: Bearer <access_token>
```

**Query Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `year` | integer | Yes | Year to query (e.g., 2026) |
| `month` | integer | No | Month to query (1-12). If omitted, returns full year summary. |

**Example**
```
GET /api/trainer-expense/summary?year=2026&month=4
GET /api/trainer-expense/summary?year=2026
```

**Response** `200`
```json
{
    "year": 2026,
    "month": 4,
    "totalExpenses": 2270000,
    "breakdown": {
        "RENT": 2000000,
        "UTILITY": 120000,
        "SUPPLY": 150000,
        "OTHER": 0
    }
}
```

---

#### Expense Category Enum
| Value | Meaning |
|-------|---------|
| `RENT` | Studio rent |
| `UTILITY` | Electricity, water, internet |
| `SUPPLY` | Training equipment, consumables |
| `OTHER` | Miscellaneous expenses |

### RevenueSummary

All endpoints require a valid JWT access token and operate only on the
authenticated trainer's expenses (BOLA defense enforced via `trainerId` filter).

---

#### GET /api/revenue-summary
Get monthly or yearly financial summary for the authenticated trainer.

**Headers**
```
Authorization: Bearer <access_token>
```

**Query Parameters**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `year` | integer | Yes | Year to query (e.g., 2026) |
| `month` | integer | No | Month to query (1-12). If omitted, returns full year summary. |

**Example**
```
GET /api/revenue-summary?year=2026&month=4
GET /api/revenue-summary?year=2026
```

**Response** `200` (monthly)
```json
{
    "year": 2026,
    "month": 4,
    "totalSales": 3670000,
    "earnedRevenue": 2209000,
    "unearnedRevenue": 1461000,
    "totalExpenses": 1221000,
    "netProfit": 988000
}
```

**Response** `200` (yearly)
```json
{
    "year": 2026,
    "month": null,
    "totalSales": 42000000,
    "earnedRevenue": 31500000,
    "unearnedRevenue": 10500000,
    "totalExpenses": 15800000,
    "netProfit": 15700000
}
```

**Response** `400`
```json
{ "message": "year is required" }
```

**Field definitions**
| Field | Description |
|-------|-------------|
| `totalSales` | Total session pass sales (sum of sessionPassPrice from new memberships) |
| `earnedRevenue` | Revenue from attended sessions (price per session × attended count) |
| `unearnedRevenue` | `totalSales - earnedRevenue` (prepaid but not yet delivered) |
| `totalExpenses` | Sum of all trainer expenses for the period |
| `netProfit` | `earnedRevenue - totalExpenses` |

> **Security note:** All calculations are scoped to the authenticated trainer's data via `trainerId` filter (BOLA defense). Monetary values are stored and returned as integers in KRW to prevent floating-point arithmetic errors.


## Design Decisions

### Why JWT?
- Industry standard for stateless REST API authentication
- Scalable — no server-side session storage needed
- Self-contained — token carries user identity and claims

*Access Token + Refresh Token strategy*
- Access Token: 15 min expiry — limits blast radius if stolen
- Refresh Token: 7 day expiry — maintains user experience

*Why Refresh Token Rotation?*
Every time an Access Token is reissued, the Refresh Token is also 
rotated (old one revoked, new one issued).

This enables stolen token detection:
- If a stolen Refresh Token is used, the server detects a reuse attempt
- All sessions for that user are immediately invalidated

*Trade-off acknowledged*
Rotation is not a perfect defense. If an attacker uses the stolen 
Refresh Token before the legitimate user does, the legitimate user 
gets logged out. This is an accepted trade-off between security and 
user experience.

### Choose RSA for JWT module signing key
RSA (RS256) was chosen over HMAC (HS256) because in enterprise environments, multiple services may need to verify tokens. With RSA, only the Public Key needs to be distributed — Private Key never leaves the auth service. This follows the Principle of Least Privilege.
Separate RSA key pairs are used for Access Token and Refresh Token 
to prevent a stolen Refresh Token from being used to bypass 
Access Token validation.

### Save RSA keys in .env file
In production, JWT keys should be stored in a Secret Manager (e.g. AWS Secrets Manager, HashiCorp Vault) rather than .env files. `.env` is used here for local development only.

### Password manage
- Require Strong Password
https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#implement-proper-password-strength-controls  
- Transmit passwords over tls 
(https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#transmit-passwords-only-over-tls-or-other-strong-transport)
- Bcrypt hash when save in DB

### Transfer Refresh Token using `HttpOnly Cookie`.
```
Cookie: refresh_token=xxx (HttpOnly, Secure, SameSite=Strict)
```
- prevent XSS (Not allow access through Javascript)
- Only transfer through HTTPS

### Schedule Overlap Prevention

A trainer cannot be double-booked — enforced via a PostgreSQL
**Exclusion Constraint** on the `Schedule` table:

```sql
EXCLUDE USING gist (
  "trainer_id" WITH =,
  tsrange("scheduled_at", "ends_at", '[)') WITH &&
) WHERE (status IN ('SCHEDULED', 'ATTENDED'));
```

**Why at the DB layer?**
Checking conflicts in the service layer (`findFirst` → `create`) creates
a TOCTOU race condition — concurrent requests can slip through the gap
and produce double-bookings. The Exclusion Constraint makes the check
atomic at the storage level.

**Defense in Depth:** DTO validation → service transaction → DB constraint.
Even if application code is bypassed, the invariant holds.

### Idempotent State Transition Handling

Schedule status changes trigger financial side-effects (revenue
recognition, session decrement). To prevent abuse via redundant PATCH
requests, transitions are detected by comparing *existing* and *new*
states, not just the current state:

```typescript
const wasAttended = existing.status === "ATTENDED";
const willBeAttended = newStatus === "ATTENDED";

if (!wasAttended && willBeAttended) await onAttended(tx, ...);
if (wasAttended && !willBeAttended) await onDeAttended(tx, ...);
// ATTENDED → ATTENDED or non → non: no-op
```

This guarantees that each state transition fires exactly once,
eliminating the "repeated PATCH inflates revenue" business logic abuse.

### Expense Amount Stored as Integer

All monetary values (`amount`, `sessionPassPrice`) are stored as `Int` in KRW.

**Rationale**
- JavaScript numbers use IEEE 754 floats → arithmetic drift (`0.1 + 0.2 !== 0.3`)
- Over time, rounding errors accumulate in financial summaries
- Attackers can exploit rounding behavior (classic *Salami Attack* pattern)

**Defense in Depth**
- DTO layer: `@IsInt()` rejects string/float inputs
- DTO layer: `@Min(0)` prevents negative amounts (refund abuse)
- DTO layer: `@Max(100_000_000)` caps absurd values (integer overflow / DoS)s
- DB layer: Prisma schema enforces `Int` type

### Apply `Helmet`
Helmet is a middleware that automatically sets `security-related HTTP response headers` to protect your API from common web vulnerabilities.

**X-Frame-Options** — Prevents your site from being embedded in an <iframe>. Blocks clickjacking attacks where attackers overlay invisible frames to trick users into clicking malicious buttons.
**X-Content-Type-Options** — Tells the browser to trust the declared Content-Type and not guess (sniff) it. Prevents attackers from disguising a malicious script as an image or other harmless file type.
**Content-Security-Policy (CSP)** — Controls which sources (domains) the browser is allowed to load scripts, styles, and images from. Blocks XSS attacks by rejecting inline scripts or scripts from unauthorized origins.
**Strict-Transport-Security (HSTS)** — Tells the browser to only connect via HTTPS. Even if a user types http://, the browser automatically upgrades to https://, preventing man-in-the-middle attacks.

It requires just one line (app.use(helmet())) and follows OWASP security headers best practices.