# Personal Training Studio Management API

## About this Project

This project demonstrates secure-by-design API development - built with threat modeling and security embedded from the design phase, not added as an afterthought.

## API Key Features
- **Member Management** — Full CRUD for client profiles with active/inactive status
- **Membership Tracking** — Supports session-based (count) and period-based memberships with automatic remaining session deduction on check-in
- **Attendance Management** — Session check-in with membership validation and expiry detection
- **Revenue Tracking** — Payment records with monthly summary and unpaid balance detection
- **Schedule Management** — Create and manage one-on-one session schedules 
with calendar view support and automated pre-class notifications
- **Automated Notifications** — Configurable templates triggered by remaining session count, expiry date, or upcoming class time (SMS / Kakao)
---

## Tech Stack
 
| Layer | Technology |
|---|---|
| Framework | NestJS (TypeScript) |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (Access + Refresh Token) |
| Validation | class-validator / class-transformer |
| Security Middleware | Helmet, @nestjs/throttler |
| API Docs | Swagger (OpenAPI) |
| Testing | Jest |
 
---