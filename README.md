# PhishGuard — AI Phishing Detection Platform

A Next.js application for static phishing-risk analysis of URLs and messages, with Supabase authentication and per-user analysis history.

## Requirements

- Node.js 18.17+ (Node 20 LTS recommended)
- npm 9+
- A Supabase project

## Setup

1. Open this project folder in VS Code.
2. Install dependencies:

```bash
npm install
```

3. Create `.env.local` in the project root from `.env.example` and set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

4. Apply `supabase/migrations/20261005065237_create_analyses_table.sql` to your Supabase project.
5. Start the app:

```bash
npm run dev
```

6. Open `http://localhost:3000`.

## Checks

```bash
npm run typecheck
npm run build
```

## Main flows

- Register / login / logout through Supabase Auth.
- Analyze a URL with HTTP/HTTPS normalization and static phishing indicators.
- Analyze email/SMS/message text for phishing and social-engineering indicators.
- Save each authenticated user's analysis to the `analyses` table.
- View, filter, inspect, and delete the user's own analysis history.
- Dashboard and insights are protected by authentication and Supabase RLS.

## Important

This application performs static analysis only. It does not visit or execute external URLs.
Never commit `.env.local` or real Supabase credentials to source control.
