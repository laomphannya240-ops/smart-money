import { createEmptyData } from './demoData'
import { STORAGE_KEY } from './constants'
import {
  AUTH_STORAGE_KEY,
  OWNER_EMAIL,
  OWNER_PASSWORD_HASH,
  hashPassword,
  isAuthConfigured,
  isGmail,
  normalizeEmail,
  verifyHash,
} from './auth'

/**
 * Local account registry and per-account finance data keys.
 *
 * Passwords are stored as SHA-256 digests, never in plaintext. This is still a
 * browser-only demo: anyone with access to this device's storage can inspect
 * or alter the records. See the security note in README.md.
 */
export const ACCOUNTS_KEY = 'smart-money.accounts.v1'
export const ACCOUNT_DATA_PREFIX = 'smart-money.data.v1.'

const MIN_PASSWORD_LENGTH = 8

function getStorage(kind) {
  try {
    return typeof window === 'undefined' ? null : window[kind]
  } catch {
    return null
  }
}

function readJSON(key) {
  try {
    const raw = getStorage('localStorage')?.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeJSON(key, value) {
  try {
    getStorage('localStorage')?.setItem(key, JSON.stringify(value))
  } catch {
    // Storage may be blocked in private browsing — keep the in-memory session.
  }
}

function removeKey(key, kind = 'localStorage') {
  try {
    getStorage(kind)?.removeItem(key)
  } catch {
    // Ignore unavailable storage.
  }
}

export function accountDataKey(email) {
  return `${ACCOUNT_DATA_PREFIX}${normalizeEmail(email)}`
}

export function readAccounts() {
  const accounts = readJSON(ACCOUNTS_KEY)
  return accounts && typeof accounts === 'object' && !Array.isArray(accounts) ? accounts : {}
}

export function writeAccounts(accounts) {
  writeJSON(ACCOUNTS_KEY, accounts)
}

export function getAccount(email) {
  const account = readAccounts()[normalizeEmail(email)]
  return account && typeof account === 'object' ? account : null
}

let initialized = false

/**
 * Seeds the configured owner account and moves the legacy single-user data
 * into that account exactly once. The original key is left untouched as a
 * backup, so existing records are never lost.
 */
export function initializeAccounts() {
  if (initialized) return
  initialized = true

  const accounts = readAccounts()

  if (isAuthConfigured && OWNER_EMAIL) {
    const existing = accounts[OWNER_EMAIL]
    accounts[OWNER_EMAIL] = {
      ...(existing || {}),
      email: OWNER_EMAIL,
      passwordHash: OWNER_PASSWORD_HASH,
      createdAt: existing?.createdAt || new Date().toISOString(),
    }

    const legacy = readJSON(STORAGE_KEY)
    const ownerDataKey = accountDataKey(OWNER_EMAIL)
    if (legacy && !Array.isArray(legacy) && getStorage('localStorage')?.getItem(ownerDataKey) === null) {
      writeJSON(ownerDataKey, legacy)
    }
  }

  writeAccounts(accounts)
}

/** Create a new Gmail account with an empty, isolated finance store. */
export async function registerAccount({ email, password }) {
  const normalized = normalizeEmail(email)
  if (!isGmail(normalized)) return { ok: false, message: 'auth.errorInvalidEmail' }
  if (!isValidPassword(password)) return { ok: false, message: 'auth.errorPasswordShort' }

  const accounts = readAccounts()
  if (accounts[normalized]) return { ok: false, message: 'auth.errorAccountExists' }

  accounts[normalized] = {
    email: normalized,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  }
  writeAccounts(accounts)

  const dataKey = accountDataKey(normalized)
  if (getStorage('localStorage')?.getItem(dataKey) === null) writeJSON(dataKey, createEmptyData())

  return { ok: true, email: normalized }
}

function isValidPassword(password) {
  return String(password || '').length >= MIN_PASSWORD_LENGTH
}

export async function verifyAccount(email, password) {
  const account = getAccount(email)
  if (!account) return false
  return verifyHash(password, account.passwordHash)
}

function readFrom(kind) {
  try {
    const raw = getStorage(kind)?.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    if (!session || typeof session !== 'object') return null
    if (!getAccount(session.email) || typeof session.remember !== 'boolean') return null
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
  storages.forEach((storageName) => removeKey(AUTH_STORAGE_KEY, storageName))
}

/** Prefer a remembered session, otherwise use the current tab session. */
export function readSession() {
  const remembered = readFrom('localStorage')
  const tabSession = readFrom('sessionStorage')

  if (remembered) {
    if (tabSession) removeKey(AUTH_STORAGE_KEY, 'sessionStorage')
    return remembered
  }
  if (tabSession) return tabSession

  clearSession()
  return null
}

export function saveSession(session) {
  clearSession()
  writeJSONTo(session.remember ? 'localStorage' : 'sessionStorage', AUTH_STORAGE_KEY, session)
}

function writeJSONTo(kind, key, value) {
  try {
    getStorage(kind)?.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore unavailable storage.
  }
}
