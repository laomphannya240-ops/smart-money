import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Copy, Pencil, PiggyBank, Plus, SlidersHorizontal } from 'lucide-react'
import { useFinance } from '../hooks/useFinance'
import { useI18n } from '../hooks/useI18n'
import { EXPENSE_CATEGORIES } from '../utils/constants'
import { getBudgetStatus, getCategorySpent } from '../utils/finance'
import AnimatedPage from '../components/common/AnimatedPage'
import PageHeader from '../components/common/PageHeader'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import MonthPicker from '../components/common/MonthPicker'
import ProgressBar from '../components/common/ProgressBar'
import EmptyState from '../components/common/EmptyState'
import BudgetForm from '../components/budgets/BudgetForm'

export default function Budgets() {
  const {
    budget,
    budgets,
    monthlyTransactions,
    monthlyStats,
    selectedMonth,
    selectedYear,
    copyPreviousBudget,
  } = useFinance()
  const { t, formatMoney, monthLabel } = useI18n()
  const [formOpen, setFormOpen] = useState(false)

  const status = getBudgetStatus(monthlyStats.expenses, budget.total || 0)
  const spentByCategory = getCategorySpent(monthlyTransactions.filter((item) => item.type === 'expense'))
  const hasBudget = Boolean(budget.total)
  const previousDate = new Date(Number(selectedYear), Number(selectedMonth) - 1, 1)
  const previousKey = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, '0')}`
  const hasPrevious = Boolean(budgets[previousKey]?.total)

  const categoryTone = (spent, limit) => {
    if (!limit) return 'blue'
    const usage = (spent / limit) * 100
    return usage > 100 ? 'red' : usage >= 80 ? 'amber' : 'green'
  }

  return (
    <AnimatedPage>
      <PageHeader
        title={t('budget.title')}
        subtitle={t('budget.subtitle')}
        actions={
          <>
            <MonthPicker />
            <Button
              variant="secondary"
              icon={Copy}
              onClick={() => copyPreviousBudget(selectedMonth, selectedYear)}
              disabled={!hasPrevious}
              title={t('budget.copyPrevious')}
            >
              <span className="hidden sm:inline">{t('budget.copyPrevious')}</span>
            </Button>
            <Button icon={hasBudget ? Pencil : Plus} onClick={() => setFormOpen(true)}>
              {t(hasBudget ? 'budget.update' : 'budget.create')}
            </Button>
          </>
        }
      />

      {!hasBudget ? (
        <div className="card">
          <EmptyState
            icon={PiggyBank}
            title={t('budget.noBudget', { month: monthLabel(selectedMonth, selectedYear) })}
            description={t('budget.noBudgetDesc')}
            action={<Button icon={Plus} onClick={() => setFormOpen(true)}>{t('budget.create')}</Button>}
          />
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                    <SlidersHorizontal size={18} />
                  </span>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{monthLabel(selectedMonth, selectedYear)}</p>
                    <p className="text-sm font-semibold">{t('budget.usage')}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <p className="text-3xl font-bold tracking-tight">{formatMoney(status.spent)}</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    {t('common.limit')}: {formatMoney(status.limit)}
                  </p>
                </div>
                <ProgressBar
                  value={status.usage}
                  color={status.status === 'over' ? 'red' : status.status === 'warning' ? 'amber' : 'blue'}
                  height={10}
                  className="mt-4"
                />
                <div className="mt-2 flex justify-between text-xs" style={{ color: 'var(--muted)' }}>
                  <span>{status.usage.toFixed(0)}%</span>
                  <span>{formatMoney(status.limit)}</span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="card-soft p-4">
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{t('budget.remaining')}</p>
                  <p className={`mt-1.5 text-xl font-bold ${status.remaining < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {formatMoney(status.remaining)}
                  </p>
                </div>
                <div className="card-soft p-4">
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{t('common.limit')}</p>
                  <p className="mt-1.5 text-xl font-bold">{formatMoney(status.limit)}</p>
                </div>
              </div>
            </div>

            <div
              className={`flex items-start gap-3 border-t px-5 py-4 text-sm ${
                status.status === 'over'
                  ? 'bg-red-50/70 text-red-700 dark:bg-red-500/10 dark:text-red-300'
                  : status.status === 'warning'
                    ? 'bg-amber-50/70 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                    : 'bg-emerald-50/60 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
              }`}
              style={{ borderColor: 'var(--line)' }}
            >
              {status.status === 'over' || status.status === 'warning' ? <AlertTriangle size={18} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={18} className="mt-0.5 shrink-0" />}
              <div>
                <p className="font-semibold">
                  {status.status === 'over'
                    ? t('budget.over', { amount: formatMoney(Math.abs(status.remaining)) })
                    : status.status === 'warning'
                      ? t('budget.warning', { percent: `${status.usage.toFixed(0)}%` })
                      : t('budget.safe')}
                </p>
                <p className="mt-0.5 text-xs opacity-80">{monthLabel(selectedMonth, selectedYear)}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 card p-5 sm:p-6">
            <h2 className="text-base font-bold">{t('budget.categoryLimits')}</h2>
            <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>{t('budget.categoryHint')}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {EXPENSE_CATEGORIES.map((category) => {
                const Icon = category.icon
                const limit = budget.categories?.[category.id] || 0
                const spent = spentByCategory[category.id] || 0
                const usage = limit > 0 ? (spent / limit) * 100 : 0
                return (
                  <div key={category.id} className="card-soft p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-lg"
                          style={{ background: `${category.color}18`, color: category.color }}
                        >
                          <Icon size={14} />
                        </span>
                        {t(category.labelKey)}
                      </span>
                      {limit > 0 && (
                        <span className={`text-xs font-bold ${usage > 100 ? 'text-rose-500' : usage >= 80 ? 'text-amber-500' : ''}`}>
                          {usage.toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm font-semibold">
                      {formatMoney(spent)}
                      <span className="font-normal" style={{ color: 'var(--muted)' }}> / {limit ? formatMoney(limit) : '—'}</span>
                    </p>
                    <ProgressBar value={usage} color={categoryTone(spent, limit)} className="mt-2.5" height={6} />
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={t(hasBudget ? 'budget.update' : 'budget.create')}
        subtitle={monthLabel(selectedMonth, selectedYear)}
        size="lg"
      >
        <BudgetForm
          month={selectedMonth}
          year={selectedYear}
          initialBudget={budget}
          onSuccess={() => setFormOpen(false)}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>
    </AnimatedPage>
  )
}
