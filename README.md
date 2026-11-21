# Smart Money — Personal Finance Tracker

A premium, frontend-only personal finance dashboard built with **React + Vite + Tailwind CSS v4**. Track income, expenses, savings goals and monthly budgets with polished charts, bilingual UI, dark mode, and data that stays entirely in your browser.

> **No backend, no API, no database.** Everything runs client-side and persists in `localStorage`.

---

## Features

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
| Persistence | Browser LocalStorage |

---

## Installation & Running

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Open the URL printed by Vite (usually http://localhost:5173)
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

---

## Project Structure

```
src/
├── main.jsx                 # React root
├── App.jsx                  # Providers, routes, lazy-loaded pages
├── index.css                # Tailwind v4 theme, dark variant, reusable styles
├── assets/
│   └── logo.svg             # Brand mark
├── layouts/
│   └── AppLayout.jsx        # Sidebar + topbar + animated route outlet
├── components/
│   ├── layout/              # Sidebar, Topbar
│   ├── common/              # Button, Modal, Field, StatCard, Pagination, etc.
│   ├── transactions/        # Form, filters, list, shared manager
│   ├── savings/             # Goal form/card, contribution modal
│   ├── budgets/             # Budget form
│   └── charts/              # Bar, pie, area charts and shared tooltip
├── context/
│   ├── contexts.js          # Context object definitions
│   ├── FinanceContext.jsx   # Global data + all CRUD operations
│   ├── ToastContext.jsx     # Toast notifications
│   └── ConfirmContext.jsx   # Promise-based confirmation dialogs
├── hooks/
│   ├── useLocalStorage.js   # Reusable persistent state hook
│   ├── useFinance.js
│   ├── useI18n.js
│   ├── useToast.js
│   └── useConfirm.js
├── utils/
│   ├── constants.js         # Categories, navigation, currencies
│   ├── demoData.js          # First-visit sample data / empty data
│   ├── finance.js           # All financial calculations and filtering
│   ├── format.js            # Currency, date, CSV and download helpers
│   ├── i18n.js              # English + Khmer translations
│   └── id.js                # ID generation
└── pages/
    ├── Dashboard.jsx
    ├── Income.jsx
    ├── Expenses.jsx
    ├── Savings.jsx
    ├── Budgets.jsx
    ├── Transactions.jsx
    ├── Reports.jsx
    ├── Settings.jsx
    └── NotFound.jsx
```

---

## How LocalStorage Works

1. **Single key.** The whole application state is stored under `smart-money.v1`:
   ```js
   {
     version, createdAt, settings,
     transactions: [],
     savingsGoals: [],
     budgets: {}
   }
   ```
2. **Reusable hook.** `useLocalStorage(key, initialValue)` reads the key once using a lazy initialiser. If a value exists, it is parsed and returned unchanged — existing user data is **never overwritten on startup**.
3. **First visit only.** If the key is missing, `createDemoData()` seeds realistic sample transactions, savings goals and budgets. The sample data is generated relative to the current month, so it always looks relevant.
4. **Automatic saving.** Every add, edit, delete, settings change, budget change and savings contribution calls `setStoredData`. The hook's `useEffect` writes the new state to LocalStorage immediately, so a refresh or browser restart restores everything.
5. **No double counting.** Savings contributions live inside savings goals, never as income/expense transactions. Balance is always `income − expenses`; savings is reported separately.
6. **Backup & restore.** Settings → *Export backup (JSON)* downloads the exact stored object. *Import backup* validates the file and replaces the stored state. *Export transactions CSV* creates a spreadsheet of all transactions in the selected currency.
7. **Clear/reset.** *Clear all data* replaces the stored object with an empty one (settings preserved) and demo data will **not** reappear on reload. *Reload demo data* is an explicit action that restores sample data.

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
- Browser smoke-tested across all routes and key interactions: add/edit/delete, search, filters, pagination, savings contributions, budgets, theme/language/currency switching, CSV/JSON export, backup import, clear/reset data, and 320px mobile layout.
