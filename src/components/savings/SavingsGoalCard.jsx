import { motion } from 'framer-motion'
import { CalendarDays, Pencil, Plus, Trash2 } from 'lucide-react'
import { useI18n } from '../../hooks/useI18n'
import { goalCurrent } from '../../utils/finance'
import ProgressBar from '../common/ProgressBar'

export default function SavingsGoalCard({ goal, index = 0, onAddMoney, onEdit, onDelete }) {
  const { t, formatMoney, formatDateLabel } = useI18n()
  const current = goalCurrent(goal)
  const percent = goal.target > 0 ? Math.min(100, (current / goal.target) * 100) : 0
  const completed = current >= goal.target

  return (
    <motion.div
      className="card flex flex-col p-5"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.06, 0.3) }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
            style={{ background: goal.color || '#2563eb' }}
          >
            <span className="text-lg font-bold">{(goal.name || '?').charAt(0).toUpperCase()}</span>
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold">{goal.name}</h3>
            <p className="truncate text-xs" style={{ color: 'var(--muted)' }}>
              {goal.description || `${(goal.contributions || []).length} ${t('savings.contributions')}`}
            </p>
          </div>
        </div>
        {completed && (
          <span className="chip shrink-0 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
            {t('savings.completedBadge')}
          </span>
        )}
      </div>

      <div className="mt-6">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-xl font-bold tracking-tight">{formatMoney(current)}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {t('common.goal')}: {formatMoney(goal.target)}
            </p>
          </div>
          <span className="text-lg font-bold" style={{ color: goal.color || '#2563eb' }}>
            {percent.toFixed(0)}%
          </span>
        </div>
        <ProgressBar value={percent} color={goal.color || '#2563eb'} className="mt-3" />
        <div className="mt-2 flex items-center justify-between text-[11px]" style={{ color: 'var(--muted)' }}>
          <span>{formatMoney(Math.max(0, goal.target - current))} {t('common.remaining').toLowerCase()}</span>
          <span>{(goal.contributions || []).length} {t('savings.contributions')}</span>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 border-t pt-4" style={{ borderColor: 'var(--line)' }}>
        <button type="button" className="btn btn-primary flex-1 !py-2 !text-xs" onClick={() => onAddMoney(goal)} disabled={completed}>
          <Plus size={15} /> {t('savings.addMoney')}
        </button>
        <button type="button" className="btn-icon" onClick={() => onEdit(goal)} title={t('common.edit')} aria-label={t('common.edit')}>
          <Pencil size={16} />
        </button>
        <button
          type="button"
          className="btn-icon hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-500/15"
          onClick={() => onDelete(goal)}
          title={t('common.delete')}
          aria-label={t('common.delete')}
        >
          <Trash2 size={16} />
        </button>
      </div>
      {(goal.contributions || []).length > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--muted)' }}>
          <CalendarDays size={12} />
          {t('savings.contribute')}: {formatDateLabel(goal.contributions[goal.contributions.length - 1].date)}
        </p>
      )}
    </motion.div>
  )
}
