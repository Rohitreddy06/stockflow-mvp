# StockFlow

StockFlow is a multi-tenant inventory management app built with Next.js, Prisma,
and PostgreSQL. Each organization has its own users, inventory, and low-stock
settings.

## Local development

1. Install dependencies with `npm install`.
2. Set `DATABASE_URL` in `.env` to your PostgreSQL connection URL and
   `JWT_SECRET` to a random secret with at least 32 characters. Keep `.env`
   private; never commit it.
3. Create or update the database schema with `npx prisma db push`.
4. Start the app with `npm run dev`.

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

Connect this GitHub repository to Vercel and add `DATABASE_URL` (a PostgreSQL
connection URL) and `JWT_SECRET` (at least 32 characters) to the Vercel project's
Environment Variables for the environments you deploy. Deployments use the
PostgreSQL database configured by `DATABASE_URL`; local SQLite files are not
used for production storage. Pushes to the connected branch trigger a deployment.

## Useful commands

- `npm run dev` — start the development server.
- `npm run build` — create a production build.
- `npm run lint` — run ESLint.
- `npx prisma generate` — regenerate Prisma Client.
- `npx prisma db push` — synchronize the Prisma schema with the configured
  database.
