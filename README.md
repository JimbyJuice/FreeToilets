# FreeToilets

Find, rate, and review bathrooms at UNSW Kensington.

## Stack

- **Next.js** (App Router) + Tailwind CSS
- **Supabase** (Postgres, Auth, Storage)
- **Vercel** (hosting)

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Copy `.env.local.example` to `.env.local` and fill in your project URL and anon key.

### 3. Run the database migration

In the Supabase SQL Editor, paste and run the contents of:

```
supabase/migrations/001_initial_schema.sql
```

### 4. Create an admin user

1. In Supabase **Authentication → Users**, create a user with email + password.
2. In the SQL Editor, add that email to the admin allowlist:

```sql
INSERT INTO admin_users (email) VALUES ('your-email@example.com');
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin).

## Phase 1 (current)

- Supabase schema (`buildings`, `floor_plans`, `toilets`, `reviews`, `admin_users`)
- Admin login (email/password, allowlist-gated)
- Admin CRUD for buildings, floor plans, and toilets
- Photo upload to Supabase Storage (`toilet-photos` bucket)
- Floor plan SVG upload (`floor-plans` bucket)

## Routes

| Route | Description |
|---|---|
| `/` | Home (placeholder) |
| `/admin` | Admin login |
| `/admin/dashboard` | Manage buildings, floors, toilets |

## Build phases

See `unsw-toilet-ranker-design-plan.md` for the full roadmap. Next up: **Phase 2 — Floor Plan Core** (SVG rendering, level switcher, pin placement tool).
