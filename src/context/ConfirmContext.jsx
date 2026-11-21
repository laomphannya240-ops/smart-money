import { useCallback, useMemo, useRef, useState } from 'react'
import Modal from '../components/common/Modal'
import Button from '../components/common/Button'
import { ConfirmContext } from './contexts'

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null)
  const resolver = useRef(null)

  const confirm = useCallback((options) => {
    resolver.current?.(false)
    return new Promise((resolve) => {
      resolver.current = resolve
      setDialog({
        danger: true,
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel',
        ...options,
      })
    })
  }, [])

  const settle = useCallback((result) => {
    const resolve = resolver.current
    resolver.current = null
    setDialog(null)
    resolve?.(result)
  }, [])

  const value = useMemo(() => ({ confirm }), [confirm])

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Modal
        open={Boolean(dialog)}
        onClose={() => settle(false)}
        title={dialog?.title || ''}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => settle(false)}>
              {dialog?.cancelLabel}
            </Button>
            <Button
              variant={dialog?.danger === false ? 'primary' : 'danger'}
              onClick={() => settle(true)}
            >
              {dialog?.confirmLabel}
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
          {dialog?.message}
        </p>
      </Modal>
    </ConfirmContext.Provider>
  )
}
