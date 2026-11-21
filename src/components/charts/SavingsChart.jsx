import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useI18n } from '../../hooks/useI18n'
import ChartTooltip from './ChartTooltip'

export default function SavingsChart({ data = [], height = 280 }) {
  const { t, formatMoney } = useI18n()

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--line)" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} dy={8} />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={54}
            tickFormatter={(value) => formatMoney(value, { compact: true })}
          />
          <Tooltip content={<ChartTooltip formatMoney={formatMoney} />} />
          <Area
            type="monotone"
            dataKey="savings"
            name={t('common.savings')}
            stroke="#8b5cf6"
            strokeWidth={2.5}
            fill="url(#savingsFill)"
            activeDot={{ r: 5, strokeWidth: 2, stroke: '#ffffff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
