import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useToast } from '../hooks/useToast'
import { FinanceContext } from './contexts'
import { STORAGE_KEY } from '../utils/constants'
import { ACCOUNT_DATA_PREFIX } from '../utils/accounts'
import { normalizeEmail } from '../utils/auth'
import { createDemoData, createEmptyData } from '../utils/demoData'
import { createId } from '../utils/id'
import { formatCurrency, monthKey } from '../utils/format'
import {
  filterTransactions,
  getAvailableYears,
  getBudgetForMonth,
  getMonthlyStats,
  getOverallTotals,
  roundMoney,
} from '../utils/finance'
import { translate } from '../utils/i18n'

const DEFAULT_SETTINGS = { theme: 'light', language: 'en', currency: 'USD' }

function normalizeData(input) {
  const source = input && typeof input === 'object' ? input : {}
  return {
    version: source.version || 1,
    createdAt: source.createdAt || new Date().toISOString(),
    settings: { ...DEFAULT_SETTINGS, ...(source.settings || {}) },
    transactions: Array.isArray(source.transactions) ? source.transactions : [],
    savingsGoals: Array.isArray(source.savingsGoals) ? source.savingsGoals : [],
    budgets: source.budgets && typeof source.budgets === 'object' ? source.budgets : {},
  }
}

export function FinanceProvider({ children, accountEmail = '' }) {
  const account = normalizeEmail(accountEmail)
  // A dedicated key per account keeps each signed-in user's records isolated.
  const storageKey = account ? `${ACCOUNT_DATA_PREFIX}${account}` : STORAGE_KEY
  const [storedData, setStoredData] = useLocalStorage(storageKey, account ? createEmptyData : createDemoData)
  const { notify } = useToast()
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear())

  const data = useMemo(() => normalizeData(storedData), [storedData])
  const { transactions, savingsGoals, budgets, settings } = data
  const { theme, language, currency } = settings

  const t = useCallback((key, variables) => translate(language, key, variables), [language])

  const formatMoney = useCallback(
    (amount, options) => formatCurrency(amount, currency, options),
    [currency],
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light'
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = language === 'km' ? 'km' : 'en'
  }, [language])

  const overallTotals = useMemo(
    () => getOverallTotals(transactions, savingsGoals),
    [transactions, savingsGoals],
  )
  const monthlyTransactions = useMemo(
    () => filterTransactions(transactions, { month: selectedMonth, year: selectedYear }),
    [transactions, selectedMonth, selectedYear],
  )
  const budget = useMemo(
    () => getBudgetForMonth(budgets, selectedMonth, selectedYear),
    [budgets, selectedMonth, selectedYear],
  )
  const monthlyStats = useMemo(
    () => getMonthlyStats(transactions, savingsGoals, budget, selectedMonth, selectedYear),
    [transactions, savingsGoals, budget, selectedMonth, selectedYear],
  )
  const years = useMemo(() => getAvailableYears(transactions, savingsGoals), [transactions, savingsGoals])

  const setPeriod = useCallback((month, year) => {
    setSelectedMonth(Number(month))
    setSelectedYear(Number(year))
  }, [])

  const addTransaction = useCallback(
    (values) => {
      const record = {
        ...values,
        id: createId('tx'),
        amount: roundMoney(values.amount),
        createdAt: new Date().toISOString(),
      }
      setStoredData((previous) => ({
        ...previous,
        transactions: [record, ...(previous.transactions || [])],
      }))
      notify(t('toast.created', { item: t(values.type === 'income' ? 'common.income' : 'common.expense') }))
      return record
    },
    [notify, setStoredData, t],
  )

  const updateTransaction = useCallback(
    (id, values) => {
      setStoredData((previous) => ({
        ...previous,
        transactions: (previous.transactions || []).map((item) =>
          item.id === id ? { ...item, ...values, amount: roundMoney(values.amount ?? item.amount) } : item,
        ),
      }))
      notify(t('toast.updated', { item: t('common.details') }))
    },
    [notify, setStoredData, t],
  )

  const deleteTransaction = useCallback(
    (id, label = '') => {
      setStoredData((previous) => ({
        ...previous,
        transactions: (previous.transactions || []).filter((item) => item.id !== id),
      }))
      notify(t('toast.deleted', { item: label || t('common.details') }))
    },
    [notify, setStoredData, t],
  )

  const addGoal = useCallback(
    (values) => {
      const record = {
        ...values,
        id: createId('goal'),
        target: roundMoney(values.target),
        contributions: [],
        createdAt: new Date().toISOString(),
      }
      setStoredData((previous) => ({
        ...previous,
        savingsGoals: [record, ...(previous.savingsGoals || [])],
      }))
      notify(t('toast.created', { item: t('common.goal') }))
      return record
    },
    [notify, setStoredData, t],
  )

  const updateGoal = useCallback(
    (id, values) => {
      setStoredData((previous) => ({
        ...previous,
        savingsGoals: (previous.savingsGoals || []).map((goal) =>
          goal.id === id ? { ...goal, ...values, target: roundMoney(values.target ?? goal.target) } : goal,
        ),
      }))
      notify(t('toast.updated', { item: t('common.goal') }))
    },
    [notify, setStoredData, t],
  )

  const deleteGoal = useCallback(
    (id) => {
      setStoredData((previous) => ({
        ...previous,
        savingsGoals: (previous.savingsGoals || []).filter((goal) => goal.id !== id),
      }))
      notify(t('toast.deleted', { item: t('common.goal') }))
    },
    [notify, setStoredData, t],
  )

  const addContribution = useCallback(
    (goalId, values) => {
      const contribution = {
        ...values,
        id: createId('con'),
        amount: roundMoney(values.amount),
      }
      const goal = savingsGoals.find((item) => item.id === goalId)
      const previousTotal = goal
        ? (goal.contributions || []).reduce((total, item) => total + (Number(item.amount) || 0), 0)
        : 0
      setStoredData((previous) => ({
        ...previous,
        savingsGoals: (previous.savingsGoals || []).map((item) =>
          item.id === goalId
            ? { ...item, contributions: [...(item.contributions || []), contribution] }
            : item,
        ),
      }))
      notify(t('toast.contribution'))
      if (goal && previousTotal + contribution.amount >= goal.target) {
        notify(t('toast.goalCompleted'), 'info')
      }
      return contribution
    },
    [notify, savingsGoals, setStoredData, t],
  )

  const saveBudget = useCallback(
    (month, year, values) => {
      const key = monthKey(month, year)
      const categories = Object.entries(values.categories || {}).reduce((accumulator, [name, amount]) => {
        const numeric = Number(amount)
        if (Number.isFinite(numeric) && numeric > 0) accumulator[name] = roundMoney(numeric)
        return accumulator
      }, {})
      setStoredData((previous) => ({
        ...previous,
        budgets: {
          ...(previous.budgets || {}),
          [key]: { total: roundMoney(values.total || 0), categories },
        },
      }))
      notify(
        t('toast.budgetSaved', {
          month: new Intl.DateTimeFormat(language === 'km' ? 'km-KH' : 'en-US', {
            month: 'long',
            year: 'numeric',
          }).format(new Date(Number(year), Number(month), 1)),
        }),
      )
    },
    [language, notify, setStoredData, t],
  )

  const copyPreviousBudget = useCallback(
    (month, year) => {
      const previousDate = new Date(Number(year), Number(month) - 1, 1)
      const previousKey = monthKey(previousDate.getMonth(), previousDate.getFullYear())
      const source = budgets[previousKey]
      if (!source) return false
      setStoredData((previous) => ({
        ...previous,
        budgets: { ...(previous.budgets || {}), [monthKey(month, year)]: { ...source, categories: { ...source.categories } } },
      }))
      notify(t('toast.copied'))
      return true
    },
    [budgets, notify, setStoredData, t],
  )

  const updateSettings = useCallback(
    (patch) => {
      setStoredData((previous) => ({
        ...previous,
        settings: { ...DEFAULT_SETTINGS, ...(previous.settings || {}), ...patch },
      }))
      notify(t('toast.saved'))
    },
    [notify, setStoredData, t],
  )

  const replaceData = useCallback(
    (newData) => {
      setStoredData(normalizeData(newData))
      notify(t('toast.imported'))
    },
    [notify, setStoredData, t],
  )

  const clearAllData = useCallback(() => {
    setStoredData((previous) => createEmptyData(previous))
    notify(t('toast.cleared'))
  }, [notify, setStoredData, t])

  const resetDemoData = useCallback(() => {
    setStoredData((previous) => ({ ...createDemoData(), settings: previous.settings }))
    notify(t('toast.reset'))
  }, [notify, setStoredData, t])

  const value = useMemo(
    () => ({
      data,
      transactions,
      savingsGoals,
      budgets,
      settings,
      theme,
      language,
      currency,
      selectedMonth,
      selectedYear,
      years,
      t,
      formatMoney,
      overallTotals,
      monthlyTransactions,
      monthlyStats,
      budget,
      setSelectedMonth,
      setSelectedYear,
      setPeriod,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addGoal,
      updateGoal,
      deleteGoal,
      addContribution,
      saveBudget,
      copyPreviousBudget,
      updateSettings,
      replaceData,
      clearAllData,
      resetDemoData,
    }),
    [
      data,
      transactions,
      savingsGoals,
      budgets,
      settings,
      theme,
      language,
      currency,
      selectedMonth,
      selectedYear,
      years,
      t,
      formatMoney,
      overallTotals,
      monthlyTransactions,
      monthlyStats,
      budget,
      setPeriod,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addGoal,
      updateGoal,
      deleteGoal,
      addContribution,
      saveBudget,
      copyPreviousBudget,
      updateSettings,
      replaceData,
      clearAllData,
      resetDemoData,
    ],
  )

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}
