import { USD_TO_KHR } from './constants'

/** Convert an amount in the selected display currency into stored base units (USD). */
export function toBase(amount, currency = 'USD') {
  const value = Number(amount) || 0
  return currency === 'KHR' ? value / USD_TO_KHR : value
}

/** Convert stored base units (USD) into the selected display currency. */
export function fromBase(amount, currency = 'USD') {
  const value = Number(amount) || 0
  return currency === 'KHR' ? value * USD_TO_KHR : value
}

export function formatCurrency(baseAmount, currency = 'USD', options = {}) {
  const { compact = false, signed = false } = options
  const value = fromBase(baseAmount, currency)
  const sign = signed && value > 0 ? '+' : value < 0 ? '-' : ''
  const absolute = Math.abs(value)
  const symbol = currency === 'KHR' ? '៛' : '$'

  if (compact && absolute >= 1000000) {
    return `${sign}${symbol}${(absolute / 1000000).toFixed(1)}M`
  }
  if (compact && currency === 'KHR' && absolute >= 1000) {
    return `${sign}៛${(absolute / 1000).toFixed(absolute >= 10000 ? 0 : 1)}K`
  }
  if (compact && absolute >= 1000) {
    return `${sign}$${(absolute / 1000).toFixed(1)}K`
  }

  if (currency === 'KHR') {
    return `${sign}៛${Math.round(absolute).toLocaleString('en-US')}`
  }

  return `${sign}$${absolute.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatNumber(value, maximumFractionDigits = 0) {
  return Number(value || 0).toLocaleString('en-US', {
    maximumFractionDigits,
  })
}

export function formatPercent(value) {
  const number = Number(value) || 0
  return `${number.toFixed(number % 1 === 0 ? 0 : 1)}%`
}

export function formatDate(dateString, language = 'en', options = {}) {
  if (!dateString) return '—'
  const date = new Date(`${String(dateString).slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(language === 'km' ? 'km-KH' : 'en-US', {
    month: options.monthOnly ? undefined : 'short',
    day: options.monthOnly ? undefined : 'numeric',
    year: options.withoutYear ? undefined : 'numeric',
    ...options,
  }).format(date)
}

export function formatMonthYear(month, year, language = 'en') {
  const date = new Date(Number(year), Number(month), 1)
  return new Intl.DateTimeFormat(language === 'km' ? 'km-KH' : 'en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function monthKey(month, year) {
  return `${Number(year)}-${String(Number(month) + 1).padStart(2, '0')}`
}

export function toISODate(date) {
  const value = date instanceof Date ? date : new Date(date)
  const offset = value.getTimezoneOffset() * 60000
  return new Date(value.getTime() - offset).toISOString().slice(0, 10)
}

export function getDateParts(isoDate) {
  const date = isoDate ? new Date(`${String(isoDate).slice(0, 10)}T00:00:00`) : new Date()
  return {
    month: date.getMonth(),
    year: date.getFullYear(),
    day: date.getDate(),
  }
}

export function downloadFile(filename, content, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

function escapeCsv(value) {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

export function transactionsToCSV(transactions, currency = 'USD', translate = (key) => key) {
  const headers = [
    translate('common.date'),
    translate('common.type'),
    translate('common.title'),
    translate('common.category'),
    translate('common.source'),
    translate('common.description'),
    `${translate('common.amount')} (${currency})`,
  ]

  const rows = [...transactions]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .map((transaction) =>
      [
        transaction.date,
        translate(transaction.type === 'income' ? 'common.income' : 'common.expense'),
        transaction.title,
        translateCategory(transaction.category, translate),
        transaction.source || '',
        transaction.description || '',
        fromBase(transaction.amount, currency).toFixed(currency === 'KHR' ? 0 : 2),
      ]
        .map(escapeCsv)
        .join(','),
    )

  return `\uFEFF${headers.map(escapeCsv).join(',')}\r\n${rows.join('\r\n')}`
}

function translateCategory(id, translate) {
  const key = `cat.${String(id || 'other').toLowerCase()}`
  const translated = translate(key)
  return translated === key ? id : translated
}
