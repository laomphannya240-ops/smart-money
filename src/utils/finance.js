import { getCategoryMeta } from './constants'
import { monthKey } from './format'

export function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100
}

function sum(transactions, type) {
  return roundMoney(
    transactions.reduce(
      (total, transaction) =>
        transaction.type === type ? total + (Number(transaction.amount) || 0) : total,
      0,
    ),
  )
}

/** All-time figures. Savings are kept separate so transfers are never double counted. */
export function getOverallTotals(transactions = [], savingsGoals = []) {
  const totalIncome = sum(transactions, 'income')
  const totalExpenses = sum(transactions, 'expense')
  const totalSavings = roundMoney(
    savingsGoals.reduce((total, goal) => total + goalCurrent(goal), 0),
  )

  return {
    totalIncome,
    totalExpenses,
    balance: roundMoney(totalIncome - totalExpenses),
    totalSavings,
    transactionCount: transactions.length,
  }
}

export function goalCurrent(goal) {
  if (!goal) return 0
  if (Array.isArray(goal.contributions)) {
    return roundMoney(
      goal.contributions.reduce((total, item) => total + (Number(item.amount) || 0), 0),
    )
  }
  return roundMoney(goal.current || 0)
}

export function filterTransactions(transactions = [], { month, year } = {}) {
  return transactions.filter((transaction) => {
    if (!transaction.date) return false
    const parts = String(transaction.date).slice(0, 10).split('-').map(Number)
    if (year !== undefined && year !== 'all' && parts[0] !== Number(year)) return false
    if (month !== undefined && month !== 'all' && parts[1] !== Number(month) + 1) return false
    return true
  })
}

export function filterByYear(transactions = [], year) {
  if (year === 'all') return [...transactions]
  return transactions.filter(
    (transaction) => Number(String(transaction.date || '').slice(0, 4)) === Number(year),
  )
}

export function getMonthlyStats(transactions = [], savingsGoals = [], budget = {}, month, year) {
  const monthlyTransactions = filterTransactions(transactions, { month, year })
  const income = sum(monthlyTransactions, 'income')
  const expenses = sum(monthlyTransactions, 'expense')
  const limit = roundMoney(budget?.total || 0)
  const remaining = roundMoney(limit - expenses)

  return {
    income,
    expenses,
    net: roundMoney(income - expenses),
    limit,
    remaining,
    usage: limit > 0 ? roundMoney((expenses / limit) * 100) : 0,
    transactionCount: monthlyTransactions.length,
    savings: roundMoney(
      savingsGoals.reduce((total, goal) => {
        const contributions = (goal.contributions || []).filter((item) => {
          const [y, m] = String(item.date || '').slice(0, 10).split('-').map(Number)
          return y === Number(year) && m === Number(month) + 1
        })
        return total + contributions.reduce((sumItem, item) => sumItem + (Number(item.amount) || 0), 0)
      }, 0),
    ),
  }
}

export function getCategoryBreakdown(expenses = []) {
  const totals = expenses.reduce((accumulator, transaction) => {
    const category = transaction.category || 'Other'
    accumulator[category] = (accumulator[category] || 0) + (Number(transaction.amount) || 0)
    return accumulator
  }, {})

  const grandTotal = Object.values(totals).reduce((total, value) => total + value, 0)

  return Object.entries(totals)
    .map(([name, value]) => {
      const meta = getCategoryMeta('expense', name)
      return {
        name,
        labelKey: meta.labelKey,
        value: roundMoney(value),
        percent: grandTotal > 0 ? (value / grandTotal) * 100 : 0,
        color: meta.color,
        icon: meta.icon,
      }
    })
    .sort((a, b) => b.value - a.value)
}

export function getMonthlySeries(transactions = [], year) {
  const monthly = filterTransactions(transactions, { month: 'all', year })
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return monthNames.map((name, month) => {
    const items = monthly.filter((transaction) => {
      const parts = String(transaction.date || '').slice(0, 10).split('-').map(Number)
      return parts[1] === month + 1
    })
    return {
      name,
      month,
      income: sum(items, 'income'),
      expense: sum(items, 'expense'),
      net: roundMoney(sum(items, 'income') - sum(items, 'expense')),
    }
  })
}

export function getYearlySeries(transactions = []) {
  const years = [
    ...new Set(transactions.map((item) => Number(String(item.date || '').slice(0, 4))).filter(Boolean)),
  ].sort((a, b) => a - b)

  return years.map((year) => {
    const items = filterByYear(transactions, year)
    const income = sum(items, 'income')
    const expense = sum(items, 'expense')
    return { year: String(year), income, expense, net: roundMoney(income - expense) }
  })
}

export function getSavingsSeries(savingsGoals = [], year) {
  const contributions = savingsGoals.flatMap((goal) =>
    (goal.contributions || []).map((item) => ({ ...item, date: item.date })),
  )

  const beforeYear = contributions.filter(
    (item) => Number(String(item.date || '').slice(0, 4)) < Number(year),
  )
  let running = beforeYear.reduce((total, item) => total + (Number(item.amount) || 0), 0)

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return monthNames.map((name, month) => {
    const inMonth = contributions.filter((item) => {
      const parts = String(item.date || '').slice(0, 10).split('-').map(Number)
      return parts[0] === Number(year) && parts[1] === month + 1
    })
    running = roundMoney(running + inMonth.reduce((total, item) => total + (Number(item.amount) || 0), 0))
    return { name, month, savings: running }
  })
}

export function getBudgetForMonth(budgets = {}, month, year) {
  return budgets[monthKey(month, year)] || { total: 0, categories: {} }
}

export function getBudgetStatus(spent = 0, limit = 0) {
  const value = roundMoney(spent)
  const usage = limit > 0 ? (value / limit) * 100 : 0
  let status = 'safe'
  if (limit > 0 && usage > 100) status = 'over'
  else if (limit > 0 && usage >= 80) status = 'warning'
  return {
    spent: value,
    limit: roundMoney(limit),
    remaining: roundMoney(limit - value),
    usage: roundMoney(usage),
    status,
  }
}

export function getCategorySpent(expenses = []) {
  return getCategoryBreakdown(expenses).reduce((accumulator, item) => {
    accumulator[item.name] = item.value
    return accumulator
  }, {})
}

export function filterAndSortTransactions(transactions = [], filters = {}) {
  const {
    search = '',
    type = 'all',
    category = 'all',
    from = '',
    to = '',
    sort = 'newest',
  } = filters

  const query = search.trim().toLowerCase()

  const result = transactions.filter((transaction) => {
    if (query) {
      const haystack = `${transaction.title || ''} ${transaction.description || ''} ${
        transaction.source || ''
      }`.toLowerCase()
      if (!haystack.includes(query)) return false
    }
    if (type !== 'all' && transaction.type !== type) return false
    if (category !== 'all' && transaction.category !== category) return false
    if (from && String(transaction.date || '').slice(0, 10) < from) return false
    if (to && String(transaction.date || '').slice(0, 10) > to) return false
    return true
  })

  return result.sort((a, b) => {
    const comparison = String(b.date || '').localeCompare(String(a.date || ''))
    if (comparison !== 0) return sort === 'oldest' ? -comparison : comparison
    return sort === 'oldest'
      ? String(a.id).localeCompare(String(b.id))
      : String(b.id).localeCompare(String(a.id))
  })
}

export function getAvailableYears(transactions = [], savingsGoals = []) {
  const fromTransactions = transactions.map((item) => Number(String(item.date || '').slice(0, 4)))
  const fromGoals = savingsGoals.flatMap((goal) =>
    (goal.contributions || []).map((item) => Number(String(item.date || '').slice(0, 4))),
  )
  const years = [...fromTransactions, ...fromGoals, new Date().getFullYear()].filter(Boolean)
  return [...new Set(years)].sort((a, b) => b - a)
}

export function paginate(items = [], page = 1, pageSize = 8) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const start = (currentPage - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    page: currentPage,
    totalPages,
    total: items.length,
    start: items.length ? start + 1 : 0,
    end: Math.min(start + pageSize, items.length),
  }
}
