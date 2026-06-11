# Chapter 4 Prompt Pack (Final Year Project)

Use this file by copying the prompt below into ChatGPT. Fill the placeholders before sending.

---

## Prompt to Paste into ChatGPT

You are an academic writing assistant.
Write Chapter 4 (System Implementation, Testing, and Discussion of Results) for my Final Year Project using the details below.

Important requirements:
1. Use formal academic tone.
2. Write in clear sections and subsections with numbering.
3. Avoid fake metrics or fake screenshots. If data is missing, explicitly mark it as "to be inserted".
4. Keep language human and original (no plagiarism).
5. Include tables where useful.
6. Reference figures/tables as "Figure 4.x" and "Table 4.x" placeholders.
7. End with a short chapter summary.

Project details:
- Project title: [INSERT PROJECT TITLE]
- Department: [INSERT DEPARTMENT]
- Institution: [INSERT INSTITUTION]
- Student name: [INSERT YOUR NAME]
- Matric number: [INSERT MATRIC NUMBER]

System overview:
- Application name: Student Wallet
- Purpose: A student finance management web app for tracking allowance, budgets, expenses, savings goals, and alerts.
- Target users: Students managing monthly allowance and spending.

Implementation details:
- Frontend: React 19, TypeScript, Vite 7
- Framework: TanStack Start + TanStack Router
- Styling/UI: Tailwind CSS, Radix UI, Framer Motion
- Backend: Supabase (Auth, PostgreSQL, Storage)
- Validation: Zod
- Notification: Sonner toasts
- Optional AI module: OpenRouter-based receipt parsing

Implemented modules:
1. Authentication module (sign up, login, reset password)
2. Profile/onboarding module (allowance and student details)
3. Budget module (category allocations, 60/20/20 structure)
4. Expense module (add/list/delete expenses)
5. Receipt module (upload and signed-view, optional AI scan)
6. Savings goal module (target and progress tracking)
7. Alert module (75%, 90%, 100% budget notifications)
8. Dashboard and insights module

Database entities:
- profiles
- categories
- expenses
- budgets
- savings_goals
- alerts

Security controls:
- Row Level Security (RLS) policies per user
- Storage policies for user-owned receipt folders

Routes/pages implemented:
- Public: /, /auth, /contact, /faq, /how-it-works, /reset-password
- Protected: /home, /budget, /expenses, /savings, /alerts, /insights, /onboarding, /settings

Now produce Chapter 4 with this structure:

4.1 Introduction
- Briefly explain what Chapter 4 covers.

4.2 Development Environment and Tools
- Hardware and software environment.
- Languages, frameworks, libraries, and services used.

4.3 System Implementation
- Overall implementation approach.
- Subsections for each module implemented.
- Mention key UI behaviors and workflow.
- Include where relevant: API interactions and data flow.

4.4 Database Implementation
- Explain schema and table relationships.
- Explain user-data isolation and security (RLS).

4.5 Testing and Validation
- Unit/integration/manual test strategy (use what applies).
- Functional test cases in a table with columns:
  Test ID | Feature | Test Steps | Expected Result | Actual Result | Status
- Include at least 10 realistic test cases, and mark results as "Pass" or "To be validated" based on available evidence.

4.6 Results and Discussion
- Discuss what worked well.
- Discuss observed limitations/challenges.
- Discuss system performance and usability based on available evidence.

4.7 Chapter Summary
- Concise recap and transition to Chapter 5.

Also include these output add-ons:
1. A list titled "Evidence to Insert" containing placeholders I should replace with screenshots (e.g., login page, dashboard, expenses page, alerts page).
2. A list titled "Data Needed to Finalize Chapter 4" with missing items (e.g., user test counts, timing metrics, questionnaire results).

Do not invent supervisor names, institutional policies, or numeric results I did not provide.

---

## Quick Fill Checklist Before You Paste

- [ ] Project title added
- [ ] Your full name added
- [ ] Matric number added
- [ ] Institution and department added
- [ ] Any real test results/metrics added
- [ ] Screenshot filenames prepared

---

## Optional Follow-up Prompt

After ChatGPT generates Chapter 4, paste this:

Refine the chapter for originality and clarity. Keep the same structure, reduce repetition, and make the writing sound like a Nigerian undergraduate final year project report. Keep all placeholders intact and do not invent data.
