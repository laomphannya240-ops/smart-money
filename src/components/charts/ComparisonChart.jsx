import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useI18n } from '../../hooks/useI18n'
import ChartTooltip from './ChartTooltip'

export default function ComparisonChart({ data = [], xKey = 'name', height = 300 }) {
  const { t, formatMoney } = useI18n()

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--line)" />
          <XAxis dataKey={xKey} axisLine={false} tickLine={false} dy={8} />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(value) => formatMoney(value, { compact: true })}
          />
          <Tooltip
            cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
            content={<ChartTooltip formatMoney={formatMoney} />}
          />
          <Bar dataKey="income" name={t('common.income')} fill="#2563eb" radius={[6, 6, 2, 2]} maxBarSize={30} />
          <Bar dataKey="expense" name={t('common.expense')} fill="#f472b6" radius={[6, 6, 2, 2]} maxBarSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
