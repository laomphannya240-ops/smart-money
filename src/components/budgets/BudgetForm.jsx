import { useId, useState } from 'react'
import { EXPENSE_CATEGORIES } from '../../utils/constants'
import { useFinance } from '../../hooks/useFinance'
import { useI18n } from '../../hooks/useI18n'
import { fromBase, toBase } from '../../utils/format'
import Button from '../common/Button'
import Field from '../common/Field'

const displayValue = (baseAmount, currency) => (baseAmount ? String(fromBase(baseAmount, currency)) : '')

export default function BudgetForm({ month, year, initialBudget, onSuccess, onCancel }) {
  const { saveBudget } = useFinance()
  const { t, currency, formatMoney, monthLabel } = useI18n()
  const formId = useId()

  const [total, setTotal] = useState(displayValue(initialBudget?.total, currency))
  const [categories, setCategories] = useState(() =>
    EXPENSE_CATEGORIES.reduce((accumulator, category) => {
      accumulator[category.id] = displayValue(initialBudget?.categories?.[category.id], currency)
      return accumulator
    }, {}),
  )
  const [errors, setErrors] = useState({})

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    const numericTotal = Number(total)
    if (total !== '' && (!Number.isFinite(numericTotal) || numericTotal < 0)) {
      nextErrors.total = t('validation.amountPositive')
    }
    Object.entries(categories).forEach(([id, value]) => {
      if (value === '') return
      const numeric = Number(value)
      if (!Number.isFinite(numeric) || numeric < 0) nextErrors[id] = t('validation.amountPositive')
    })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    saveBudget(month, year, {
      total: toBase(total || 0, currency),
      categories: Object.fromEntries(
        Object.entries(categories).map(([id, value]) => [id, toBase(value || 0, currency)]),
      ),
    })
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Field
        label={`${t('budget.monthlyLimit')} (${currency})`}
        error={errors.total}
        hint={t('budget.setLimit', { month: monthLabel(month, year) })}
        htmlFor={`${formId}-total`}
      >
        <input
          id={`${formId}-total`}
          className={`input ${errors.total ? 'input-error' : ''}`}
          type="number"
          inputMode="decimal"
          min="0"
          step={currency === 'KHR' ? 1 : 0.01}
          value={total}
          onChange={(event) => {
            setTotal(event.target.value)
            setErrors((previous) => ({ ...previous, total: undefined }))
          }}
          placeholder="0.00"
          autoFocus
        />
      </Field>

      <div>
        <p className="label">{t('budget.categoryLimits')}</p>
        <p className="mb-3 text-xs" style={{ color: 'var(--muted)' }}>{t('budget.categoryHint')}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {EXPENSE_CATEGORIES.map((category) => {
            const Icon = category.icon
            return (
              <Field key={category.id} error={errors[category.id]}>
                <label className="mb-1.5 flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--muted)' }}>
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-md"
                    style={{ background: `${category.color}18`, color: category.color }}
                  >
                    <Icon size={13} />
                  </span>
                  {t(category.labelKey)}
                  <span className="ml-auto text-[10px]">{currency}</span>
                </label>
                <input
                  className={`input ${errors[category.id] ? 'input-error' : ''}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step={currency === 'KHR' ? 1 : 0.01}
                  value={categories[category.id]}
                  onChange={(event) =>
                    setCategories((previous) => ({ ...previous, [category.id]: event.target.value }))
                  }
                  placeholder="—"
                />
              </Field>
            )
          })}
        </div>
      </div>

      {total && Number(total) > 0 && (
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          {t('common.total')}: {formatMoney(toBase(total, currency))}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end" style={{ borderColor: 'var(--line)' }}>
        <Button variant="secondary" onClick={onCancel}>{t('common.cancel')}</Button>
        <Button type="submit">{initialBudget?.total ? t('budget.update') : t('budget.create')}</Button>
      </div>
    </form>
  )
}
