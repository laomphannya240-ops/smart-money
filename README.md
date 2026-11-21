# Smart Money — Personal Finance Tracker

A premium, frontend-only personal finance dashboard built with **React + Vite + Tailwind CSS v4**. Track income, expenses, savings goals and monthly budgets with polished charts, bilingual UI, dark mode, and data that stays entirely in your browser.

> **No backend, no API, no database.** Everything runs client-side and persists in `localStorage`.

> **Private multi-account demo login.** Register or sign in with a Gmail address; each account keeps its own finance data in this browser. This is a client-side convenience gate, **not production-grade security** — see [Authentication](#authentication-demo).

---

## Features

### Private login & registration
- Premium, responsive sign-in and registration pages with soft-blue/white styling and Framer Motion animations
- Register with any valid Gmail address; existing accounts sign in with their password
- Show/hide password, password confirmation, "Remember Me", validation and clear error messages
- SHA-256 password digests stored locally; raw passwords are never written to source, sessions, or LocalStorage
- Each account has its own isolated finance data — signing into another account never mixes records
- Existing single-user data is automatically migrated into the configured owner account
- Every application route is protected; unauthenticated users are redirected to Login
- Sign-out controls in both the top bar and the sidebar

### Dashboard
- All-time total balance, income, expenses and savings cards
- Selected-month overview: net cash flow, transaction count, top category and budget usage
- Income vs expenses bar chart (rolling six months)
- Expense category donut chart with tooltips and legend
- Recent transactions with inline edit/delete
- Quick Add Transaction modal, month/year selector, budget warnings

### Income & Expenses
- Add, edit and delete records
- Category selection, source, date and description/note
- Live search, category filter, date range and sort
- Reusable transaction manager and form components
- Per-type summary statistics

### Savings
- Create, edit and delete savings goals
- Set target amount, color and description
- Add contributions with date and note
- Animated progress bars, completion percentage and completed badges
- Contributions are tracked separately from transactions (no double counting)

### Monthly Budget
- Set a total monthly spending limit for any month
- Set optional per-category limits
- Remaining budget, usage percentage and category-level progress
- Warning and over-budget states
- Copy a previous month's budget

### Transaction History
- Search by title, source or note
- Filter by type, category and date range
- Sort newest/oldest with pagination
- Edit/delete with toast feedback and confirmation dialogs

### Reports & Analytics
- Yearly income, expenses, net result and best month
- Monthly comparison chart and year-by-year table
- Category spending analysis
- Savings growth area chart
- Average monthly income/expense summaries

### Settings
- English ↔ Khmer language switching
- Light/dark theme
- USD/KHR currency selection (fixed rate: 1 USD = 4,000 KHR)
- Export transactions to CSV
- Export/import full JSON backup
- Reload demo data or clear all data (with confirmation)

### UX
- Responsive from 320px mobile to large desktop
- Collapsible mobile navigation
- Framer Motion page, card, chart, sidebar and modal transitions
- Toast notifications, confirm dialogs, empty states and form validation
- Route-level code splitting for a fast initial load

---

## Tech Stack

| Concern | Library |
| --- | --- |
| UI framework | React 19 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Routing | React Router DOM v7 |
| Icons | Lucide React |
| Charts | Recharts |
| Animation | Framer Motion |
| State | React Context API |
| Persistence | Browser LocalStorage / SessionStorage |
| Demo auth | Custom Context + Web Crypto SHA-256 |

---

## Installation & Running

```bash
# 1. Install dependencies
npm install

# 2. Create local owner configuration (never commit .env)
cp .env.example .env          # Windows: copy .env.example .env
npm run hash:password         # enter a password, paste the digest into .env

# 3. Start the development server
npm run dev

# 4. Open the URL printed by Vite (usually http://localhost:5173)
```

Production build and preview:

```bash
npm run build
npm run preview
```

Lint:

```bash
npm run lint
```

### Owner configuration

The local `.env` (git-ignored) seeds the owner account `laomphannya240@gmail.com` and migrates any pre-existing finance data into it. The password is stored as a SHA-256 digest and is deliberately **not** written to this README or to `.env.example`, so no plaintext credential is committed. To change it, run `npm run hash:password` and update `VITE_OWNER_PASSWORD_HASH` in `.env`.

Additional accounts are created from the in-app **Create account** page — no code or configuration changes are needed. The `.env.example` file is a safe template with placeholder values.

---

## Authentication (demo)

### Accounts

Accounts are stored in `smart-money.accounts.v1` as a map keyed by lowercase Gmail address:

```js
{
  "you@gmail.com": {
    email: "you@gmail.com",
    passwordHash: "<64-char sha256 hex>",
    createdAt: "2026-11-22T00:00:00.000Z"
  }
}
```

- **Registration** (`/register`) accepts any valid `@gmail.com` address, requires a password of at least 8 characters, confirms it, and rejects duplicates. It signs the new account in automatically.
- **Login** (`/login`) checks the address against the account registry and verifies the password digest. Unknown addresses, wrong passwords and non-Gmail addresses get distinct error messages.
- Passwords are hashed with SHA-256 before storage. No plaintext password is ever persisted.
- The owner account defined by `VITE_OWNER_EMAIL` / `VITE_OWNER_PASSWORD_HASH` is seeded automatically on first load.

### Per-account data & migration

Each account's finance records live under their own LocalStorage key: `smart-money.data.v1.<email>`.

- On first load, the legacy single-user `smart-money.v1` payload is copied into the owner account's key. The original key is left in place as a backup — nothing is deleted.
- New accounts start with empty data.
- Signing out and into a different account swaps the active data key; records never leak between accounts.
- Settings such as theme, language and currency are per account too.

### Session behaviour

| Remember Me | Storage used | Lifetime |
| --- | --- | --- |
| Off (default) | `sessionStorage` | Ends with the current tab/browser session |
| On | `localStorage` | Persists across refreshes and browser restarts |

A session stores only the account email, the `remember` flag and an issue timestamp — never a password. On startup, sessions are checked against the account registry; invalid entries are discarded.

### Routing

- Unauthenticated visits to any application route redirect to `/login`, remembering the attempted URL.
- After a successful sign-in, the app returns to that URL (or the Dashboard if the user came directly to `/login` or `/register`).
- Authenticated users who visit `/login` or `/register` are redirected to the Dashboard.
- Sign-out is available from the top bar and the sidebar; it clears both storages and returns to `/login`.
- `/register` is a public page; every other route is protected.

### Security disclaimer

> **A frontend-only application cannot securely protect credentials.** Account digests are readable through browser developer tools, and anyone with access to this browser can inspect or edit every account's LocalStorage data. Client-side route guards can also be bypassed. Passwords are hashed only to keep them out of source and plain sight — this is **not** production-grade authentication.

For a genuinely private deployment, use a real authentication provider that keeps secrets on a server — for example **Firebase Authentication with Google sign-in restricted to an allowlisted Gmail account**, or Supabase/Auth0/a custom backend — and enforce authorization and per-user data access server-side. This demo is suitable only for personal, low-risk, local use.

---

## Project Structure

```
src/
├── main.jsx                 # React root
├── App.jsx                  # Providers, public/protected routes, lazy pages
├── index.css                # Tailwind v4 theme, dark variant, reusable styles
├── assets/
│   └── logo.svg             # Brand mark
├── layouts/
│   └── AppLayout.jsx        # Sidebar + topbar + animated route outlet
├── components/
│   ├── auth/                # ProtectedRoute, shared auth styles
│   ├── layout/              # Sidebar, Topbar (with sign-out)
│   ├── common/              # Button, Modal, Field, StatCard, Pagination, etc.
│   ├── transactions/        # Form, filters, list, shared manager
│   ├── savings/             # Goal form/card, contribution modal
│   ├── budgets/             # Budget form
│   └── charts/              # Bar, pie, area charts and shared tooltip
├── context/
│   ├── contexts.js          # Context object definitions
│   ├── AuthContext.jsx      # Account sessions, login/register/logout
│   ├── FinanceContext.jsx   # Global data + all CRUD operations
│   ├── ToastContext.jsx     # Toast notifications
│   └── ConfirmContext.jsx   # Promise-based confirmation dialogs
├── hooks/
│   ├── useAuth.js
│   ├── useLocalStorage.js   # Reusable persistent state hook
│   ├── useFinance.js
│   ├── useI18n.js
│   ├── useToast.js
│   └── useConfirm.js
├── utils/
│   ├── auth.js              # Owner config, Gmail validation, hashing
│   ├── accounts.js          # Account registry, sessions, data keys, migration
│   ├── crypto.js            # SHA-256 (Web Crypto with JS fallback)
│   ├── constants.js         # Categories, navigation, currencies
│   ├── demoData.js          # First-visit sample data / empty data
│   ├── finance.js           # All financial calculations and filtering
│   ├── format.js            # Currency, date, CSV and download helpers
│   ├── i18n.js              # English + Khmer translations
│   └── id.js                # ID generation
├── pages/
│   ├── Login.jsx            # Sign-in page
│   ├── Register.jsx         # Public Gmail registration page
│   ├── Dashboard.jsx
│   ├── Income.jsx
│   ├── Expenses.jsx
│   ├── Savings.jsx
│   ├── Budgets.jsx
│   ├── Transactions.jsx
│   ├── Reports.jsx
│   ├── Settings.jsx
│   └── NotFound.jsx
scripts/
└── generate-password-hash.mjs  # Owner password digest helper
.env.example                 # Example owner configuration
```

---

## How LocalStorage Works

1. **Per-account data keys.** Each account's finance state is stored under `smart-money.data.v1.<email>`:
   ```js
   {
     version, createdAt, settings,
     transactions: [],
     savingsGoals: [],
     budgets: {}
   }
   ```
2. **Reusable hook.** `useLocalStorage(key, initialValue)` reads the key once using a lazy initialiser. If a value exists, it is parsed and returned unchanged — existing user data is **never overwritten on startup**.
3. **Legacy migration.** The old single-user `smart-money.v1` payload is copied once into the owner account's key and kept as a backup. New accounts get empty data; the guest key is only used before sign-in.
4. **Automatic saving.** Every add, edit, delete, settings change, budget change and savings contribution calls `setStoredData`. The hook's `useEffect` writes the new state to LocalStorage immediately, so a refresh or browser restart restores everything.
5. **No double counting.** Savings contributions live inside savings goals, never as income/expense transactions. Balance is always `income − expenses`; savings is reported separately.
6. **Backup & restore.** Settings → *Export backup (JSON)* downloads the exact stored object. *Import backup* validates the file and replaces the stored state. *Export transactions CSV* creates a spreadsheet of all transactions in the selected currency.
7. **Clear/reset.** *Clear all data* replaces the stored object with an empty one (settings preserved) and demo data will **not** reappear on reload. *Reload demo data* is an explicit action that restores sample data.
8. **Account and session keys.** `smart-money.accounts.v1` holds account records with password digests, and `smart-money.auth.v1` holds the active session in either `sessionStorage` or `localStorage`. Both are independent of finance data and the session is removed on sign-out.

### Calculation rules

All amounts are stored in **USD base units** and converted for display using the selected currency. Money entered in KHR is converted back to USD before saving, which keeps totals consistent across currency changes.

- `Total Income` = sum of all income transactions
- `Total Expenses` = sum of all expense transactions
- `Available Balance` = `Total Income − Total Expenses`
- `Total Savings` = sum of all savings goal contributions
- `Monthly Expenses` = expenses within the selected month and year
- `Remaining Budget` = `Monthly Budget − Monthly Expenses`

All dashboard and report figures are calculated dynamically from stored records — there are no hardcoded financial totals.

---

## Verification

- `npm run lint` — no warnings or errors
- `npm run build` — successful production build
- Browser smoke-tested across all routes and key interactions: add/edit/delete, search, filters, pagination, savings contributions, budgets, theme/language/currency switching, CSV/JSON export, backup import, clear/reset data, and 320px mobile layout
- Authentication smoke-tested: owner login with configured password, legacy data migration into the owner account, registration validation (non-Gmail, short password, mismatch, duplicate), auto sign-in after registration, password hashing with no plaintext storage, unknown-account and wrong-password rejection, per-account data isolation, Remember Me in `localStorage` vs `sessionStorage`, refresh persistence, sign-out, protected-route redirect, zero console errors, and login/register layouts at 320px / 768px / 1440px
