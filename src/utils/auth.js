import { sha256 } from './crypto'

/**
 * Frontend-only demo authentication for a single private owner.
 *
 * The owner address and a SHA-256 password digest come from Vite environment
 * variables (see `.env.example`). This is a convenience gate, NOT real
 * security — anything shipped to the browser can be read by the browser.
 */
export const AUTH_STORAGE_KEY = 'smart-money.auth.v1'

const GMAIL_PATTERN = /^[a-z0-9._%+-]+@gmail\.com$/i
const HASH_PATTERN = /^[a-f0-9]{64}$/

export const OWNER_EMAIL = String(import.meta.env.VITE_OWNER_EMAIL || '').trim().toLowerCase()
const ownerHash = String(import.meta.env.VITE_OWNER_PASSWORD_HASH || '').trim().toLowerCase()

export const isAuthConfigured = GMAIL_PATTERN.test(OWNER_EMAIL) && HASH_PATTERN.test(ownerHash)

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
}

export function isGmail(value) {
  return GMAIL_PATTERN.test(normalizeEmail(value))
}

export function isOwnerEmail(value) {
  return isAuthConfigured && normalizeEmail(value) === OWNER_EMAIL
}

function safeEqual(left, right) {
  if (left.length !== right.length) return false
  let difference = 0
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return difference === 0
}

export async function verifyPassword(password) {
  if (!isAuthConfigured) return false
  const digest = await sha256(String(password || ''))
  return safeEqual(digest, ownerHash)
}

function getStorage(kind) {
  try {
    return typeof window === 'undefined' ? null : window[kind]
  } catch {
    return null
  }
}

function readFrom(kind) {
  try {
    const raw = getStorage(kind)?.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    if (!session || typeof session !== 'object') return null
    if (!isOwnerEmail(session.email) || typeof session.remember !== 'boolean') return null
    return {
      email: normalizeEmail(session.email),
      remember: session.remember,
      issuedAt: session.issuedAt || null,
    }
  } catch {
    return null
  }
}

export function clearSession(kind) {
  const storages = kind ? [kind] : ['localStorage', 'sessionStorage']
  storages.forEach((storageName) => {
    try {
      getStorage(storageName)?.removeItem(AUTH_STORAGE_KEY)
    } catch {
      // Storage can be unavailable in private browsing — ignore it.
    }
  })
}

/** Return a remembered session first, otherwise the current tab session. */
export function readSession() {
  const remembered = readFrom('localStorage')
  const tabSession = readFrom('sessionStorage')

  if (remembered) {
    if (tabSession) clearSession('sessionStorage')
    return remembered
  }
  if (tabSession) return tabSession

  clearSession()
  return null
}

/** Persist the session in localStorage (remember me) or sessionStorage. */
export function saveSession(session) {
  clearSession()
  try {
    getStorage(session.remember ? 'localStorage' : 'sessionStorage')?.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify(session),
    )
  } catch {
    // If storage is blocked the session simply lasts until a refresh.
  }
}
