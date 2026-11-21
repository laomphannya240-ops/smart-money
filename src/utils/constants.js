import {
  ArrowDownLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  CarFront,
  ChartNoAxesCombined,
  CircleEllipsis,
  Clapperboard,
  FileText,
  Gift,
  GraduationCap,
  HeartPulse,
  Laptop,
  LayoutDashboard,
  PiggyBank,
  ReceiptText,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  TrendingUp,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react'

export const STORAGE_KEY = 'smart-money.v1'
export const USD_TO_KHR = 4000

export const EXPENSE_CATEGORIES = [
  { id: 'Food', labelKey: 'cat.food', color: '#f59e0b', icon: UtensilsCrossed },
  { id: 'Transportation', labelKey: 'cat.transportation', color: '#3b82f6', icon: CarFront },
  { id: 'Shopping', labelKey: 'cat.shopping', color: '#8b5cf6', icon: ShoppingBag },
  { id: 'Education', labelKey: 'cat.education', color: '#14b8a6', icon: GraduationCap },
  { id: 'Entertainment', labelKey: 'cat.entertainment', color: '#ec4899', icon: Clapperboard },
  { id: 'Bills', labelKey: 'cat.bills', color: '#ef4444', icon: ReceiptText },
  { id: 'Healthcare', labelKey: 'cat.healthcare', color: '#06b6d4', icon: HeartPulse },
  { id: 'Other', labelKey: 'cat.other', color: '#64748b', icon: CircleEllipsis },
]

export const INCOME_CATEGORIES = [
  { id: 'Salary', labelKey: 'cat.salary', color: '#2563eb', icon: BriefcaseBusiness },
  { id: 'Freelance', labelKey: 'cat.freelance', color: '#0ea5e9', icon: Laptop },
  { id: 'Business', labelKey: 'cat.business', color: '#7c3aed', icon: Wallet },
  { id: 'Investments', labelKey: 'cat.investments', color: '#10b981', icon: TrendingUp },
  { id: 'Gifts', labelKey: 'cat.gifts', color: '#f472b6', icon: Gift },
  { id: 'Other', labelKey: 'cat.other', color: '#64748b', icon: CircleEllipsis },
]

export const CATEGORIES = {
  expense: EXPENSE_CATEGORIES,
  income: INCOME_CATEGORIES,
}

export function getCategoryMeta(type, id) {
  const list = CATEGORIES[type] || []
  return list.find((category) => category.id === id) || list[list.length - 1] || {
    id: id || 'Other',
    labelKey: 'cat.other',
    color: '#64748b',
    icon: CircleEllipsis,
  }
}

export const NAV_ITEMS = [
  { path: '/', key: 'nav.dashboard', icon: LayoutDashboard },
  { path: '/income', key: 'nav.income', icon: ArrowDownLeft },
  { path: '/expenses', key: 'nav.expenses', icon: ArrowUpRight },
  { path: '/savings', key: 'nav.savings', icon: PiggyBank },
  { path: '/budgets', key: 'nav.budgets', icon: SlidersHorizontal },
  { path: '/transactions', key: 'nav.transactions', icon: FileText },
  { path: '/reports', key: 'nav.reports', icon: ChartNoAxesCombined },
  { path: '/settings', key: 'nav.settings', icon: Settings },
]

export const CURRENCIES = [
  { id: 'USD', label: 'US Dollar', symbol: '$', decimals: 2 },
  { id: 'KHR', label: 'Khmer Riel', symbol: '៛', decimals: 0 },
]

export const GOAL_COLORS = [
  '#2563eb',
  '#0ea5e9',
  '#14b8a6',
  '#8b5cf6',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#64748b',
]

export const MONTH_KEYS = Array.from({ length: 12 }, (_, index) => index)

export const PIE_COLORS = EXPENSE_CATEGORIES.map((category) => category.color)
