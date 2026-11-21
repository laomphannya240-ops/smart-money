import { motion } from 'framer-motion'
import { Pencil, Trash2 } from 'lucide-react'
import { getCategoryMeta } from '../../utils/constants'
import { useI18n } from '../../hooks/useI18n'
import { useConfirm } from '../../hooks/useConfirm'
import EmptyState from '../common/EmptyState'

function CategoryBadge({ transaction }) {
  const { t } = useI18n()
  const meta = getCategoryMeta(transaction.type, transaction.category)
  const Icon = meta.icon
  return (
    <span className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
      <span
        className="flex h-7 w-7 items-center justify-center rounded-lg"
        style={{ background: `${meta.color}18`, color: meta.color }}
      >
        <Icon size={14} />
      </span>
      <span className="truncate">{t(meta.labelKey)}</span>
    </span>
  )
}

export default function TransactionList({ transactions, onEdit, onDelete, emptyTitle, emptyDescription }) {
  const { t, formatMoney, formatDateLabel } = useI18n()
  const { confirm } = useConfirm()

  const handleDelete = async (transaction) => {
    const confirmed = await confirm({
      title: t('confirm.deleteTitle', { item: transaction.title }),
      message: t('confirm.deleteMessage'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
    })
    if (confirmed) onDelete(transaction)
  }

  if (!transactions.length) {
    return (
      <EmptyState
        icon={undefined}
        title={emptyTitle || t('trans.empty')}
        description={emptyDescription || t('trans.emptyDesc')}
        compact
      />
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b text-[11px] font-semibold tracking-wider uppercase" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
              <th className="px-5 py-3 font-semibold">{t('common.title')}</th>
              <th className="px-4 py-3 font-semibold">{t('common.category')}</th>
              <th className="px-4 py-3 font-semibold">{t('common.date')}</th>
              <th className="px-4 py-3 text-right font-semibold">{t('common.amount')}</th>
              <th className="px-5 py-3 text-right font-semibold">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <motion.tr
                key={transaction.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(index * 0.025, 0.2) }}
                className="border-b transition-colors last:border-0 hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                style={{ borderColor: 'var(--line)' }}
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        transaction.type === 'income'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300'
                      }`}
                    >
                      {transaction.type === 'income' ? '↙' : '↗'}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{transaction.title}</p>
                      <p className="truncate text-xs" style={{ color: 'var(--muted)' }}>
                        {transaction.source || transaction.description || '—'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><CategoryBadge transaction={transaction} /></td>
                <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: 'var(--muted)' }}>
                  {formatDateLabel(transaction.date)}
                </td>
                <td
                  className={`px-4 py-3 text-right text-sm font-bold whitespace-nowrap ${
                    transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {formatMoney(transaction.amount, { signed: transaction.type === 'income' })}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <button type="button" className="btn-icon" onClick={() => onEdit(transaction)} title={t('common.edit')} aria-label={t('common.edit')}>
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-500/15"
                      onClick={() => handleDelete(transaction)}
                      title={t('common.delete')}
                      aria-label={t('common.delete')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="divide-y md:hidden" style={{ borderColor: 'var(--line)' }}>
        {transactions.map((transaction) => (
          <div key={transaction.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                    transaction.type === 'income'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300'
                      : 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300'
                  }`}
                >
                  {transaction.type === 'income' ? '↙' : '↗'}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{transaction.title}</p>
                  <p className="truncate text-xs" style={{ color: 'var(--muted)' }}>
                    {formatDateLabel(transaction.date)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" className="btn-icon" onClick={() => onEdit(transaction)} aria-label={t('common.edit')}>
                  <Pencil size={15} />
                </button>
                <button type="button" className="btn-icon" onClick={() => handleDelete(transaction)} aria-label={t('common.delete')}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 pl-12">
              <CategoryBadge transaction={transaction} />
              <span
                className={`text-sm font-bold whitespace-nowrap ${
                  transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatMoney(transaction.amount, { signed: transaction.type === 'income' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
