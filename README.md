# SaveX — Smart Expense Tracker

> **Tagline:** Your Money. Your Goals. Your Future.  
> **Product Category:** Smart Personal Finance & Expense Management Platform

SaveX is a full-stack, responsive, and secure financial management platform built using React.js, Node.js, Express.js, and MongoDB. Designed with mathematical precision (integer minor-unit financial accounting) and a calm, trustworthy light fintech design system, SaveX empowers students, professionals, families, and freelancers to manage their income, expenses, accounts, budgets, and savings goals.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Folder Structure](#folder-structure)
6. [Prerequisites](#prerequisites)
7. [Installation & Setup](#installation--setup)
8. [Database Configuration](#database-configuration)
9. [Environment Configuration](#environment-configuration)
10. [Running the Application](#running-the-application)
11. [Testing Instructions](#testing-instructions)
12. [API Endpoint Documentation](#api-endpoint-documentation)
13. [Database Schema Overview](#database-schema-overview)
14. [Financial Calculation Engine & Rules](#financial-calculation-engine--rules)
15. [Security & Privacy Measures](#security--privacy-measures)
16. [Deployment Guide](#deployment-guide)
17. [Screenshots](#screenshots)
18. [Known Limitations & Future Enhancements](#known-limitations--future-enhancements)

---

## 1. Project Overview

SaveX provides a complete, cohesive fintech experience:
- **Zero float discrepancy:** Uses integer minor units (paise/cents) to eliminate binary floating-point errors (e.g. `0.1 + 0.2 != 0.3`).
- **Strict accounting rules:** Transfers between accounts never inflate income or expense totals; refunds cleanly offset recognized spending.
- **Explainable financial insights:** Rule-based anomaly detection explains why an insight was generated, backed by authentic transaction data.
- **Built-in local DB fallback:** In development and automated testing, SaveX automatically launches an in-memory database instance if local MongoDB or Atlas is not yet configured, allowing immediate zero-friction execution.

---

## 2. Key Features

- **Dashboard & Analytics:** Real-time KPI summary tiles (Available Balance, Recognized Income, Expenses, Net Cash Flow, Savings Rate %), interactive Recharts monthly income vs. expense cash flow, and category expenditure distribution.
- **Transaction Management:** Full CRUD for Income, Expense, Transfer, and Refund transactions with pagination, multi-field search (description, merchant, notes), filtering, and 1-click duplication.
- **Multi-Account Tracking:** Bank accounts, savings vaults, credit cards, cash, and digital wallets with opening and current balance ledgers.
- **Budgets & Threshold Warnings:** Weekly, monthly, and yearly budgets with visual progress indicators and automatic alerts at 50%, 75%, 90%, and 100% capacity.
- **Savings Goals & Ledgers:** Visual milestone rings, priority ratings, target completion dates, and contribution/withdrawal ledgers with optional bank account deductions.
- **Recurring Payments & Bills:** Daily, weekly, monthly, and yearly recurring schedules with leap-year and month-end safe recurrence math and 1-click execution.
- **Financial Calendar:** Monthly interactive calendar grid visualizing daily income, posted expenses, and due bills.
- **CSV Import & Protected Export:** Drag-and-drop CSV upload, column mapping preview, duplicate candidate detection, and formula-injection-protected CSV exports.
- **SaveX Smart Assistant:** AI-powered and rule-based natural language assistant answering questions about spending, budgets, and month-over-month comparisons.
- **Shared & Family Finances:** Manage household member roles and permissions while keeping personal accounts privately isolated.
- **User Settings & Data Lifecycle:** Currency selection, password changes, JSON data archive export, and permanent account deletion.

---

## 3. Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Routing:** React Router v6
- **State & Context:** React Context API (`AuthContext`, `ToastContext`)
- **HTTP Client:** Axios (with Bearer token interceptor)
- **Visualizations:** Recharts (BarChart, PieChart, ResponsiveContainer)
- **Icons:** Lucide React
- **Design System:** CSS Custom Properties / Modern CSS (Inter typography, WCAG 2.2 AA compliant contrast, responsive flexbox & grid)

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js (RESTful API versioned under `/api/v1`)
- **Database ODM:** Mongoose 8
- **Authentication:** JWT with bcryptjs password hashing (10 salt rounds)
- **Security:** Helmet, CORS origin whitelist, Express Rate Limit, CSV sanitizer
- **File Uploads:** Multer & csv-parser
- **Dev/Test Persistence:** `mongodb-memory-server` with automated dev fallback

---

## 4. System Architecture

```text
┌────────────────────────────────────────────────────────┐
│               Client Application (React + Vite)        │
│    - Public Website & Auth Pages                       │
│    - Authenticated Shell: Dashboard, Ledgers, Reports   │
│    - Context API: AuthState, Toasts, Preferences       │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / JSON (Axios)
                            │ Bearer Token in Headers
┌───────────────────────────▼────────────────────────────┐
│              Backend REST API (Node + Express)         │
│    - Security Middleware: Helmet, CORS, RateLimiter    │
│    - Auth Middleware: JWT Verification & Audit Logs    │
│    - REST Controllers & Routers (/api/v1/*)            │
│    - Central Calculation & Insights Engine             │
└───────────────────────────┬────────────────────────────┘
                            │ Mongoose ODM
┌───────────────────────────▼────────────────────────────┐
│           MongoDB Database (Atlas / Local / In-Memory) │
│    - Users, Accounts, Transactions, Budgets            │
│    - SavingsGoals, RecurringSchedules, Notifications   │
└────────────────────────────────────────────────────────┘
```

---

## 5. Folder Structure

```text
savex/
├── client/
│   ├── public/
│   │   └── logo.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # StatCard, Modal, EmptyState, LoadingSpinner
│   │   │   ├── layout/         # Navbar, Sidebar, Header, Footer, AppLayout
│   │   │   ├── charts/         # CashFlowChart, CategoryPieChart
│   │   │   └── transactions/   # TransactionModal
│   │   ├── pages/
│   │   │   ├── public/         # LandingPage, AboutPage, FeaturesPage, FaqPage, PrivacyPage, TermsPage
│   │   │   ├── auth/           # LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, OnboardingPage
│   │   │   └── app/            # DashboardPage, TransactionsPage, AccountsPage, BudgetsPage,
│   │   │                       # CategoriesPage, GoalsPage, RecurringPage, BillsPage,
│   │   │                       # InsightsPage, ReportsPage, CalendarPage, SharedPage,
│   │   │                       # ImportExportPage, SettingsPage, HelpPage
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── services/           # api.js
│   │   ├── utils/              # constants.js, formatters.js
│   │   ├── styles/             # index.css, tokens.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/             # env.js, db.js
│   │   ├── models/             # User, Account, Transaction, Category, Budget, SavingsGoal, RecurringTransaction, Notification, AuditEvent
│   │   ├── controllers/        # auth, account, transaction, category, budget, goal, recurring, analytics, report, importExport, ai, user, notification
│   │   ├── routes/             # authRoutes, accountRoutes, transactionRoutes, etc.
│   │   ├── middleware/         # authMiddleware, rateLimiter, errorHandler
│   │   ├── services/           # calculationService, recurringService, insightsEngine, csvService, aiService
│   │   ├── utils/              # currency.js, errors.js, logger.js, seedCategories.js
│   │   ├── tests/              # financial.test.js, api.test.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   ├── .env
│   └── package.json
├── package.json                # Root monorepo orchestration
├── .gitignore
└── README.md
```

---

## 6. Prerequisites

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **Git**

---

## 7. Installation & Setup

Clone the repository and install all dependencies:

```bash
cd savex
npm run install:all
```

This single command installs root dependencies, server dependencies, and client dependencies.

---

## 8. Database Configuration

### Option A: MongoDB Atlas (Recommended for Production)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Obtain your connection URI: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/savex?retryWrites=true&w=majority`
3. Paste the connection URI into `server/.env` under `MONGODB_URI`.

### Option B: Local MongoDB
Ensure `mongod` is running on your machine:
```text
MONGODB_URI=mongodb://127.0.0.1:27017/savex
```

### Option C: Zero-Config In-Memory Database (Development & Testing)
If `MONGODB_URI` is left unconfigured or an external MongoDB instance is unreachable during local development, SaveX automatically launches an in-memory database using `mongodb-memory-server`.

---

## 9. Environment Configuration

Copy the example file to `.env`:

```bash
cp server/.env.example server/.env
```

`server/.env` variables:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/savex
JWT_SECRET=savex_super_secure_jwt_dev_secret_key_2026_finance
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=
```

---

## 10. Running the Application

### Run Client & Server Simultaneously
```bash
npm run dev
```

### Run Server Independently
```bash
npm run dev:server
# or
cd server && npm run dev
```
Backend runs on: `http://localhost:5000` (Health check: `http://localhost:5000/api/health`)

### Run Client Independently
```bash
npm run dev:client
# or
cd client && npm run dev
```
Frontend runs on: `http://localhost:5173`

---

## 11. Testing Instructions

SaveX includes an automated test suite verifying financial calculations, minor-unit conversions, month-end recurrence snapping, leap years, user authentication, and cross-user data isolation.

Execute the backend test suite:
```bash
npm test
# or
cd server && npm test
```

Build the production frontend bundle:
```bash
npm run build
# or
cd client && npm run build
```

---

## 12. API Endpoint Documentation

All endpoints are versioned under `/api/v1` and protected with JWT Bearer authentication (except public auth & health check):

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check endpoint |
| `POST` | `/api/v1/auth/register` | Register new user |
| `POST` | `/api/v1/auth/login` | Log in and receive JWT token |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile |
| `PATCH` | `/api/v1/auth/onboarding` | Complete onboarding configuration |
| `GET` | `/api/v1/accounts` | List user accounts and net worth |
| `POST` | `/api/v1/accounts` | Create account |
| `PATCH` | `/api/v1/accounts/:id/archive` | Toggle account archive status |
| `GET` | `/api/v1/transactions` | Query transactions (filters & pagination) |
| `POST` | `/api/v1/transactions` | Record transaction & atomically update balances |
| `PATCH` | `/api/v1/transactions/:id` | Edit transaction & recalculate balance delta |
| `DELETE` | `/api/v1/transactions/:id` | Delete transaction & revert balance impact |
| `POST` | `/api/v1/transactions/:id/duplicate` | Duplicate an existing transaction |
| `GET` | `/api/v1/budgets` | Fetch budgets with actual spending & utilization |
| `POST` | `/api/v1/budgets` | Create budget |
| `GET` | `/api/v1/goals` | Fetch savings goals with progress percentages |
| `POST` | `/api/v1/goals/:id/contributions` | Record goal contribution (with optional account debit) |
| `POST` | `/api/v1/goals/:id/withdraw` | Withdraw from goal |
| `GET` | `/api/v1/recurring` | List recurring payment schedules |
| `POST` | `/api/v1/recurring/:id/process` | Post current occurrence idempotently |
| `GET` | `/api/v1/analytics/summary` | Consolidated period KPI metrics |
| `GET` | `/api/v1/analytics/cash-flow` | 6-month cash flow trend data |
| `GET` | `/api/v1/analytics/categories` | Category expenditure distribution |
| `POST` | `/api/v1/ai/chat` | Query SaveX Smart Assistant |
| `GET` | `/api/v1/ai/insights` | Fetch rule-based explainable insights |
| `POST` | `/api/v1/import-export/import/preview` | Upload and preview CSV transactions |
| `POST` | `/api/v1/import-export/import/confirm` | Commit validated CSV import |
| `GET` | `/api/v1/import-export/export/transactions` | Download sanitized transactions CSV |

---

## 13. Database Schema Overview

- **User:** Identity, hashed password, preferred currency, timezone, accessibility preferences, notification settings.
- **Account:** Multi-account ledger with opening balance, current balance, institution name, color accent, and archive status.
- **Transaction:** Type (`income`, `expense`, `transfer`, `refund`), amount, currency, account reference, destination account, category reference, merchant, notes.
- **Budget:** Spending limit, period (`monthly`, `weekly`, `yearly`), category reference, alert thresholds.
- **SavingsGoal:** Target amount, current amount, target date, priority, and embedded contribution ledger.
- **RecurringTransaction:** Recurrence frequency, next due date, last processed date, account, and status.
- **Notification:** In-app alerts for budget threshold breaches, bill reminders, and goal milestones.
- **AuditEvent:** Security log for logins, password updates, and data exports.

---

## 14. Financial Calculation Engine & Rules

1. **Integer Minor Units:** All internal monetary amounts are stored and calculated in minor units (`paise`/`cents`).
2. **Net Cash Flow:** $\text{Net Cash Flow} = \text{Recognized Income} - \text{Recognized Expenses}$.
3. **Savings Rate:** $\text{Savings Rate} = \frac{\text{Recognized Income} - \text{Recognized Expenses}}{\text{Recognized Income}} \times 100$.
4. **Account Transfers:** Debits source account and credits destination account. Explicitly excluded from income and expenses to avoid double-counting.
5. **Refunds:** Offsets recognized expense on the account rather than artificially inflating total income.
6. **Budget Utilization:** $\text{Utilization} = \frac{\text{Eligible Spending}}{\text{Limit}} \times 100$.

---

## 15. Security & Privacy Measures

- **Password Hashing:** Passwords hashed with `bcryptjs` using 10 salt rounds. Plaintext passwords are never saved.
- **Authentication:** Signed JWT tokens with expiry checks.
- **Data Isolation:** All database queries strictly scope records by `owner: req.user._id`. Users cannot view or modify another user's records.
- **CSV Formula Injection Defense:** Exported CSV content escapes leading `=, +, -, @` characters with apostrophes to protect spreadsheet users.
- **Rate Limiting:** Dedicated rate limiting protects against authentication brute-force attacks.
- **Data Portability & Right to Erasure:** Full JSON export and permanent account deletion available directly from User Settings.

---

## 16. Deployment Guide

### Frontend Deployment (Vercel / Netlify / Render)
1. Set build command: `npm run build`
2. Set publish directory: `dist`
3. Configure environment variable: `VITE_API_URL` pointing to backend domain.

### Backend Deployment (Render / Railway / Fly.io / AWS ECS)
1. Set start command: `npm start`
2. Set required environment variables:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `MONGODB_URI=mongodb+srv://...`
   - `JWT_SECRET=your_32_character_minimum_random_secret`
   - `CLIENT_URL=https://your-frontend-domain.com`

---

## 17. Screenshots

| Public Landing Page | Financial Dashboard |
|---|---|
| Light fintech hero with live demo cards | Real-time KPI tiles and Recharts graphs |

*(Add screenshots of your deployed instance by placing PNG files into `docs/screenshots/`)*

---

## 18. Known Limitations & Future Enhancements

- **Bank Sync (Open Banking / Plaid):** SaveX currently uses CSV statement import and manual logging to maintain zero-third-party data tracking. Future versions may provide opt-in read-only bank API sync.
- **OCR Receipt Scanning:** Planned future integration using client-side image recognition to extract totals directly from receipt photos.
- **Multi-Currency Conversion:** Currently tracks separate currency accounts natively; future releases will support live FX rate conversion.

---

*SaveX — Your Money. Your Goals. Your Future.*
