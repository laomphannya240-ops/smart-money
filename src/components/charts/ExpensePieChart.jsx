import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useI18n } from '../../hooks/useI18n'
import EmptyState from '../common/EmptyState'

export default function ExpensePieChart({ data = [], total = 0, height = 230 }) {
  const { t, formatMoney } = useI18n()

  if (!data.length) {
    return <EmptyState title={t('reports.empty')} description={t('reports.emptyDesc')} compact />
  }

  return (
    <div>
      <div className="relative w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="labelKey"
              cx="50%"
              cy="50%"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, item) => [
                formatMoney(value),
                t(item?.payload?.labelKey || name),
              ]}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid var(--line)',
                background: 'var(--surface)',
                color: 'var(--text)',
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px]" style={{ color: 'var(--muted)' }}>{t('common.total')}</span>
          <span className="text-lg font-bold tracking-tight">{formatMoney(total, { compact: true })}</span>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
        {data.slice(0, 6).map((item) => (
          <div key={item.name} className="flex min-w-0 items-center justify-between gap-2 text-xs">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.color }} />
              <span className="truncate" style={{ color: 'var(--muted)' }}>{t(item.labelKey)}</span>
            </span>
            <span className="font-semibold">{item.percent.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
