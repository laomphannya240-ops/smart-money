import { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Award, CalendarRange, PiggyBank, TrendingUp } from 'lucide-react'
import { useFinance } from '../hooks/useFinance'
import { useI18n } from '../hooks/useI18n'
import {
  filterByYear,
  getCategoryBreakdown,
  getMonthlySeries,
  getSavingsSeries,
  getYearlySeries,
  roundMoney,
} from '../utils/finance'
import AnimatedPage from '../components/common/AnimatedPage'
import PageHeader from '../components/common/PageHeader'
import StatCard from '../components/common/StatCard'
import ProgressBar from '../components/common/ProgressBar'
import EmptyState from '../components/common/EmptyState'
import ComparisonChart from '../components/charts/ComparisonChart'
import SavingsChart from '../components/charts/SavingsChart'

export default function Reports() {
  const { transactions, savingsGoals, years, selectedYear } = useFinance()
  const { t, formatMoney, language } = useI18n()
  const [reportYear, setReportYear] = useState(selectedYear)

  const yearly = useMemo(() => filterByYear(transactions, reportYear), [transactions, reportYear])
  const monthly = useMemo(() => getMonthlySeries(transactions, reportYear), [transactions, reportYear])
  const breakdown = useMemo(() => getCategoryBreakdown(yearly.filter((item) => item.type === 'expense')), [yearly])
  const savingsSeries = useMemo(() => getSavingsSeries(savingsGoals, reportYear), [savingsGoals, reportYear])
  const yearlySeries = useMemo(() => getYearlySeries(transactions), [transactions])

  const income = roundMoney(yearly.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0))
  const expenses = roundMoney(yearly.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0))
  const activeMonths = monthly.filter((month) => month.income > 0 || month.expense > 0).length || 1
  const bestMonth = [...monthly].sort((a, b) => b.net - a.net)[0]
  const bestMonthLabel = bestMonth
    ? new Intl.DateTimeFormat(language === 'km' ? 'km-KH' : 'en-US', { month: 'long' }).format(
        new Date(Number(reportYear), bestMonth.month, 1),
      )
    : '—'

  return (
    <AnimatedPage>
      <PageHeader
        title={t('reports.title')}
        subtitle={t('reports.subtitle')}
        actions={
          <div className="flex items-center gap-2">
            <CalendarRange size={17} className="hidden sm:block" style={{ color: 'var(--muted)' }} />
            <select
              className="input w-auto cursor-pointer"
              value={reportYear}
              onChange={(event) => setReportYear(Number(event.target.value))}
              aria-label={t('reports.year')}
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        }
      />

      {yearly.length === 0 ? (
        <div className="card">
          <EmptyState icon={CalendarRange} title={t('reports.empty')} description={t('reports.emptyDesc')} />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard index={0} label={t('reports.income')} value={formatMoney(income)} icon={ArrowDownLeft} tone="green" foot={t('reports.totalForYear', { year: reportYear })} />
            <StatCard index={1} label={t('reports.expenses')} value={formatMoney(expenses)} icon={ArrowUpRight} tone="red" foot={t('reports.totalForYear', { year: reportYear })} />
            <StatCard index={2} label={t('reports.net')} value={formatMoney(income - expenses, { signed: true })} icon={TrendingUp} tone="blue" foot={`${t('common.balance')} ${reportYear}`} />
            <StatCard index={3} label={t('reports.bestMonth')} value={bestMonthLabel} icon={Award} tone="violet" foot={bestMonth ? formatMoney(bestMonth.net, { signed: true }) : ''} />
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-3">
            <div className="card p-5 xl:col-span-2">
              <h2 className="mb-1 text-base font-bold">{t('reports.monthlyComparison')}</h2>
              <p className="mb-4 text-xs" style={{ color: 'var(--muted)' }}>{t('reports.totalForYear', { year: reportYear })}</p>
              <ComparisonChart data={monthly} height={300} />
            </div>

            <div className="card p-5">
              <h2 className="mb-1 text-base font-bold">{t('reports.categoryAnalysis')}</h2>
              <p className="mb-4 text-xs" style={{ color: 'var(--muted)' }}>{t('reports.topCategories')}</p>
              {breakdown.length ? (
                <div className="space-y-4">
                  {breakdown.slice(0, 6).map((item) => (
                    <div key={item.name}>
                      <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                        <span className="flex min-w-0 items-center gap-2 font-medium">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: item.color }} />
                          <span className="truncate">{t(item.labelKey)}</span>
                        </span>
                        <span className="shrink-0 font-bold">{formatMoney(item.value)}</span>
                      </div>
                      <ProgressBar value={item.percent} color={item.color} height={6} />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState compact title={t('reports.empty')} />
              )}
            </div>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-3">
            <div className="card p-5 xl:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <PiggyBank size={17} className="text-violet-500" />
                <h2 className="text-base font-bold">{t('reports.savingsGrowth')}</h2>
              </div>
              <SavingsChart data={savingsSeries} height={260} />
            </div>

            <div className="card p-5">
              <h2 className="mb-4 text-base font-bold">{t('reports.yearlySummary')}</h2>
              <div className="space-y-4">
                <div className="card-soft p-4">
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{t('reports.avgMonthlyIncome')}</p>
                  <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatMoney(income / activeMonths)}</p>
                </div>
                <div className="card-soft p-4">
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{t('reports.avgMonthlyExpense')}</p>
                  <p className="mt-1 text-lg font-bold text-rose-600 dark:text-rose-400">{formatMoney(expenses / activeMonths)}</p>
                </div>
                <div className="card-soft p-4">
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{t('savings.totalSaved')}</p>
                  <p className="mt-1 text-lg font-bold text-violet-600 dark:text-violet-400">
                    {formatMoney(savingsSeries[savingsSeries.length - 1]?.savings || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card mt-5 overflow-hidden">
            <div className="border-b px-5 py-4" style={{ borderColor: 'var(--line)' }}>
              <h2 className="text-base font-bold">{t('reports.yearlyTable')}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b text-[11px] font-semibold tracking-wider uppercase" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
                    <th className="px-5 py-3">{t('common.year')}</th>
                    <th className="px-4 py-3 text-right">{t('common.income')}</th>
                    <th className="px-4 py-3 text-right">{t('common.expense')}</th>
                    <th className="px-4 py-3 text-right">{t('reports.net')}</th>
                  </tr>
                </thead>
                <tbody>
                  {yearlySeries.map((row) => (
                    <tr key={row.year} className="border-b last:border-0" style={{ borderColor: 'var(--line)' }}>
                      <td className="px-5 py-3 font-semibold">{row.year}</td>
                      <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">{formatMoney(row.income)}</td>
                      <td className="px-4 py-3 text-right text-rose-600 dark:text-rose-400">{formatMoney(row.expense)}</td>
                      <td className="px-4 py-3 text-right font-bold">{formatMoney(row.net, { signed: true })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AnimatedPage>
  )
}
