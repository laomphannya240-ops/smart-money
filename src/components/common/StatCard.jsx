import { motion } from 'framer-motion'

const TONES = {
  blue: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
  green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  red: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
}

export default function StatCard({ label, value, icon: Icon, tone = 'blue', foot, index = 0 }) {
  return (
    <motion.div
      className="card p-4 sm:p-5"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.06, 0.3) }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{label}</p>
          <p className="mt-2 truncate text-xl font-bold tracking-tight sm:text-2xl">{value}</p>
        </div>
        {Icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TONES[tone] || TONES.blue}`}>
            <Icon size={19} strokeWidth={2.1} />
          </div>
        )}
      </div>
      {foot && <div className="mt-3 text-xs" style={{ color: 'var(--muted)' }}>{foot}</div>}
    </motion.div>
  )
}
