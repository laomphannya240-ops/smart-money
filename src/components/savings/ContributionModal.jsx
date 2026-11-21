import { useId, useState } from 'react'
import { useFinance } from '../../hooks/useFinance'
import { useI18n } from '../../hooks/useI18n'
import { goalCurrent } from '../../utils/finance'
import { fromBase, toBase, toISODate } from '../../utils/format'
import Button from '../common/Button'
import Field from '../common/Field'

const TODAY = toISODate(new Date())

export default function ContributionModal({ goal, onSuccess, onCancel }) {
  const { addContribution } = useFinance()
  const { t, currency, formatMoney } = useI18n()
  const formId = useId()

  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(TODAY)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const current = goalCurrent(goal)
  const remaining = Math.max(0, goal.target - current)

  const handleSubmit = (event) => {
    event.preventDefault()
    const numeric = Number(amount)
    if (amount === '' || !Number.isFinite(numeric) || numeric <= 0) {
      setError(t('validation.amountPositive'))
      return
    }
    if (!date) {
      setError(t('validation.dateRequired'))
      return
    }
    if (toBase(numeric, currency) > remaining + 0.00001) {
      setError(t('savings.overContribute'))
      return
    }
    addContribution(goal.id, {
      amount: toBase(numeric, currency),
      date,
      note: note.trim(),
    })
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="card-soft p-3.5 text-sm">
        <p className="font-semibold">{goal.name}</p>
        <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
          {formatMoney(current)} / {formatMoney(goal.target)} · {formatMoney(remaining)} {t('common.remaining').toLowerCase()}
        </p>
      </div>

      <Field
        label={`${t('common.amount')} (${currency})`}
        error={error}
        required
        htmlFor={`${formId}-amount`}
      >
        <input
          id={`${formId}-amount`}
          className={`input ${error ? 'input-error' : ''}`}
          type="number"
          inputMode="decimal"
          min={currency === 'KHR' ? 1 : 0.01}
          step={currency === 'KHR' ? 1 : 0.01}
          value={amount}
          onChange={(event) => {
            setAmount(event.target.value)
            setError('')
          }}
          placeholder={fromBase(remaining, currency).toFixed(currency === 'KHR' ? 0 : 2)}
          autoFocus
        />
      </Field>

      <Field label={t('savings.contributionDate')} required htmlFor={`${formId}-date`}>
        <input
          id={`${formId}-date`}
          className="input"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </Field>

      <Field label={t('common.note')} htmlFor={`${formId}-note`}>
        <input
          id={`${formId}-note`}
          className="input"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={t('common.optional')}
          maxLength={120}
        />
      </Field>

      <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end" style={{ borderColor: 'var(--line)' }}>
        <Button variant="secondary" onClick={onCancel}>{t('common.cancel')}</Button>
        <Button type="submit" disabled={remaining <= 0}>{t('savings.contribute')}</Button>
      </div>
    </form>
  )
}
