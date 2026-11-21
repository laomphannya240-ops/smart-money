import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import { Navigate, useLocation } from 'react-router-dom'
import { AlertCircle, ArrowRight, Check, Eye, EyeOff, LoaderCircle, LockKeyhole, ShieldCheck } from 'lucide-react'
import logo from '../assets/logo.svg'
import { useAuth } from '../hooks/useAuth'
import { useI18n } from '../hooks/useI18n'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.075, delayChildren: 0.14 } },
}

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

const CURRENT_YEAR = new Date().getFullYear()

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100'
const inputErrorClass =
  'w-full rounded-xl border border-red-300 bg-red-50/60 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-red-300 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100'

export default function Login() {
  const { isAuthenticated, isConfigured, login } = useAuth()
  const { t } = useI18n()
  const location = useLocation()

  const [values, setValues] = useState({ email: '', password: '', remember: false })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const shake = useAnimationControls()

  useEffect(() => {
    if (error) {
      shake.start({ x: [0, -9, 9, -6, 6, 0], transition: { duration: 0.38 } })
    }
  }, [error, shake])

  const redirectTo = location.state?.from?.pathname || '/'

  if (isAuthenticated) return <Navigate to={redirectTo} replace />

  const setField = (name, value) => {
    setValues((previous) => ({ ...previous, [name]: value }))
    if (error) setError(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (busy || !isConfigured) return

    setBusy(true)
    setError(null)
    try {
      // A brief pause makes the loading state visible and avoids flicker.
      await new Promise((resolve) => setTimeout(resolve, 350))
      const result = await login(values)
      if (!result.ok) setError({ field: result.field, message: result.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f8ff] px-4 py-8 sm:px-6 sm:py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ x: [0, 22, 0], y: [0, -18, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-28 -top-28 h-[26rem] w-[26rem] rounded-full bg-blue-200/70 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -26, 0], y: [0, 20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-36 -right-24 h-[30rem] w-[30rem] rounded-full bg-sky-200/70 blur-3xl"
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(#bfdbfe 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[460px]"
      >
        <motion.div variants={container} initial="hidden" animate="show" className="mb-6 flex flex-col items-center">
          <motion.img variants={item} src={logo} alt="" className="h-12 w-12 drop-shadow-lg" />
          <motion.p variants={item} className="mt-3 text-lg font-bold tracking-tight text-slate-900">
            Smart Money
          </motion.p>
          <motion.p variants={item} className="text-xs font-medium text-slate-500">
            Your money, clearly.
          </motion.p>
        </motion.div>

        <motion.div
          animate={shake}
          className="overflow-hidden rounded-[26px] border border-white bg-white shadow-[0_28px_80px_-28px_rgba(30,64,175,0.42)] ring-1 ring-blue-100/70"
        >
          <div className="h-1.5 bg-gradient-to-r from-blue-600 via-sky-400 to-blue-600" />

          <motion.div variants={container} initial="hidden" animate="show" className="px-6 py-8 sm:px-10 sm:py-9">
            <motion.div variants={item} className="mb-6 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-bold tracking-[0.12em] text-blue-700 uppercase">
                <LockKeyhole size={12} />
                {t('auth.privateAccess')}
              </span>
              <h1 className="mt-4 text-[26px] font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                {t('auth.welcome')}
              </h1>
              <p className="mx-auto mt-1.5 max-w-[320px] text-sm leading-relaxed text-slate-500">
                {t('auth.subtitle')}
              </p>
            </motion.div>

            {!isConfigured && (
              <motion.div variants={item} className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
                <strong className="font-semibold">Setup required.</strong> Copy <code>.env.example</code> to <code>.env</code>, set{' '}
                <code>VITE_OWNER_EMAIL</code> and <code>VITE_OWNER_PASSWORD_HASH</code>, then restart the dev server.
              </motion.div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <motion.div variants={item}>
                <label htmlFor="login-email" className="mb-2 block text-xs font-semibold tracking-wide text-slate-600">
                  {t('auth.email')}
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  placeholder="you@gmail.com"
                  value={values.email}
                  onChange={(event) => setField('email', event.target.value)}
                  className={error?.field === 'email' ? inputErrorClass : inputClass}
                  aria-invalid={error?.field === 'email'}
                  disabled={busy}
                />
              </motion.div>

              <motion.div variants={item} className="mt-4">
                <label htmlFor="login-password" className="mb-2 block text-xs font-semibold tracking-wide text-slate-600">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••••"
                    value={values.password}
                    onChange={(event) => setField('password', event.target.value)}
                    className={`${error?.field === 'password' ? inputErrorClass : inputClass} pr-12`}
                    aria-invalid={error?.field === 'password'}
                    disabled={busy}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-400 transition hover:text-blue-600 focus:outline-none focus-visible:text-blue-600"
                    aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                    title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>

              <motion.div variants={item} className="mt-4 flex items-center justify-between gap-3">
                <div className="flex items-center">
                  <input
                    id="login-remember"
                    type="checkbox"
                    className="peer sr-only"
                    checked={values.remember}
                    onChange={(event) => setField('remember', event.target.checked)}
                    disabled={busy}
                  />
                  <label htmlFor="login-remember" className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                    <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[6px] border border-slate-300 bg-white text-white transition peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-focus-visible:ring-4 peer-focus-visible:ring-blue-100">
                      {values.remember && <Check size={12} strokeWidth={3} />}
                    </span>
                    {t('auth.remember')}
                  </label>
                </div>
                <span className="hidden text-xs text-slate-400 sm:block">
                  {values.remember ? t('auth.sessionPersist') : t('auth.sessionTab')}
                </span>
              </motion.div>

              <motion.div variants={item} className="mt-5">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      key={error.message}
                      role="alert"
                      initial={{ opacity: 0, y: -6, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -6, height: 0 }}
                      className="mb-4 flex gap-2.5 overflow-hidden rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700"
                    >
                      <AlertCircle size={17} className="mt-0.5 shrink-0" />
                      <span>{t(error.message)}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={busy || !isConfigured}
                  whileHover={busy || !isConfigured ? undefined : { y: -1 }}
                  whileTap={busy || !isConfigured ? undefined : { scale: 0.99 }}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      {t('auth.signingIn')}
                    </>
                  ) : (
                    <>
                      {t('auth.signIn')}
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>

            <motion.div variants={item} className="mt-7 flex items-start gap-2.5 rounded-xl bg-slate-50 px-4 py-3">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-blue-600" />
              <p className="text-xs leading-relaxed text-slate-500">{t('auth.privateDesc')}</p>
            </motion.div>
          </motion.div>
        </motion.div>

        <p className="mt-6 text-center text-xs text-slate-400">© {CURRENT_YEAR} Smart Money</p>
      </motion.div>
    </div>
  )
}
