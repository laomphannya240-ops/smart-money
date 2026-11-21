import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { createId } from '../utils/id'
import { ToastContext } from './contexts'

const ICONS = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
}

const TONES = {
  success: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/15',
  error: 'text-red-500 bg-red-50 dark:bg-red-500/15',
  info: 'text-brand-500 bg-brand-50 dark:bg-brand-500/15',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    const timer = timers.current.get(id)
    if (timer) clearTimeout(timer)
    timers.current.delete(id)
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback(
    (message, type = 'success') => {
      const id = createId('toast')
      setToasts((current) => [...current.slice(-3), { id, message, type }])
      const timer = setTimeout(() => dismiss(id), 3800)
      timers.current.set(id, timer)
      return id
    },
    [dismiss],
  )

  useEffect(() => {
    const currentTimers = timers.current
    return () => currentTimers.forEach((timer) => clearTimeout(timer))
  }, [])

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-[200] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const Icon = ICONS[toast.type] || Info
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.97 }}
                transition={{ duration: 0.22 }}
                className="pointer-events-auto flex items-start gap-3 rounded-xl p-3.5 shadow-lg"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  boxShadow: 'var(--shadow-pop)',
                }}
                role="status"
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${TONES[toast.type] || TONES.info}`}>
                  <Icon size={17} />
                </span>
                <p className="flex-1 pt-1 text-sm font-medium leading-snug">{toast.message}</p>
                <button type="button" onClick={() => dismiss(toast.id)} className="btn-icon !h-7 !w-7" aria-label="Dismiss">
                  <X size={15} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
