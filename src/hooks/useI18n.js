import { useFinance } from './useFinance'

/** Small convenience wrapper for the most frequently used localisation helpers. */
export function useI18n() {
  const { t, language, currency, formatMoney, selectedMonth, selectedYear } = useFinance()

  const formatDateLabel = (dateString) => {
    if (!dateString) return '—'
    return new Intl.DateTimeFormat(language === 'km' ? 'km-KH' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(`${String(dateString).slice(0, 10)}T00:00:00`))
  }

  const monthLabel = (month = selectedMonth, year = selectedYear) =>
    new Intl.DateTimeFormat(language === 'km' ? 'km-KH' : 'en-US', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(Number(year), Number(month), 1))

  return { t, language, currency, formatMoney, formatDateLabel, monthLabel }
}
