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
npx prisma migrate dev --name init
```

when model is changed
```sh
npx prisma generate
npx prisma migrate dev --name name_change