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
    "accessToken": "new_jwt_access_token"
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

**Response** `204`
```
No Content
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
```json
{
  "passwordChangeToken": "short_lived_token"
}
```

**Response** `401`
```json
{
  "message": "Password does not match"
}
```

---

#### PATCH /api/auth/password-change
Update password

**Headers**
```
Authorization: Bearer <access_token>
Cookie: password_change_token=<short_lived_token> (HttpOnly, Secure, SameSite=Strict)
```

**Request Body**
```json
{
  "passwordChangeToken": "short_lived_token",
  "newPassword": "newpassword456",
  "confirmPassword": "newpassword456"
}
```

**Response** `204`
```
No Content
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
#### Get /api/trainer
Get trainer info

**Response** `200`
```json
{
    "name": "Kyu Won",
    "email": "user@example.com"
}
```

### Member
#### POST /api/members
Register a new member.

**Request Body**
```json
{
    "name": "Jay Choi",
    "phone": "000-0000-0000"
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
        "id": <uuid>,
        "name": "Jay Choi",
        "phone": "000-0000-0000"
    },
    {
        "id": <uuid>,
        "name": "SJ Choi",
        "phone": "111-1111-1111"
    },
    {
        "id": <uuid>,
        "name": "Jay Won",
        "phone": "222-2222-2222"
    },
    ...
]
```

#### POST /api/members/member-search
**Request Body** 
```json
{
    "name": "Jay"
}
```

**Response Body** `200`
```json
[
    {
        "id": <uuid>,
        "name": "Jay Choi",
        "phone": "000-0000-0000"
    },
    {
        "id": <uuid>,
        "name": "Jay Won",
        "phone": "222-2222-2222"
    },
    ...
]
```

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