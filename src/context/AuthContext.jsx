import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from './contexts'
import { isAuthConfigured, isGmail, normalizeEmail, OWNER_EMAIL } from '../utils/auth'
import {
  clearSession,
  getAccount,
  initializeAccounts,
  readSession,
  registerAccount,
  saveSession,
  verifyAccount,
} from '../utils/accounts'

/**
 * Owns account sessions only. Each account's finance data is keyed separately,
 * so signing in, out, or into another account never mixes records.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    initializeAccounts()
    return readSession()
  })

  const startSession = useCallback((email, remember) => {
    const session = {
      email: normalizeEmail(email),
      remember: Boolean(remember),
      issuedAt: new Date().toISOString(),
    }
    saveSession(session)
    setUser(session)
  }, [])

  const login = useCallback(
    async ({ email, password, remember }) => {
      const normalized = normalizeEmail(email)
      if (!normalized) return { ok: false, field: 'email', message: 'auth.errorRequiredEmail' }
      if (!isGmail(normalized)) return { ok: false, field: 'email', message: 'auth.errorInvalidEmail' }
      if (!getAccount(normalized)) return { ok: false, field: 'email', message: 'auth.errorNoAccount' }
      if (!String(password || '')) {
        return { ok: false, field: 'password', message: 'auth.errorRequiredPassword' }
      }
      if (!(await verifyAccount(normalized, password))) {
        return { ok: false, field: 'password', message: 'auth.errorPassword' }
      }

      startSession(normalized, remember)
      return { ok: true }
    },
    [startSession],
  )

  const register = useCallback(
    async ({ email, password, remember }) => {
      if (!String(password || '')) {
        return { ok: false, field: 'password', message: 'auth.errorRequiredPassword' }
      }
      const result = await registerAccount({ email, password })
      if (!result.ok) {
        const field = result.message === 'auth.errorPasswordShort' ? 'password' : 'email'
        return { ok: false, field, message: result.message }
      }

      startSession(result.email, remember)
      return { ok: true }
    },
    [startSession],
  )

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      email: user?.email || '',
      isAuthenticated: Boolean(user),
      isConfigured: isAuthConfigured,
      ownerEmail: OWNER_EMAIL,
      login,
      register,
      logout,
    }),
    [user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
