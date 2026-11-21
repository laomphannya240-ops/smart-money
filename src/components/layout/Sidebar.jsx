import { AnimatePresence, motion } from 'framer-motion'
import { NavLink, useNavigate } from 'react-router-dom'
import { ArrowUpRight, LogOut, ShieldCheck, X } from 'lucide-react'
import logo from '../../assets/logo.svg'
import { NAV_ITEMS } from '../../utils/constants'
import { useAuth } from '../../hooks/useAuth'
import { useI18n } from '../../hooks/useI18n'

const GROUPS = [
  { key: 'nav.group', paths: ['/', '/income', '/expenses'] },
  { key: 'nav.manage', paths: ['/savings', '/budgets', '/transactions', '/reports'] },
  { key: 'nav.system', paths: ['/settings'] },
]

export default function Sidebar({ open, onClose }) {
  const { t } = useI18n()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    onClose()
    navigate('/login', { replace: true })
  }

  const sidebar = (
    <div
      className="flex h-full w-[264px] flex-col border-r"
      style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}
    >
      <div className="flex h-[72px] shrink-0 items-center justify-between border-b px-5" style={{ borderColor: 'var(--line)' }}>
        <NavLink to="/" className="flex items-center gap-2.5" onClick={onClose}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 shadow-md shadow-brand-600/25">
            <img src={logo} alt="" className="h-8 w-8" />
          </span>
          <span>
            <span className="block text-[17px] font-bold leading-tight tracking-tight">Smart Money</span>
            <span className="block text-[11px]" style={{ color: 'var(--muted)' }}>{t('app.tagline')}</span>
          </span>
        </NavLink>
        <button type="button" className="btn-icon lg:hidden" onClick={onClose} aria-label={t('common.close')}>
          <X size={19} />
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {GROUPS.map((group) => (
          <div key={group.key}>
            <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: 'var(--muted)' }}>
              {t(group.key)}
            </p>
            <div className="space-y-1">
              {NAV_ITEMS.filter((item) => group.paths.includes(item.path)).map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/70'
                      }`
                    }
                    style={({ isActive }) => (!isActive ? { color: 'var(--muted)' } : undefined)}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={18} strokeWidth={isActive ? 2.3 : 1.9} />
                        <span className="flex-1">{t(item.key)}</span>
                        {isActive && <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4">
        <div className="card-soft p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
            <ShieldCheck size={17} />
          </div>
          <p className="text-xs font-semibold">Private by design</p>
          <p className="mt-1 text-[11px] leading-relaxed" style={{ color: 'var(--muted)' }}>
            Your financial data never leaves this browser.
          </p>
          <a
            href="https://en.wikipedia.org/wiki/Local_storage"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-300"
          >
            Learn more <ArrowUpRight size={12} />
          </a>
          <button
            type="button"
            onClick={handleLogout}
            aria-label={t('auth.logout')}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
            style={{ borderColor: 'var(--line-strong)', color: 'var(--muted)' }}
          >
            <LogOut size={14} />
            {t('auth.logout')}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</aside>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-slate-950/45 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
