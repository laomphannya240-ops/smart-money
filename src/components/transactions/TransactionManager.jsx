import { useMemo, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Plus,
  ReceiptText,
  Wallet,
} from 'lucide-react'
import { useFinance } from '../../hooks/useFinance'
import { useI18n } from '../../hooks/useI18n'
import { filterAndSortTransactions, paginate } from '../../utils/finance'
import AnimatedPage from '../common/AnimatedPage'
import PageHeader from '../common/PageHeader'
import StatCard from '../common/StatCard'
import Button from '../common/Button'
import Modal from '../common/Modal'
import Pagination from '../common/Pagination'
import TransactionFilters from './TransactionFilters'
import TransactionList from './TransactionList'
import TransactionForm from './TransactionForm'

const COPY = {
  income: {
    title: 'income.add',
    edit: 'income.edit',
    emptyTitle: 'income.empty',
    emptyDesc: 'income.emptyDesc',
    total: 'income.totalAll',
    month: 'income.thisMonth',
    average: 'income.average',
    records: 'income.records',
  },
  expense: {
    title: 'expenses.add',
    edit: 'expenses.edit',
    emptyTitle: 'expenses.empty',
    emptyDesc: 'expenses.emptyDesc',
    total: 'expenses.totalAll',
    month: 'expenses.thisMonth',
    average: 'expenses.average',
    records: 'expenses.records',
  },
  all: {
    title: 'trans.add',
    edit: 'common.edit',
    emptyTitle: 'trans.empty',
    emptyDesc: 'trans.emptyDesc',
    total: 'dash.totalBalance',
    month: 'dash.netFlow',
    average: 'common.records',
    records: 'common.records',
  },
}

export default function TransactionManager({
  type = 'all',
  titleKey,
  subtitleKey,
  showStats = true,
}) {
  const {
    transactions,
    monthlyTransactions,
    overallTotals,
    monthlyStats,
    deleteTransaction,
  } = useFinance()
  const { t, formatMoney } = useI18n()
  const copy = COPY[type] || COPY.all

  const [filters, setFilters] = useState({
    search: '',
    type,
    category: 'all',
    from: '',
    to: '',
    sort: 'newest',
  })
  const [page, setPage] = useState(1)
  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const handleFiltersChange = (patch) => {
    setFilters((previous) => ({ ...previous, ...patch }))
    setPage(1)
  }

  const source = useMemo(
    () => (type === 'all' ? transactions : transactions.filter((item) => item.type === type)),
    [transactions, type],
  )

  const filtered = useMemo(() => filterAndSortTransactions(source, filters), [source, filters])
  const paged = useMemo(() => paginate(filtered, page, 8), [filtered, page])

  const scopedMonth = useMemo(
    () => (type === 'all' ? monthlyTransactions : monthlyTransactions.filter((item) => item.type === type)),
    [monthlyTransactions, type],
  )

  const stats = useMemo(() => {
    if (type === 'all') {
      return [
        { label: copy.total, value: formatMoney(overallTotals.balance), icon: Wallet, tone: 'blue' },
        { label: t('common.income'), value: formatMoney(overallTotals.totalIncome), icon: ArrowDownLeft, tone: 'green' },
        { label: t('common.expense'), value: formatMoney(overallTotals.totalExpenses), icon: ArrowUpRight, tone: 'red' },
        { label: copy.month, value: formatMoney(monthlyStats.net, { signed: true }), icon: ReceiptText, tone: 'violet' },
      ]
    }
    const total = source.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
    const monthTotal = scopedMonth.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
    return [
      { label: copy.total, value: formatMoney(total), icon: type === 'income' ? ArrowDownLeft : ArrowUpRight, tone: type === 'income' ? 'green' : 'red' },
      { label: copy.month, value: formatMoney(monthTotal), icon: ReceiptText, tone: 'blue' },
      { label: copy.average, value: formatMoney(source.length ? total / source.length : 0), icon: Wallet, tone: 'violet' },
      { label: copy.records, value: String(source.length), icon: FileText, tone: 'amber' },
    ]
  }, [type, copy, overallTotals, monthlyStats, source, scopedMonth, formatMoney, t])

  const handleDelete = (transaction) => deleteTransaction(transaction.id, transaction.title)

  return (
    <AnimatedPage>
      <PageHeader
        title={t(titleKey)}
        subtitle={t(subtitleKey)}
        actions={
          <Button icon={Plus} onClick={() => setAddOpen(true)}>{t(copy.title)}</Button>
        }
      />

      {showStats && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} index={index} {...stat} />
          ))}
        </div>
      )}

      <div className="mt-5 space-y-4">
        <TransactionFilters
          filters={filters}
          onChange={handleFiltersChange}
          showType={type === 'all'}
          showSort
        />

        <div className="card overflow-hidden">
          <TransactionList
            transactions={paged.items}
            onEdit={setEditing}
            onDelete={handleDelete}
            emptyTitle={t(copy.emptyTitle)}
            emptyDescription={t(copy.emptyDesc)}
          />
          <Pagination
            page={paged.page}
            totalPages={paged.totalPages}
            total={paged.total}
            start={paged.start}
            end={paged.end}
            onChange={setPage}
          />
        </div>
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={t(copy.title)}
        subtitle={t(subtitleKey)}
      >
        <TransactionForm
          defaultType={type === 'all' ? 'expense' : type}
          allowTypeChange={type === 'all'}
          onSuccess={() => setAddOpen(false)}
          onCancel={() => setAddOpen(false)}
        />
      </Modal>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={t(editing?.type === 'income' ? 'income.edit' : copy.edit)}
      >
        {editing && (
          <TransactionForm
            initial={editing}
            allowTypeChange={type === 'all'}
            defaultType={type === 'all' ? editing.type : type}
            onSuccess={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </AnimatedPage>
  )
}
