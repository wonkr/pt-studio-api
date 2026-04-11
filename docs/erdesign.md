# ER Design

## ERD
```mermaid
---
config:
  layout: elk
---
erDiagram
	direction TB
	TRAINER {
		uuid id PK ""  
		string name  ""  
		string email  ""  
		string password_hash  ""  
		datetime created_at  ""  
	}

	REFRESH_TOKEN {
		uuid id PK
		uuid trainer_id FK
		string token
		datetime created_at
		datetime expired_at
	}

	TRAINER_EXPENSE {
		uuid id PK ""  
		uuid trainer_id FK ""  
		string category  "RENT | UTILITY | SUPPLY | OTHER"  
		decimal amount  ""  
		string memo  ""  
		datetime paid_at  ""  
	}

	MEMBER {
		uuid id PK ""  
		uuid trainer_id FK ""  
		string name  ""  
		string phone_number  ""  
		datetime created_at  ""  
	}

	SESSION_PASS {
		uuid id PK ""  
		uuid trainer_id FK ""  
		string name  ""  
		int total_sessions  ""  
		decimal price  ""  
		int valid_days
	}

	MEMBERSHIP {
		uuid id PK ""  
		uuid trainer_id FK ""  
		uuid member_id FK ""  
		uuid session_pass_id FK ""  
		string payment_type  "card | cash | transfer"  
		string payment_status  "paid | pending | refunded"  
		datetime paid_at  ""  
		datetime started_at  ""  
		datetime expired_at  ""  
		int remaining_sessions  ""  
		int used_sessions  ""  
	}

	SCHEDULE_MANAGEMENT {
		uuid id PK ""  
		uuid trainer_id FK ""  
		uuid member_id FK ""  
		uuid membership_id FK ""
		datetime scheduledAt  ""  
		string status  "scheduled | attended | cancelled | no_show"
		string cancelReason? 
		datetime createdAt
		datetime updatedAt  
	}

	REVENUE_RECOGNITION {
		uuid id PK ""  
		uuid trainer_id FK ""  
		uuid attendance_id FK ""  
		uuid member_id FK ""  
		decimal amount  ""  
		datetime recognized_at  ""  
	}

	MEMBER||--|{MEMBERSHIP:"  "
	SESSION_PASS||--|{MEMBERSHIP:"  "
	MEMBER||--|{ATTENDANCE_MANAGEMENT:"  "
	MEMBERSHIP||--|{ATTENDANCE_MANAGEMENT:"  "
	MEMBER||--|{SCHEDULE_MANAGEMENT:"  "
	ATTENDANCE_MANAGEMENT||--||REVENUE_RECOGNITION:"  "
	MEMBER||--|{REVENUE_RECOGNITION:"  "
	TRAINER||--|{TRAINER_EXPENSE:"  "
	TRAINER||--|{MEMBER:"  "
	TRAINER||--|{SESSION_PASS:"  "
	TRAINER||--|{MEMBERSHIP:"  "
	TRAINER||--|{SCHEDULE_MANAGEMENT:"  "
	TRAINER||--|{ATTENDANCE_MANAGEMENT:"  "
	TRAINER||--|{REVENUE_RECOGNITION:"  "
	TRAINER||--|{REFRESH_TOKEN:"  "
	
```

## Design Decisions

### Why UUID over int for `id` in tables
IDOR (Insecure Direct Object Reference)
Int IDs are sequential and therefore predictable. An attacker can exploit this predictability by incrementing IDs to enumerate and access other users' data — a pattern that directly leads to BOLA (Broken Object Level Authorization), OWASP API Security Top 1.
Therefore, UUID is more appropriate than int for sensitive resource identifiers, as it eliminates predictability and raises the bar for enumeration attacks.
That said, for public resources — data that carries no sensitivity even if exposed — int remains acceptable, since predictability is not a concern in that context.

### Why `member_id` is denormalized in `REVENUE_RECOGNITION`
member_id can be derived through ATTENDANCE, but I included it directly to avoid an extra join on frequent monthly revenue aggregation queries. Slight redundancy, intentional trade-off for query simplicity.

### Why not float for financial data
Floats use binary representation internally, which cannot precisely express most decimal fractions - leading to rounding errors that compound over repeated calculations.

Instead, I used `Decimal` (PostgreSQL `NUMERIC`), which stores exact decimal values and guarantees precise arithmetic - a standard practice in any financial system.

### JWT Token Management Strategy

**Access Token** - `no db storage needed in this project`
- Short-lived (15min) and stateless
- If the token is compromised, damage is minimal due to short expiry
- If revocation is required (e.g. account takeover), add to a Redis blacklist with TTL matching token expiry - `will not implement this in this project`
- Storing in DB causes performance bottlenecks since every API request would require a DB lookup

**Refresh Token** - create a table
- Long-lived (7~30 days), stored in DB to enable logout and forced invalidation
- On logout: delete from DB
- On token refresh: validate against DB before issuing new tokens
- On suspected compromise: delete from DB to immediately invalidate

**Why this split?**
- Access token handles authentication on every request → keep it fast and stateless
- Refresh token handles session lifecycle → needs server-side control for security


### Unify attendance model and schedule model
Initially considered separate Attendance and Schedule tables, but consolidated into a single entity with a state machine. This reduces data inconsistency risk, simplifies BOLA authorization checks, and better reflects the domain reality where a PT session is a single lifecycle event.