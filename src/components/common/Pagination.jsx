import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from './Button'
import { useI18n } from '../../hooks/useI18n'

export default function Pagination({ page, totalPages, total, start, end, onChange }) {
  const { t } = useI18n()
  if (total === 0) return null

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row" style={{ borderColor: 'var(--line)' }}>
      <p className="text-xs" style={{ color: 'var(--muted)' }}>
        {t('common.showing', { start, end, total })}
      </p>
      <div className="flex items-center gap-2">
        <span className="mr-1 hidden text-xs sm:inline" style={{ color: 'var(--muted)' }}>
          {t('common.page', { page, total: totalPages })}
        </span>
        <Button
          variant="secondary"
          size="sm"
          icon={ChevronLeft}
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label={t('common.previous')}
        />
        <Button
          variant="secondary"
          size="sm"
          iconRight={ChevronRight}
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label={t('common.next')}
        />
      </div>
    </div>
  )
}
