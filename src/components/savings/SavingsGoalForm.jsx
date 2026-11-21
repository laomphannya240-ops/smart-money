import { useId, useState } from 'react'
import { useFinance } from '../../hooks/useFinance'
import { useI18n } from '../../hooks/useI18n'
import { GOAL_COLORS } from '../../utils/constants'
import { fromBase, toBase } from '../../utils/format'
import Button from '../common/Button'
import Field from '../common/Field'

export default function SavingsGoalForm({ initial, onSuccess, onCancel }) {
  const { addGoal, updateGoal } = useFinance()
  const { t, currency } = useI18n()
  const formId = useId()

  const [name, setName] = useState(initial?.name || '')
  const [target, setTarget] = useState(initial ? String(fromBase(initial.target, currency)) : '')
  const [description, setDescription] = useState(initial?.description || '')
  const [color, setColor] = useState(initial?.color || GOAL_COLORS[0])
  const [errors, setErrors] = useState({})

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!name.trim()) nextErrors.name = t('validation.nameRequired')
    const numericTarget = Number(target)
    if (target === '' || !Number.isFinite(numericTarget) || numericTarget <= 0) {
      nextErrors.target = t('validation.targetPositive')
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const values = {
      name: name.trim(),
      target: toBase(target, currency),
      description: description.trim(),
      color,
    }
    if (initial) updateGoal(initial.id, values)
    else addGoal(values)
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label={t('savings.goalName')} error={errors.name} required htmlFor={`${formId}-name`}>
        <input
          id={`${formId}-name`}
          className={`input ${errors.name ? 'input-error' : ''}`}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Emergency fund"
          maxLength={60}
          autoFocus
        />
      </Field>

      <Field
        label={`${t('savings.target')} (${currency})`}
        error={errors.target}
        required
        htmlFor={`${formId}-target`}
      >
        <input
          id={`${formId}-target`}
          className={`input ${errors.target ? 'input-error' : ''}`}
          type="number"
          inputMode="decimal"
          min={currency === 'KHR' ? 1 : 0.01}
          step={currency === 'KHR' ? 1 : 0.01}
          value={target}
          onChange={(event) => setTarget(event.target.value)}
          placeholder="0.00"
        />
      </Field>

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

      <Field label={t('savings.color')}>
        <div className="flex flex-wrap gap-2">
          {GOAL_COLORS.map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => setColor(swatch)}
              className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                background: swatch,
                borderColor: color === swatch ? 'var(--text)' : 'transparent',
                boxShadow: color === swatch ? '0 0 0 2px var(--surface) inset' : undefined,
              }}
              aria-label={swatch}
            />
          ))}
        </div>
      </Field>

      <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end" style={{ borderColor: 'var(--line)' }}>
        <Button variant="secondary" onClick={onCancel}>{t('common.cancel')}</Button>
        <Button type="submit">{initial ? t('common.save') : t('savings.createGoal')}</Button>
      </div>
    </form>
  )
}
