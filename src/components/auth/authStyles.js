/** Shared styling and motion presets for the login and registration pages. */
export const CURRENT_YEAR = new Date().getFullYear()

export const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.075, delayChildren: 0.14 } },
}

export const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

export const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100'

export const inputErrorClass =
  'w-full rounded-xl border border-red-300 bg-red-50/60 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-red-300 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100'

export const labelClass = 'mb-2 block text-xs font-semibold tracking-wide text-slate-600'

export const linkClass = 'font-semibold text-blue-600 transition hover:text-blue-700 hover:underline'
