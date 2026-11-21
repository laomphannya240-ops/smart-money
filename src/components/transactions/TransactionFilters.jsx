import { RotateCcw, Search } from 'lucide-react'
import { CATEGORIES } from '../../utils/constants'
import { useI18n } from '../../hooks/useI18n'
import Button from '../common/Button'

export default function TransactionFilters({ filters, onChange, showType = true, showSort = true }) {
  const { t } = useI18n()

  const update = (key, value) => onChange({ [key]: value })
  const activeFilters =
    filters.search || filters.type !== 'all' || filters.category !== 'all' || filters.from || filters.to

  const categoryOptions = filters.type !== 'all' ? CATEGORIES[filters.type] : null

  return (
    <div className="card p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-12">
        <div className="relative xl:col-span-4">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
          <input
            className="input !pl-9"
            type="search"
            value={filters.search}
            onChange={(event) => update('search', event.target.value)}
            placeholder={t('trans.searchPlaceholder')}
            aria-label={t('common.search')}
          />
        </div>

        {showType && (
          <select
            className="input cursor-pointer"
            value={filters.type}
            onChange={(event) => onChange({ type: event.target.value, category: 'all' })}
            aria-label={t('trans.type')}
          >
            <option value="all">{t('trans.type')}: {t('common.all')}</option>
            <option value="income">{t('common.income')}</option>
            <option value="expense">{t('common.expense')}</option>
          </select>
        )}

        <select
          className="input cursor-pointer"
          value={filters.category}
          onChange={(event) => update('category', event.target.value)}
          aria-label={t('common.category')}
        >
          <option value="all">{t('trans.categoryAll')}</option>
          {categoryOptions ? (
            categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {t(category.labelKey)}
              </option>
            ))
          ) : (
            <>
              <optgroup label={t('common.income')}>
                {CATEGORIES.income.map((category) => (
                  <option key={`income-${category.id}`} value={category.id}>
                    {t(category.labelKey)}
                  </option>
                ))}
              </optgroup>
              <optgroup label={t('common.expense')}>
                {CATEGORIES.expense.map((category) => (
                  <option key={`expense-${category.id}`} value={category.id}>
                    {t(category.labelKey)}
                  </option>
                ))}
              </optgroup>
            </>
          )}
        </select>

        <div className="flex gap-3 md:col-span-2 xl:col-span-4">
          <input
            className="input min-w-0"
            type="date"
            value={filters.from}
            onChange={(event) => update('from', event.target.value)}
            aria-label={t('trans.from')}
            title={t('trans.from')}
          />
          <input
            className="input min-w-0"
            type="date"
            value={filters.to}
            onChange={(event) => update('to', event.target.value)}
            aria-label={t('trans.to')}
            title={t('trans.to')}
          />
        </div>

        {showSort && (
          <select
            className="input cursor-pointer"
            value={filters.sort}
            onChange={(event) => update('sort', event.target.value)}
            aria-label={t('common.date')}
          >
            <option value="newest">{t('trans.newest')}</option>
            <option value="oldest">{t('trans.oldest')}</option>
          </select>
        )}
      </div>

      {activeFilters && (
        <div className="mt-3 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onClick={() =>
              onChange({ search: '', category: 'all', from: '', to: '', sort: 'newest' })
            }
          >
            {t('trans.clearFilters')}
          </Button>
        </div>
      )}
    </div>
  )
}
