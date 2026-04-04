# 02. Prisma & PostgreSQL

* Install prisma and initialize prisma
```sh
npm i prisma -D
npx prisma init
```

TypeScript/NestJS는 camelCase 관례고, PostgreSQL은 snake_case 관례

** update .env and schema.prisma

* Migrate
```sh
npx prisma generate
npx prisma migrate dev --name init
```

when model is changed
```sh
npx prisma generate
npx prisma migrate dev --name name_change
```

* Create Prisma module and service
```sh
nest g module database
nest g service database
```

* Update
- src/database/database.module.ts
- src/database/database.service.ts