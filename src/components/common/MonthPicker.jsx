import { useMemo } from 'react'
import { CalendarDays } from 'lucide-react'
import { useFinance } from '../../hooks/useFinance'
import { useI18n } from '../../hooks/useI18n'

export default function MonthPicker({ className = '' }) {
  const { selectedMonth, selectedYear, setSelectedMonth, setSelectedYear, years } = useFinance()
  const { t, language } = useI18n()

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, month) =>
        new Intl.DateTimeFormat(language === 'km' ? 'km-KH' : 'en-US', { month: 'short' }).format(
          new Date(2024, month, 1),
        ),
      ),
    [language],
  )

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="hidden h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300 sm:flex">
        <CalendarDays size={17} />
      </span>
      <select
        className="input w-auto min-w-[68px] cursor-pointer py-2 !pr-7"
        value={selectedMonth}
        onChange={(event) => setSelectedMonth(Number(event.target.value))}
        aria-label={t('common.month')}
      >
        {months.map((name, index) => (
          <option key={name} value={index}>
            {name}
          </option>
        ))}
      </select>
      <select
        className="input w-auto min-w-[82px] cursor-pointer py-2 !pr-7"
        value={selectedYear}
        onChange={(event) => setSelectedYear(Number(event.target.value))}
        aria-label={t('common.year')}
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  )
}
