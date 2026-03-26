# Wealix

Wealix is a personal wealth operating system built with Next.js App Router, Clerk, Zustand, Tailwind, and shadcn/ui.

It helps users track:

- income
- expenses
- receipt OCR
- portfolio holdings
- net worth
- budget limits
- FIRE progress
- reports

The app supports:

- Clerk-based user accounts
- guest browsing with read-only demo data
- live mode for signed-in users with clean personal data
- Arabic and English UI
- RTL support for Arabic with Tajawal font

## Main Features

- Dashboard with wealth summary and onboarding-style empty states for new users
- Income tracking with recurring and one-time entries
- Expense tracking with manual entry and receipt scanning
- Receipt OCR with camera/upload support and manual review before saving
- Portfolio tracking with manual entry, Excel import, and AI analysis
- Net worth tracking with assets and liabilities
- Budget tracking with category limits and report-ready budget data
- Reports for income, expenses, budget, portfolio, net worth, FIRE, and annual review
- Settings for language, theme, notifications, subscription, and local data reset

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Zustand
- Clerk
- Framer Motion
- Recharts
- Bun

## Project Structure

```text
src/
  app/
    api/
    advisor/
    budget/
    expenses/
    fire/
    income/
    net-worth/
    portfolio/
    reports/
    settings/
  components/
  store/
  lib/
public/
```

## Local Development

### 1. Install dependencies

```bash
bun install
```

### 2. Run the app

```bash
bun run dev
```

The app runs on:

- `http://localhost:3000`

### 3. Production build locally

```bash
bun run build
bun run start
```

## Environment Variables

Create a `.env.local` file for local development.

### Required for production

These are required if you deploy the current app with full auth and OCR support:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATALAB_API_KEY=
```

### Optional

```env
DATALAB_API_BASE=https://www.datalab.to
CHANDRA_API_KEY=
```

Notes:

- `DATALAB_API_KEY` is the primary key used for Chandra/Datalab hosted OCR.
- `CHANDRA_API_KEY` is supported as an alternate name, but `DATALAB_API_KEY` is preferred.
- `DATALAB_API_BASE` is optional unless you are pointing to a non-default Datalab base URL.

### Clerk

Used for:

- sign up
- sign in
- user session management
- user avatar/account menu

Required vars:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

Without valid Clerk keys, production auth will fail.

### Chandra / Datalab OCR

Used for:

- receipt scanning
- text extraction from uploaded receipt images
- camera-captured receipt OCR

Required var:

```env
DATALAB_API_KEY=
```

Optional:

```env
DATALAB_API_BASE=https://www.datalab.to
```

The receipt OCR route is:

- [src/app/api/receipts/ocr/route.ts](/Users/mohammedzaher/projects/Wealixapp%20v2/src/app/api/receipts/ocr/route.ts)

Current behavior:

- first tries Datalab/Chandra OCR
- falls back to the older vision-based OCR path if Datalab is unavailable

### Supabase

Supabase MCP was configured for Codex tooling, but it is not currently required by the deployed app runtime.

That means:

- no Supabase app env vars are required for the current frontend deployment
- Supabase MCP setup is local tooling for development, not a production app dependency

If you later move user data from local storage to Supabase, then new Supabase runtime env vars will be needed.

## Authentication Model

Wealix currently uses Clerk as the main user management system.

### Guest users

Guests can:

- navigate the app
- view demo data
- inspect the UI

Guests cannot:

- add income
- add expenses
- save OCR results
- add portfolio holdings
- import portfolio files
- generate/download real reports
- switch to live mode
- change settings

### Signed-in users

Signed-in users get:

- their own isolated app data
- clean live-mode state by default
- full access to app features

## Data Model

The app currently stores user-facing financial data in local persisted app state through Zustand.

Main persisted data includes:

- income entries
- expense entries
- receipt scans
- portfolio holdings
- assets
- liabilities
- budget limits
- notification preferences
- app mode

Main store:

- [src/store/useAppStore.ts](/Users/mohammedzaher/projects/Wealixapp%20v2/src/store/useAppStore.ts)

Important note:

- data is isolated per Clerk user in the app state
- this is not yet a full cloud database for cross-device sync

## OCR Flow

Receipt OCR flow lives in:

- [src/app/expenses/page.tsx](/Users/mohammedzaher/projects/Wealixapp%20v2/src/app/expenses/page.tsx)
- [src/app/api/receipts/ocr/route.ts](/Users/mohammedzaher/projects/Wealixapp%20v2/src/app/api/receipts/ocr/route.ts)

Current OCR UX:

- upload receipt image
- or capture directly from mobile camera
- run OCR
- review extracted data
- edit merchant, amount, date, category, description, and raw text
- save as expense

## Portfolio Import

Portfolio import supports Excel/CSV.

Sample files:

- [public/samples/wealix-portfolio-import-sample.xlsx](/Users/mohammedzaher/projects/Wealixapp%20v2/public/samples/wealix-portfolio-import-sample.xlsx)
- [public/samples/wealix-portfolio-import-sample.csv](/Users/mohammedzaher/projects/Wealixapp%20v2/public/samples/wealix-portfolio-import-sample.csv)

Portfolio screen:

- [src/app/portfolio/page.tsx](/Users/mohammedzaher/projects/Wealixapp%20v2/src/app/portfolio/page.tsx)

## Reports

Reports are generated from source-specific data, not a single shared mock summary.

Current report mapping:

- Income Report -> income entries
- Expenses Report -> expense entries and receipt scans
- Budget Report -> budget limits plus period-filtered income/expenses
- Net Worth Report -> assets, liabilities, and portfolio value
- Portfolio Report -> portfolio holdings
- FIRE Report -> savings rate and net worth context
- Annual Review -> combined financial datasets

Reports screen:

- [src/app/reports/page.tsx](/Users/mohammedzaher/projects/Wealixapp%20v2/src/app/reports/page.tsx)

## Deployment

## Deploy to Vercel

### 1. Push the repo to GitHub

Make sure your latest code is committed and pushed.

### 2. Import the repo into Vercel

In Vercel:

1. Create a new project
2. Import the GitHub repository
3. Let Vercel detect Next.js

### 3. Add environment variables in Vercel

Add these in:

- Project Settings
- Environment Variables

Required:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATALAB_API_KEY=
```

Optional:

```env
DATALAB_API_BASE=https://www.datalab.to
CHANDRA_API_KEY=
```

Recommended scope:

- Production
- Preview
- Development

### 4. Redeploy

Any env var change requires a new deployment.

### 5. Verify production

Check:

1. Homepage loads
2. Guest can browse demo data
3. Sign up works
4. After sign-in, user starts with clean live data
5. Settings open correctly
6. Reports open
7. Receipt OCR works with a real Datalab key

## Deploy to Netlify

This repo can also be deployed to Netlify, but Vercel is the more natural fit for the current Next.js App Router setup.

If deploying to Netlify:

1. Connect the GitHub repo
2. Set build command:

```bash
bun run build
```

3. Publish output using the Next.js runtime/plugin setup your Netlify project expects
4. Add the same env vars:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATALAB_API_KEY=
```

## Deployment Troubleshooting

### Clerk works locally but fails in production

Check:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- Clerk production domain configuration
- redeploy after env var changes

### Receipt OCR fails in production

Check:

- `DATALAB_API_KEY` is set
- the key is valid
- your deployment can reach `https://www.datalab.to`

### Guests can edit data

Guest restrictions are enforced in the feature pages and settings. If behavior regresses, review:

- [src/app/settings/page.tsx](/Users/mohammedzaher/projects/Wealixapp%20v2/src/app/settings/page.tsx)
- [src/app/income/page.tsx](/Users/mohammedzaher/projects/Wealixapp%20v2/src/app/income/page.tsx)
- [src/app/expenses/page.tsx](/Users/mohammedzaher/projects/Wealixapp%20v2/src/app/expenses/page.tsx)
- [src/app/portfolio/page.tsx](/Users/mohammedzaher/projects/Wealixapp%20v2/src/app/portfolio/page.tsx)
- [src/app/net-worth/page.tsx](/Users/mohammedzaher/projects/Wealixapp%20v2/src/app/net-worth/page.tsx)
- [src/app/budget/page.tsx](/Users/mohammedzaher/projects/Wealixapp%20v2/src/app/budget/page.tsx)
- [src/app/reports/page.tsx](/Users/mohammedzaher/projects/Wealixapp%20v2/src/app/reports/page.tsx)

## Scripts

```bash
bun run dev
bun run build
bun run start
bun run lint
```

Database-related scripts currently in `package.json`:

```bash
bun run db:push
bun run db:generate
bun run db:migrate
bun run db:reset
```

These are present in the repo, but the current app flow you are using is still centered around local persisted app state rather than a fully wired production database backend.

## Current Limits

- user financial data is not yet synced to a remote database
- OCR quality depends on the external Datalab/Chandra service and receipt image quality
- reports download as printable HTML, not true PDF
- Supabase MCP is configured for development tooling, not app runtime persistence

## Recommended Next Steps

- move persisted user data to Supabase for true cloud sync
- add server-side storage for receipts and reports
- add real subscription billing instead of local plan state
- add PDF generation for reports

## Validation

The app currently passes:

```bash
bun run lint
bun run build
```
