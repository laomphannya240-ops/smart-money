export default function ChartTooltip({ active, payload, label, formatMoney, t }) {
  if (!active || !payload?.length) return null

  return (
    <div
      className="rounded-xl px-3.5 py-2.5 text-xs shadow-lg"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        boxShadow: 'var(--shadow-pop)',
      }}
    >
      <p className="mb-2 font-semibold">{label}</p>
      <div className="space-y-1.5">
        {payload.map((item) => (
          <div key={item.dataKey || item.name} className="flex items-center justify-between gap-5">
            <span className="flex items-center gap-2" style={{ color: 'var(--muted)' }}>
              <span className="h-2 w-2 rounded-full" style={{ background: item.color || item.fill }} />
              {item.name}
            </span>
            <span className="font-bold">{formatMoney ? formatMoney(item.value) : item.value}</span>
          </div>
        ))}
      </div>
      {t && <p className="mt-2 text-[10px]" style={{ color: 'var(--muted)' }}>{t('dash.allTime')}</p>}
    </div>
  )
}
