import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from './contexts'
import {
  clearSession,
  isAuthConfigured,
  isGmail,
  isOwnerEmail,
  OWNER_EMAIL,
  readSession,
  saveSession,
  verifyPassword,
} from '../utils/auth'

/**
 * Owns the demo login session only. Finance data keeps using its own
 * LocalStorage key, so signing in or out never touches user records.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession())

  const login = useCallback(async ({ email, password, remember }) => {
    if (!isAuthConfigured) {
      return { ok: false, field: 'email', message: 'auth.errorNotConfigured' }
    }

    const normalized = String(email || '').trim().toLowerCase()
    if (!normalized) return { ok: false, field: 'email', message: 'auth.errorRequiredEmail' }
    if (!isGmail(normalized)) return { ok: false, field: 'email', message: 'auth.errorInvalidEmail' }
    if (!isOwnerEmail(normalized)) {
      return { ok: false, field: 'email', message: 'auth.errorUnauthorizedEmail' }
    }
    if (!String(password || '')) {
      return { ok: false, field: 'password', message: 'auth.errorRequiredPassword' }
    }

    const valid = await verifyPassword(password)
    if (!valid) return { ok: false, field: 'password', message: 'auth.errorPassword' }

    const session = {
      email: normalized,
      remember: Boolean(remember),
      issuedAt: new Date().toISOString(),
    }
    saveSession(session)
    setUser(session)
    return { ok: true }
  }, [])

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
      logout,
    }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
