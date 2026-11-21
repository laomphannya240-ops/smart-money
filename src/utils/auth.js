import { sha256 } from './crypto'

/**
 * Shared authentication primitives. Account records and sessions live in
 * `accounts.js`; this module only owns the owner configuration and hashing.
 */
export const AUTH_STORAGE_KEY = 'smart-money.auth.v1'

const GMAIL_PATTERN = /^[a-z0-9._%+-]+@gmail\.com$/i
export const HASH_PATTERN = /^[a-f0-9]{64}$/

export const OWNER_EMAIL = String(import.meta.env.VITE_OWNER_EMAIL || '').trim().toLowerCase()
export const OWNER_PASSWORD_HASH = String(import.meta.env.VITE_OWNER_PASSWORD_HASH || '').trim().toLowerCase()
export const isAuthConfigured = GMAIL_PATTERN.test(OWNER_EMAIL) && HASH_PATTERN.test(OWNER_PASSWORD_HASH)

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
}

export function isGmail(value) {
  return GMAIL_PATTERN.test(normalizeEmail(value))
}

export function isOwnerEmail(value) {
  return isAuthConfigured && normalizeEmail(value) === OWNER_EMAIL
}

export function isValidHash(value) {
  return HASH_PATTERN.test(String(value || '').toLowerCase())
}

function safeEqual(left, right) {
  if (left.length !== right.length) return false
  let difference = 0
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return difference === 0
}

export async function hashPassword(password) {
  return sha256(String(password || ''))
}

/** Compare a plaintext password with a stored SHA-256 digest. */
export async function verifyHash(password, hash) {
  if (!isValidHash(hash)) return false
  return safeEqual(await hashPassword(password), String(hash).toLowerCase())
}
