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

	TRAINER_EXPENSE {
		uuid id PK ""  
		uuid trainer_id FK ""  
		string category  "RENT | UTILITY | SUPPLY | OTHER"  
		int amount  ""  
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

	ATTENDANCE_MANAGEMENT {
		uuid id PK ""  
		uuid trainer_id FK ""  
		uuid member_id FK ""  
		uuid membership_id FK ""  
		datetime attended_at  ""  
	}

	SCHEDULE_MANAGEMENT {
		uuid id PK ""  
		uuid trainer_id FK ""  
		uuid member_id FK ""  
		datetime time  ""  
		string status  "scheduled | canceled | completed"  
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
```

## Design Decisions

### Why UUID over int for `id` in tables
IDOR (Insecure Direct Object Reference)
Int IDs are sequential and therefore predictable. An attacker can exploit this predictability by incrementing IDs to enumerate and access other users' data — a pattern that directly leads to BOLA (Broken Object Level Authorization), OWASP API Security Top 1.
Therefore, UUID is more appropriate than int for sensitive resource identifiers, as it eliminates predictability and raises the bar for enumeration attacks.
That said, for public resources — data that carries no sensitivity even if exposed — int remains acceptable, since predictability is not a concern in that context.

### Why `member_id` is denormalized in `REVENUE_RECOGNITION`
member_id can be derived through ATTENDANCE, but I included it directly to avoid an extra join on frequent monthly revenue aggregation queries. Slight redundancy, intentional trade-off for query simplicity.

### Why not float for financial data?
Floats use binary representation internally, which cannot precisely express most decimal fractions - leading to rounding errors that compound over repeated calculations.

Instead, I used `Decimal` (PostgreSQL `NUMERIC`), which stores exact decimal values and guarantees precise arithmetic - a standard practice in any financial system.
