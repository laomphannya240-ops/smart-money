import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CircleCheck,
  PiggyBank,
  Plus,
  Wallet,
} from 'lucide-react'
import { useFinance } from '../hooks/useFinance'
import { useI18n } from '../hooks/useI18n'
import { getCategoryBreakdown, getMonthlySeries } from '../utils/finance'
import AnimatedPage from '../components/common/AnimatedPage'
import PageHeader from '../components/common/PageHeader'
import StatCard from '../components/common/StatCard'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import MonthPicker from '../components/common/MonthPicker'
import ProgressBar from '../components/common/ProgressBar'
import TransactionForm from '../components/transactions/TransactionForm'
import TransactionList from '../components/transactions/TransactionList'
import IncomeExpenseChart from '../components/charts/IncomeExpenseChart'
import ExpensePieChart from '../components/charts/ExpensePieChart'

export default function Dashboard() {
  const {
    transactions,
    overallTotals,
    monthlyTransactions,
    monthlyStats,
    selectedMonth,
    selectedYear,
    deleteTransaction,
  } = useFinance()
  const { t, formatMoney, monthLabel, language } = useI18n()
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const chartData = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Number(selectedYear), Number(selectedMonth) - 5 + index, 1)
    const series = getMonthlySeries(transactions, date.getFullYear())[date.getMonth()]
    return {
      ...series,
      name: new Intl.DateTimeFormat(language === 'km' ? 'km-KH' : 'en-US', {
        month: 'short',
      }).format(date),
    }
  })

  const monthlyExpenses = monthlyTransactions.filter((item) => item.type === 'expense')
  const breakdown = getCategoryBreakdown(monthlyExpenses)
  const recent = [...transactions]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 5)

  const status = monthlyStats.limit > 0
    ? monthlyStats.usage > 100
      ? 'over'
      : monthlyStats.usage >= 80
        ? 'warning'
        : 'safe'
    : 'none'

  return (
    <AnimatedPage>
      <PageHeader
        title={`${t('dash.welcome')} 👋`}
        subtitle={t('dash.subtitle', { month: monthLabel(selectedMonth, selectedYear) })}
        actions={
          <>
            <MonthPicker className="md:hidden" />
            <Button icon={Plus} onClick={() => setQuickAddOpen(true)}>{t('dash.quickAdd')}</Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0}
          label={t('dash.totalBalance')}
          value={formatMoney(overallTotals.balance)}
          icon={Wallet}
          tone="blue"
          foot={t('dash.allTime')}
        />
        <StatCard
          index={1}
          label={t('dash.totalIncome')}
          value={formatMoney(overallTotals.totalIncome)}
          icon={ArrowDownLeft}
          tone="green"
          foot={`${t('common.thisMonth')}: ${formatMoney(monthlyStats.income)}`}
        />
        <StatCard
          index={2}
          label={t('dash.totalExpenses')}
          value={formatMoney(overallTotals.totalExpenses)}
          icon={ArrowUpRight}
          tone="red"
          foot={`${t('common.thisMonth')}: ${formatMoney(monthlyStats.expenses)}`}
        />
        <StatCard
          index={3}
          label={t('dash.totalSavings')}
          value={formatMoney(overallTotals.totalSavings)}
          icon={PiggyBank}
          tone="violet"
          foot={t('dash.savingsNote')}
        />
      </div>

      <div className="card mt-5 overflow-hidden">
        <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: 'var(--line)' }}>
          <div>
            <h2 className="text-base font-bold">{t('dash.monthlyOverview')}</h2>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>
              {monthLabel(selectedMonth, selectedYear)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {status === 'over' && (
              <span className="chip bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300">
                <AlertTriangle size={13} /> {t('common.overLimit')}
              </span>
            )}
            {status === 'warning' && (
              <span className="chip bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
                <AlertTriangle size={13} /> {t('common.approaching')}
              </span>
            )}
            {status === 'safe' && (
              <span className="chip bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                <CircleCheck size={13} /> {t('common.onTrack')}
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>{t('dash.netFlow')}</p>
            <p className={`mt-1.5 text-xl font-bold ${monthlyStats.net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatMoney(monthlyStats.net, { signed: true })}
            </p>
            <p className="mt-1 text-[11px]" style={{ color: 'var(--muted)' }}>{t('common.thisMonth')}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>{t('dash.transactionsCount')}</p>
            <p className="mt-1.5 text-xl font-bold">{monthlyStats.transactionCount}</p>
            <p className="mt-1 text-[11px]" style={{ color: 'var(--muted)' }}>{monthLabel(selectedMonth, selectedYear)}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>{t('dash.topCategory')}</p>
            <p className="mt-1.5 truncate text-xl font-bold">{breakdown[0] ? t(breakdown[0].labelKey) : '—'}</p>
            <p className="mt-1 text-[11px]" style={{ color: 'var(--muted)' }}>
              {breakdown[0] ? formatMoney(breakdown[0].value) : t('dash.noRecent')}
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: 'var(--muted)' }}>{t('dash.budgetUsage')}</p>
              <span className="text-xs font-bold">{monthlyStats.limit > 0 ? `${monthlyStats.usage.toFixed(0)}%` : '—'}</span>
            </div>
            <ProgressBar
              value={monthlyStats.usage}
              color={status === 'over' ? 'red' : status === 'warning' ? 'amber' : 'blue'}
              className="mt-3"
            />
            <p className="mt-2 text-[11px]" style={{ color: 'var(--muted)' }}>
              {monthlyStats.limit > 0
                ? `${formatMoney(monthlyStats.remaining)} ${t('common.remaining').toLowerCase()}`
                : t('dash.noBudget')}
            </p>
          </div>
        </div>

        {monthlyStats.limit === 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3" style={{ borderColor: 'var(--line)', background: 'var(--surface-soft)' }}>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>{t('dash.noBudget')}</p>
            <Link to="/budgets" className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300">
              {t('dash.setBudget')} →
            </Link>
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold">{t('dash.incomeVsExpenses')}</h2>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>{t('dash.last6')}</p>
            </div>
            <div className="hidden items-center gap-3 text-[11px] sm:flex" style={{ color: 'var(--muted)' }}>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand-500" />{t('common.income')}</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand-300" />{t('common.expense')}</span>
            </div>
          </div>
          <IncomeExpenseChart data={chartData} height={270} />
        </div>

        <div className="card p-5">
          <h2 className="mb-4 text-base font-bold">{t('dash.expenseBreakdown')}</h2>
          <ExpensePieChart data={breakdown} total={monthlyStats.expenses} height={210} />
        </div>
      </div>

      <div className="card mt-5 overflow-hidden">
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--line)' }}>
          <h2 className="text-base font-bold">{t('dash.recentTransactions')}</h2>
          <Link to="/transactions" className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300">
            {t('dash.viewAll')} <ArrowRight size={14} />
          </Link>
        </div>
        <TransactionList
          transactions={recent}
          onEdit={setEditing}
          onDelete={(transaction) => deleteTransaction(transaction.id, transaction.title)}
          emptyTitle={t('dash.noRecent')}
          emptyDescription={t('dash.noRecentDesc')}
        />
      </div>

      <Modal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        title={t('trans.add')}
        subtitle={t('dash.allTime')}
      >
        <TransactionForm onSuccess={() => setQuickAddOpen(false)} onCancel={() => setQuickAddOpen(false)} />
      </Modal>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.type === 'income' ? t('income.edit') : t('expenses.edit')}
      >
        {editing && (
          <TransactionForm
            initial={editing}
            onSuccess={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </AnimatedPage>
  )
}
