# Choicely

Choicely is a decision-support web application. Users describe a situation, optionally add a specific choice, and the app returns an AI-generated analysis, a short summary, a score, and keeps a history of past requests.

## Main Features

- Authentication with NextAuth.
- Sign up, login, and email verification.
- Situation analysis through an OpenAI-compatible API routed through Hugging Face.
- Storage of analyses, questions, scores, and summaries in a PostgreSQL database.
- Dashboard, history, and simulation pages.
- Next.js interface built with React, Tailwind CSS, Radix UI, Framer Motion, and lucide-react.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Prisma 5
- PostgreSQL / Neon
- NextAuth v5 beta
- Tailwind CSS 4
- ESLint

## Requirements

- A recent Node.js version
- npm
- An accessible PostgreSQL database
- The required API keys for authentication, email, and AI analysis

## Installation

Install the dependencies:

```bash
npm install
```

Generate the Prisma client if needed:

```bash
npx prisma generate
```

Apply the local database migrations:

```bash
npx prisma migrate dev
```

Start the development server:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

## Configuration

Create a `.env.local` file at the root of the project. The project uses the following environment variables:

```env
DATABASE_URL=
SHADOW_DATABASE_URL=
AUTH_SECRET=
EMAIL_SERVER=
EMAIL_FROM=
RESEND_API_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
HUGGINGFACE_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Never commit `.env` or `.env.local` files, because they contain sensitive information.

## Available Scripts

```bash
npm run dev
```

Starts the application in development mode.

```bash
npm run build
```

Builds the application for production.

```bash
npm run start
```

Starts the production build after compilation.

```bash
npm run lint
```

Runs ESLint on the codebase.

## Project Structure

```text
app/                       Next.js App Router directory
app/page.tsx               Public landing page
app/layout.tsx             Root layout shared by the whole app
app/ClientLayout.tsx       Client-side wrapper used by the layout
app/globals.css            Global styles
app/loading.tsx            Global loading UI

app/dashboard/page.tsx     Dashboard route; renders the sidebar and main dashboard
app/historic/page.tsx      History page
app/simulation/page.tsx    Simulation page
app/account/page.tsx       User account page

app/auth/login/page.tsx    Login page
app/auth/signup/page.tsx   Signup page
app/auth/verify/page.tsx   Email verification page

app/Components/Home/       Dashboard-specific UI components
components/                Shared UI components
lib/                       Shared utilities, including database access
prisma/                    Prisma schema and database migrations
public/                    Public assets

auth.ts                    NextAuth configuration
proxy.ts              Route protection and routing middleware
```

## Application Architecture

The application is organized around the Next.js App Router. Pages live in `app/`, while API endpoints are implemented as route handlers under `app/api/`.

### Dashboard

The dashboard entry point is:

```text
app/dashboard/page.tsx
```

This page is intentionally small. It composes the two main dashboard blocks:

- `app/Components/Home/sidebar.tsx`
- `app/Components/Home/dashbordmain.tsx`

`sidebar.tsx` manages the main navigation. It displays links to the dashboard, simulations, history, and account pages. It also handles the mobile menu state and user logout through NextAuth.

`dashbordmain.tsx` is the main dashboard controller. It manages the dashboard state, loads the latest user data, displays recent analyses, renders the score chart, opens the analysis modal, shows AI results, and refreshes the dashboard after a new analysis.

The dashboard fetches data from:

- `/api/bilan/last` to get the latest AI summary.
- `/api/analyse` to get the latest questions.
- `/api/scores` to get all user scores for the chart.
- `/api/bilan` after a new analysis to generate a new summary.

### Analysis Flow

The analysis modal is handled by:

```text
app/Components/Home/situationrequest.tsx
```

This component collects the user's situation and optional choice, then sends a `POST` request to:

```text
app/api/analyse/route.ts
```

The analysis route checks the current session, calls the Hugging Face router through the OpenAI-compatible client, generates the main answer, creates a short title, calculates a score, then saves the result in the database.

When the analysis succeeds, the result is displayed by:

```text
app/Components/Home/result_ia.tsx
```

After that, the dashboard sends the analysis result to:

```text
app/api/bilan/route.ts
```

This route uses the current analysis plus the latest saved propositions to generate a short strategic summary for the user dashboard.

### API Routes

```text
app/api/analyse/route.ts
```

Handles the core AI analysis. `GET` returns the latest user questions. `POST` creates a new analysis, summary, score, and database entries.

```text
app/api/bilan/route.ts
```

Generates and stores a dashboard summary based on the current analysis and recent analysis history.

```text
app/api/bilan/last/route.ts
```

Returns the latest saved summary for the authenticated user.

```text
app/api/scores/route.ts
```

Returns all saved question scores for the authenticated user, ordered by creation date. The dashboard uses this data to render the score progression chart.

```text
app/api/predict/route.ts
```

Generates structured JSON for the simulation feature, including table rows and map nodes.

```text
app/api/auth/signup/route.ts
```

Creates a user account, hashes the password with bcrypt, creates an email verification token, and sends the verification email with Resend.

```text
app/api/auth/[...nextauth]/route.ts
```

Exposes the NextAuth route handler.

```text
app/api/verify-email/route.ts
```

Validates an email verification token and marks the user email as verified.

### Shared Utilities

```text
lib/db.ts
```

Creates and exports the Prisma client. In this project, Prisma is configured with the Neon adapter when `DATABASE_URL` is available.

```text
lib/limiter.ts
```

Contains rate-limiting utilities.

```text
lib/utils.ts
```

Contains shared helper functions used by UI components.

### UI Components

```text
components/GoogleButton.tsx
```

Reusable Google authentication button.

```text
components/ui/
```

Shared UI primitives such as buttons, cards, separators, skeletons, and spotlight effects.

## Database

The Prisma schema defines:

- `User`, `Account`, `Session`, and `VerificationToken` for authentication.
- `Proposition` for saved AI responses.
- `Question` for recent questions and their scores.
- `Bilan` for user summaries.

To open Prisma Studio:

```bash
npx prisma studio
```

## Load Testing

The repository includes files dedicated to load testing:

- `k6.js`
- `load-test.c`
- `loadtester.exe`

Update the URLs and parameters before running a test against a target environment.

## Development Notes

This project uses Next.js 16. Before changing sensitive Next.js APIs, check the local documentation in `node_modules/next/dist/docs/`, because this version may differ from older Next.js versions.
