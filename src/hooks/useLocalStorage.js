import { useEffect, useState } from 'react'

/**
 * Reusable localStorage-backed state hook.
 *
 * The stored value is read once during the lazy initialiser. If a value already
 * exists it is returned as-is, so seed/demo data never overwrites real user
 * data when the application starts. Every subsequent state change is persisted.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw !== null) return JSON.parse(raw)
    } catch (error) {
      console.warn('Could not read localStorage key:', key, error)
    }

    const fallback = typeof initialValue === 'function' ? initialValue() : initialValue
    try {
      window.localStorage.setItem(key, JSON.stringify(fallback))
    } catch (error) {
      console.warn('Could not write localStorage key:', key, error)
    }
    return fallback
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn('Could not persist localStorage key:', key, error)
    }
  }, [key, value])

  return [value, setValue]
}

export default useLocalStorage
