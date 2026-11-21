import { useRef, useState } from 'react'
import {
  Database,
  Download,
  FileSpreadsheet,
  Globe,
  Moon,
  RotateCcw,
  ShieldCheck,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react'
import { useFinance } from '../hooks/useFinance'
import { useI18n } from '../hooks/useI18n'
import { useConfirm } from '../hooks/useConfirm'
import { CURRENCIES, STORAGE_KEY, USD_TO_KHR } from '../utils/constants'
import { downloadFile, transactionsToCSV } from '../utils/format'
import AnimatedPage from '../components/common/AnimatedPage'
import PageHeader from '../components/common/PageHeader'
import Button from '../components/common/Button'

function SettingRow({ icon: Icon, title, description, children }) {
  return (
    <div className="flex flex-col gap-4 border-b p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: 'var(--line)' }}>
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
            <Icon size={17} />
          </span>
        )}
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>{description}</p>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export default function Settings() {
  const {
    settings,
    updateSettings,
    data,
    transactions,
    savingsGoals,
    budgets,
    replaceData,
    clearAllData,
    resetDemoData,
  } = useFinance()
  const { t } = useI18n()
  const { confirm } = useConfirm()
  const fileInput = useRef(null)
  const [importError, setImportError] = useState('')

  const exportCsv = () => {
    const csv = transactionsToCSV(transactions, settings.currency, t)
    downloadFile(`smart-money-transactions-${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv;charset=utf-8')
  }

  const exportBackup = () => {
    downloadFile(
      `smart-money-backup-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(data, null, 2),
      'application/json',
    )
  }

  const handleImport = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImportError('')

    if (!file.name.toLowerCase().endsWith('.json')) {
      setImportError(t('validation.invalidFile'))
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        if (
          !parsed ||
          typeof parsed !== 'object' ||
          !Array.isArray(parsed.transactions) ||
          !Array.isArray(parsed.savingsGoals) ||
          !parsed.budgets ||
          typeof parsed.budgets !== 'object'
        ) {
          throw new Error('Invalid backup')
        }
        const confirmed = await confirm({
          title: t('settings.importBackup'),
          message: t('confirm.resetMessage'),
          confirmLabel: t('common.import'),
          cancelLabel: t('common.cancel'),
          danger: false,
        })
        if (confirmed) replaceData(parsed)
      } catch {
        setImportError(t('settings.importError'))
      }
    }
    reader.onerror = () => setImportError(t('settings.importError'))
    reader.readAsText(file)
    event.target.value = ''
  }

  const handleClear = async () => {
    const confirmed = await confirm({
      title: t('confirm.clearTitle'),
      message: t('confirm.clearMessage'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
    })
    if (confirmed) clearAllData()
  }

  const handleReset = async () => {
    const confirmed = await confirm({
      title: t('confirm.resetTitle'),
      message: t('confirm.resetMessage'),
      confirmLabel: t('common.import'),
      cancelLabel: t('common.cancel'),
      danger: false,
    })
    if (confirmed) resetDemoData()
  }

  return (
    <AnimatedPage>
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="border-b px-5 py-4" style={{ borderColor: 'var(--line)' }}>
            <h2 className="text-base font-bold">{t('settings.preferences')}</h2>
          </div>
          <SettingRow icon={Globe} title={t('settings.language')} description={t('settings.languageDesc')}>
            <select
              className="input w-40 cursor-pointer"
              value={settings.language}
              onChange={(event) => updateSettings({ language: event.target.value })}
              aria-label={t('settings.language')}
            >
              <option value="en">English</option>
              <option value="km">ខ្មែរ (Khmer)</option>
            </select>
          </SettingRow>

          <SettingRow icon={settings.theme === 'dark' ? Moon : Sun} title={t('settings.theme')} description={t('settings.themeDesc')}>
            <div className="inline-flex rounded-xl p-1" style={{ background: 'var(--surface-soft)' }}>
              {[
                { id: 'light', label: t('settings.light'), icon: Sun },
                { id: 'dark', label: t('settings.dark'), icon: Moon },
              ].map((option) => {
                const Icon = option.icon
                const active = settings.theme === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => updateSettings({ theme: option.id })}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      active ? 'bg-[var(--surface)] shadow-sm' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <Icon size={14} /> {option.label}
                  </button>
                )
              })}
            </div>
          </SettingRow>

          <SettingRow icon={Database} title={t('settings.currency')} description={t('settings.currencyDesc')}>
            <select
              className="input w-40 cursor-pointer"
              value={settings.currency}
              onChange={(event) => updateSettings({ currency: event.target.value })}
              aria-label={t('settings.currency')}
            >
              {CURRENCIES.map((currency) => (
                <option key={currency.id} value={currency.id}>
                  {currency.id} — {currency.label}
                </option>
              ))}
            </select>
          </SettingRow>
          <div className="px-5 py-3 text-[11px]" style={{ color: 'var(--muted)' }}>
            {t('settings.exchangeRate')} · {USD_TO_KHR.toLocaleString('en-US')}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="border-b px-5 py-4" style={{ borderColor: 'var(--line)' }}>
            <h2 className="text-base font-bold">{t('settings.dataManagement')}</h2>
          </div>
          <SettingRow icon={FileSpreadsheet} title={t('settings.exportCsv')} description={t('settings.exportCsvDesc')}>
            <Button variant="secondary" icon={Download} onClick={exportCsv} disabled={!transactions.length}>
              CSV
            </Button>
          </SettingRow>
          <SettingRow icon={Download} title={t('settings.exportBackup')} description={t('settings.exportBackupDesc')}>
            <Button variant="secondary" icon={Download} onClick={exportBackup}>JSON</Button>
          </SettingRow>
          <SettingRow icon={Upload} title={t('settings.importBackup')} description={t('settings.importBackupDesc')}>
            <input ref={fileInput} type="file" accept=".json,application/json" onChange={handleImport} className="hidden" />
            <Button variant="secondary" icon={Upload} onClick={() => fileInput.current?.click()}>
              {t('settings.chooseFile')}
            </Button>
          </SettingRow>
          {importError && <p className="px-5 pb-3 text-xs font-medium text-red-500">{importError}</p>}
          <SettingRow icon={RotateCcw} title={t('settings.resetDemo')} description={t('settings.resetDemoDesc')}>
            <Button variant="secondary" icon={RotateCcw} onClick={handleReset}>{t('common.reset')}</Button>
          </SettingRow>
          <SettingRow icon={Trash2} title={t('settings.clearData')} description={t('settings.clearDataDesc')}>
            <Button variant="danger" icon={Trash2} onClick={handleClear}>{t('common.delete')}</Button>
          </SettingRow>
        </div>
      </div>

      <div className="card mt-5 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
            <ShieldCheck size={20} />
          </span>
          <div>
            <p className="text-sm font-bold">{t('settings.storageTitle')}</p>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>{t('settings.storageDesc')}</p>
            <p className="mt-1.5 text-[11px]" style={{ color: 'var(--muted)' }}>
              {t('settings.storageInfo', {
                transactions: transactions.length,
                goals: savingsGoals.length,
                budgets: Object.keys(budgets).length,
              })}
            </p>
            <code className="mt-1 block text-[10px]" style={{ color: 'var(--muted)' }}>{STORAGE_KEY}</code>
          </div>
        </div>
        <div className="shrink-0 rounded-xl px-4 py-3" style={{ background: 'var(--surface-soft)' }}>
          <p className="text-xs font-bold">{t('settings.about')}</p>
          <p className="mt-1 max-w-xs text-[11px]" style={{ color: 'var(--muted)' }}>{t('settings.aboutText')}</p>
        </div>
      </div>
    </AnimatedPage>
  )
}
