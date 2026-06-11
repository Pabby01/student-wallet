# Student Wallet (Final Year Project)

Student Wallet is a web application built to help students manage allowance, track daily expenses, set savings goals, and receive budget alerts.

This project was developed as a Final Year Project and focuses on practical personal finance support for students.

## Project Scope

The system enables a student to:
- Create an account and sign in securely
- Set monthly allowance and profile details
- Manage budget categories using a 60/20/20 model (Needs/Wants/Savings)
- Record and review expenses
- Upload receipts and view them securely
- Auto-scan receipts with AI-assisted parsing
- Set and monitor savings goals
- Receive budget threshold alerts at 75%, 90%, and 100%
- View financial insights and dashboard summaries

## Core Features

### Authentication and Security
- Supabase authentication (sign up, sign in, password reset)
- Route protection for authenticated pages
- Row Level Security (RLS) on core tables

### Budgeting and Tracking
- Monthly allowance-based budgeting
- Category-level allocation and spend tracking
- Expense logging with merchant, description, date, and category
- Alerts when spending approaches/exceeds budget

### Savings and Insights
- Savings goals with target amount/date
- Home dashboard with quick summaries
- Dedicated views for budget, expenses, savings, alerts, and insights

### Receipt Support
- Receipt image upload to Supabase Storage
- Signed URL access for user-owned receipts
- Optional AI receipt extraction (OpenRouter) for amount, merchant, date, and category hint

## Routes Overview

Public routes:
- `/`
- `/auth`
- `/contact`
- `/faq`
- `/how-it-works`
- `/reset-password`

Authenticated routes:
- `/home`
- `/budget`
- `/expenses`
- `/savings`
- `/alerts`
- `/insights`
- `/onboarding`
- `/settings`

## Tech Stack

- Frontend: React 19, TypeScript, Vite 7
- App framework: TanStack Start + TanStack Router
- Styling/UI: Tailwind CSS 4, Radix UI, Framer Motion
- Backend/BaaS: Supabase (Auth, Postgres, Storage)
- Validation: Zod
- Notifications: Sonner

## Database Design (Supabase)

Main tables:
- `profiles`
- `categories`
- `expenses`
- `budgets`
- `savings_goals`
- `alerts`

Security:
- RLS policies enforce user-owned access (`auth.uid()` checks)
- Trigger creates profile row on new auth user
- Storage policies restrict receipt access to owner folder

## Local Setup

## 1) Prerequisites
- Node.js 18+ (or newer)
- npm
- Supabase project

## 2) Install dependencies

```bash
npm install
```

## 3) Configure environment variables

Create a `.env` file in project root with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_or_publishable_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_or_publishable_key
OPENROUTER_API_KEY=optional_for_receipt_ai
OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
OPENROUTER_MODEL=google/gemini-flash-1.5
```

## 4) Run the app

```bash
npm run dev
```

## 5) Build for production

```bash
npm run build
npm run preview
```

## Academic Use (Final Year Project)

This repository can be used as implementation evidence for:
- Chapter 3 (System design and methodology)
- Chapter 4 (Implementation, testing, and discussion)
- Chapter 5 (Conclusion and recommendations)

For Chapter 4 writing support, use:
- `docs/chapter-4-chatgpt-prompt.md`

## License

This project is for academic and portfolio use.
