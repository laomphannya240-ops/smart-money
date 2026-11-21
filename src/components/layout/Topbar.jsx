import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Languages, Menu, Moon, Plus, Sun } from 'lucide-react'
import { NAV_ITEMS } from '../../utils/constants'
import { useFinance } from '../../hooks/useFinance'
import { useI18n } from '../../hooks/useI18n'
import MonthPicker from '../common/MonthPicker'
import TransactionForm from '../transactions/TransactionForm'
import Modal from '../common/Modal'
import Button from '../common/Button'

export default function Topbar({ onMenu }) {
  const location = useLocation()
  const { settings, updateSettings } = useFinance()
  const { t } = useI18n()
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  const current = NAV_ITEMS.find((item) => item.path === location.pathname) || NAV_ITEMS[0]
  const isDark = settings.theme === 'dark'

  return (
    <header
      className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-3 border-b px-4 backdrop-blur-md sm:px-6 lg:px-8"
      style={{
        background: 'color-mix(in srgb, var(--surface) 88%, transparent)',
        borderColor: 'var(--line)',
      }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" className="btn-icon lg:hidden" onClick={onMenu} aria-label="Open menu">
          <Menu size={21} />
        </button>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold sm:text-base">{t(current.key)}</p>
          <p className="hidden text-xs sm:block" style={{ color: 'var(--muted)' }}>{t('app.tagline')}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <MonthPicker className="mr-1 hidden md:flex" />
        <button
          type="button"
          className="btn-icon"
          onClick={() => updateSettings({ language: settings.language === 'en' ? 'km' : 'en' })}
          title={t('settings.language')}
          aria-label={t('settings.language')}
        >
          <Languages size={18} />
        </button>
        <button
          type="button"
          className="btn-icon"
          onClick={() => updateSettings({ theme: isDark ? 'light' : 'dark' })}
          title={t('settings.theme')}
          aria-label={t('settings.theme')}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <Button icon={Plus} onClick={() => setQuickAddOpen(true)} className="!px-3 sm:!px-4">
          <span className="hidden sm:inline">{t('dash.quickAdd')}</span>
        </Button>
      </div>

      <Modal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        title={t('trans.add')}
        subtitle={t('trans.subtitle')}
      >
        <TransactionForm onSuccess={() => setQuickAddOpen(false)} onCancel={() => setQuickAddOpen(false)} />
      </Modal>
    </header>
  )
}
