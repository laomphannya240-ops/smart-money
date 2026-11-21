import { useId, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { useFinance } from '../../hooks/useFinance'
import { useI18n } from '../../hooks/useI18n'
import { CATEGORIES, getCategoryMeta } from '../../utils/constants'
import { fromBase, toBase, toISODate } from '../../utils/format'
import Button from '../common/Button'
import Field from '../common/Field'

const TODAY = toISODate(new Date())

export default function TransactionForm({
  initial = null,
  defaultType = 'expense',
  onSuccess,
  onCancel,
  allowTypeChange = true,
}) {
  const { addTransaction, updateTransaction } = useFinance()
  const { t, currency } = useI18n()
  const formId = useId()

  const [type, setType] = useState(initial?.type || defaultType)
  const [title, setTitle] = useState(initial?.title || '')
  const [amount, setAmount] = useState(
    initial ? String(fromBase(initial.amount, currency)) : '',
  )
  const [category, setCategory] = useState(initial?.category || '')
  const [date, setDate] = useState(initial?.date || TODAY)
  const [source, setSource] = useState(initial?.source || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [errors, setErrors] = useState({})

  const categories = CATEGORIES[type]

  const handleTypeChange = (nextType) => {
    setType(nextType)
    setCategory('')
    setErrors((previous) => ({ ...previous, category: undefined }))
  }

  const validate = () => {
    const nextErrors = {}
    if (!title.trim()) nextErrors.title = t('validation.titleRequired')
    else if (title.trim().length > 60) nextErrors.title = t('validation.titleMax')

    const numericAmount = Number(amount)
    if (amount === '' || amount === null || !Number.isFinite(numericAmount)) {
      nextErrors.amount = t('validation.amountRequired')
    } else if (numericAmount <= 0) {
      nextErrors.amount = t('validation.amountPositive')
    }

    if (!category) nextErrors.category = t('validation.categoryRequired')
    if (!date) nextErrors.date = t('validation.dateRequired')
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!validate()) return

    const values = {
      type,
      title: title.trim(),
      amount: toBase(amount, currency),
      category,
      date,
      source: type === 'income' ? source.trim() : '',
      description: description.trim(),
    }

    if (initial) updateTransaction(initial.id, values)
    else addTransaction(values)
    onSuccess?.(values)
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4" noValidate>
      {allowTypeChange && (
        <div className="grid grid-cols-2 gap-2 rounded-xl p-1" style={{ background: 'var(--surface-soft)' }}>
          {[
            { id: 'income', label: t('common.income'), icon: ArrowDownLeft },
            { id: 'expense', label: t('common.expense'), icon: ArrowUpRight },
          ].map((option) => {
            const Icon = option.icon
            const active = type === option.id
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleTypeChange(option.id)}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                  active
                    ? option.id === 'income'
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm dark:bg-emerald-500/15 dark:text-emerald-300'
                      : 'bg-rose-50 text-rose-700 shadow-sm dark:bg-rose-500/15 dark:text-rose-300'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon size={16} />
                {option.label}
              </button>
            )
          })}
        </div>
      )}

      <Field label={t('common.title')} error={errors.title} required htmlFor={`${formId}-title`}>
        <input
          id={`${formId}-title`}
          className={`input ${errors.title ? 'input-error' : ''}`}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={type === 'income' ? t('income.add') : t('expenses.add')}
          maxLength={80}
          autoFocus
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={`${t('common.amount')} (${currency})`}
          error={errors.amount}
          required
          htmlFor={`${formId}-amount`}
        >
          <input
            id={`${formId}-amount`}
            className={`input ${errors.amount ? 'input-error' : ''}`}
            type="number"
            inputMode="decimal"
            min={currency === 'KHR' ? 1 : 0.01}
            step={currency === 'KHR' ? 1 : 0.01}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
          />
        </Field>
        <Field label={t('common.date')} error={errors.date} required htmlFor={`${formId}-date`}>
          <input
            id={`${formId}-date`}
            className={`input ${errors.date ? 'input-error' : ''}`}
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('common.category')} error={errors.category} required htmlFor={`${formId}-category`}>
          <select
            id={`${formId}-category`}
            className={`input cursor-pointer ${errors.category ? 'input-error' : ''}`}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">{t('validation.categoryRequired')}</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {t(item.labelKey)}
              </option>
            ))}
          </select>
        </Field>
        {type === 'income' ? (
          <Field label={t('common.source')} htmlFor={`${formId}-source`}>
            <input
              id={`${formId}-source`}
              className="input"
              value={source}
              onChange={(event) => setSource(event.target.value)}
              placeholder={t('income.sourcePlaceholder')}
              maxLength={60}
            />
          </Field>
        ) : (
          <Field label={t('common.note')} htmlFor={`${formId}-quick-note`}>
            <input
              id={`${formId}-quick-note`}
              className="input"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t('common.optional')}
              maxLength={120}
            />
          </Field>
        )}
      </div>

      {type === 'income' && (
        <Field label={t('common.description')} htmlFor={`${formId}-description`}>
          <input
            id={`${formId}-description`}
            className="input"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t('common.optional')}
            maxLength={120}
          />
        </Field>
      )}

      {category && (
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: getCategoryMeta(type, category).color }}
          />
          {t(getCategoryMeta(type, category).labelKey)}
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end" style={{ borderColor: 'var(--line)' }}>
        <Button variant="secondary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit">{initial ? t('common.save') : t('common.add')}</Button>
      </div>
    </form>
  )
}
