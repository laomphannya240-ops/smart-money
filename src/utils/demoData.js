import { createId } from './id'
import { roundMoney } from './finance'
import { monthKey } from './format'

const pad = (value) => String(value).padStart(2, '0')

function isoDate(year, month, day) {
  const lastDay = new Date(year, month + 1, 0).getDate()
  return `${year}-${pad(month + 1)}-${pad(Math.min(day, lastDay))}`
}

function recentMonths(count = 6) {
  const now = new Date()
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1)
    return {
      month: date.getMonth(),
      year: date.getFullYear(),
      isCurrent: index === 0,
      maxDay: index === 0 ? now.getDate() : new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
    }
  })
}

const expenseTemplates = [
  [2, 'Bills', 'Rent', 920],
  [3, 'Food', 'Weekly groceries', 96.4],
  [5, 'Transportation', 'Fuel', 52],
  [7, 'Shopping', 'Home supplies', 38.5],
  [9, 'Bills', 'Internet & utilities', 76],
  [11, 'Food', 'Lunch with team', 26.8],
  [13, 'Entertainment', 'Movie night', 29],
  [15, 'Healthcare', 'Pharmacy', 21.5],
  [18, 'Education', 'Online course', 45],
  [21, 'Food', 'Dinner out', 34.6],
  [24, 'Transportation', 'Public transport', 18],
  [27, 'Shopping', 'Clothing', 62.3],
]

const incomeTemplates = [
  [1, 'Salary', 'Monthly salary', 3200, 'Acme Studio'],
  [12, 'Freelance', 'Website project', 480, 'Freelance client'],
  [22, 'Investments', 'Dividend payout', 120, 'Brokerage'],
]

/** Sample data is only created when no saved data exists (first visit). */
export function createDemoData() {
  const now = new Date()
  const months = recentMonths(6)
  const transactions = []

  months.forEach((period, index) => {
    incomeTemplates.forEach(([day, category, title, amount, source], incomeIndex) => {
      if (index > 0 && incomeIndex === 2 && index % 2 !== 0) return
      if (period.isCurrent && day > period.maxDay) return
      transactions.push({
        id: createId('tx'),
        type: 'income',
        title,
        category,
        amount: roundMoney(amount + (index > 0 ? index * 8 : 0)),
        date: isoDate(period.year, period.month, Math.min(day, period.maxDay)),
        source,
        description: index === 0 ? 'Monthly earning' : '',
        createdAt: new Date().toISOString(),
      })
    })

    expenseTemplates.forEach(([day, category, title, amount]) => {
      if (period.isCurrent && day > period.maxDay) return
      const variation = 1 + ((index + day) % 5) * 0.035
      transactions.push({
        id: createId('tx'),
        type: 'expense',
        title,
        category,
        amount: roundMoney(amount * variation),
        date: isoDate(period.year, period.month, Math.min(day, period.maxDay)),
        description: '',
        createdAt: new Date().toISOString(),
      })
    })
  })

  const goals = [
    {
      id: createId('goal'),
      name: 'Emergency fund',
      target: 6000,
      color: '#2563eb',
      description: 'Six months of essential expenses',
      createdAt: new Date().toISOString(),
      contributions: months.slice(0, 6).map((period, index) => ({
        id: createId('con'),
        amount: 300,
        date: isoDate(period.year, period.month, Math.min(5, period.maxDay)),
        note: index === 0 ? 'Monthly deposit' : '',
      })),
    },
    {
      id: createId('goal'),
      name: 'Japan trip',
      target: 3500,
      color: '#8b5cf6',
      description: 'Spring travel fund',
      createdAt: new Date().toISOString(),
      contributions: months.slice(0, 4).map((period) => ({
        id: createId('con'),
        amount: 200,
        date: isoDate(period.year, period.month, Math.min(8, period.maxDay)),
        note: '',
      })),
    },
    {
      id: createId('goal'),
      name: 'New laptop',
      target: 1800,
      color: '#14b8a6',
      description: 'Replacement for work',
      createdAt: new Date().toISOString(),
      contributions: months.slice(0, 2).map((period) => ({
        id: createId('con'),
        amount: 250,
        date: isoDate(period.year, period.month, Math.min(10, period.maxDay)),
        note: '',
      })),
    },
  ]

  const budgets = months.reduce((accumulator, period) => {
    accumulator[monthKey(period.month, period.year)] = {
      total: 2100 + period.month * 5,
      categories: {
        Food: 420,
        Transportation: 220,
        Shopping: 280,
        Education: 120,
        Entertainment: 160,
        Bills: 1050,
        Healthcare: 120,
        Other: 100,
      },
    }
    return accumulator
  }, {})

  return {
    version: 1,
    createdAt: now.toISOString(),
    settings: {
      theme: 'light',
      language: 'en',
      currency: 'USD',
    },
    transactions,
    savingsGoals: goals,
    budgets,
  }
}

/** Empty state used by "Clear all data" — deliberately never seeds demo records. */
export function createEmptyData(existing = {}) {
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    settings: existing.settings || { theme: 'light', language: 'en', currency: 'USD' },
    transactions: [],
    savingsGoals: [],
    budgets: {},
  }
}
