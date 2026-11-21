import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import { Link, Navigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  ShieldCheck,
  UserPlus,
} from 'lucide-react'
import logo from '../assets/logo.svg'
import { useAuth } from '../hooks/useAuth'
import { useI18n } from '../hooks/useI18n'
import {
  container,
  CURRENT_YEAR,
  inputClass,
  inputErrorClass,
  item,
  labelClass,
  linkClass,
} from '../components/auth/authStyles'

export default function Register() {
  const { isAuthenticated, register } = useAuth()
  const { t } = useI18n()

  const [values, setValues] = useState({ email: '', password: '', confirm: '', remember: false })
  const [visible, setVisible] = useState({ password: false, confirm: false })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const shake = useAnimationControls()

  useEffect(() => {
    if (error) shake.start({ x: [0, -9, 9, -6, 6, 0], transition: { duration: 0.38 } })
  }, [error, shake])

  if (isAuthenticated) return <Navigate to="/" replace />

  const setField = (name, value) => {
    setValues((previous) => ({ ...previous, [name]: value }))
    if (error) setError(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (busy) return

    if (values.password !== values.confirm) {
      setError({ field: 'confirm', message: 'auth.errorPasswordMismatch' })
      return
    }
    if (values.password.length < 8) {
      setError({ field: 'password', message: 'auth.errorPasswordShort' })
      return
    }

    setBusy(true)
    setError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 350))
      const result = await register(values)
      if (!result.ok) setError({ field: result.field, message: result.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f8ff] px-4 py-8 sm:px-6 sm:py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ x: [0, 24, 0], y: [0, -16, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-28 -top-28 h-[26rem] w-[26rem] rounded-full bg-blue-200/70 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -24, 0], y: [0, 22, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }}
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
                <UserPlus size={12} />
                {t('auth.createAccount')}
              </span>
              <h1 className="mt-4 text-[26px] font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                {t('auth.registerTitle')}
              </h1>
              <p className="mx-auto mt-1.5 max-w-[320px] text-sm leading-relaxed text-slate-500">
                {t('auth.registerSubtitle')}
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} noValidate>
              <motion.div variants={item}>
                <label htmlFor="register-email" className={labelClass}>
                  {t('auth.email')}
                </label>
                <input
                  id="register-email"
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
                <label htmlFor="register-password" className={labelClass}>
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    name="password"
                    type={visible.password ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••••"
                    value={values.password}
                    onChange={(event) => setField('password', event.target.value)}
                    className={`${error?.field === 'password' ? inputErrorClass : inputClass} pr-12`}
                    aria-invalid={error?.field === 'password'}
                    disabled={busy}
                  />
                  <button
                    type="button"
                    onClick={() => setVisible((state) => ({ ...state, password: !state.password }))}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-400 transition hover:text-blue-600 focus:outline-none focus-visible:text-blue-600"
                    aria-label={visible.password ? t('auth.hidePassword') : t('auth.showPassword')}
                  >
                    {visible.password ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-slate-400">{t('auth.passwordHint')}</p>
              </motion.div>

              <motion.div variants={item} className="mt-4">
                <label htmlFor="register-confirm" className={labelClass}>
                  {t('auth.confirmPassword')}
                </label>
                <div className="relative">
                  <input
                    id="register-confirm"
                    name="confirm"
                    type={visible.confirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••••"
                    value={values.confirm}
                    onChange={(event) => setField('confirm', event.target.value)}
                    className={`${error?.field === 'confirm' ? inputErrorClass : inputClass} pr-12`}
                    aria-invalid={error?.field === 'confirm'}
                    disabled={busy}
                  />
                  <button
                    type="button"
                    onClick={() => setVisible((state) => ({ ...state, confirm: !state.confirm }))}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-400 transition hover:text-blue-600 focus:outline-none focus-visible:text-blue-600"
                    aria-label={visible.confirm ? t('auth.hidePassword') : t('auth.showPassword')}
                  >
                    {visible.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>

              <motion.div variants={item} className="mt-4">
                <input
                  id="register-remember"
                  type="checkbox"
                  className="peer sr-only"
                  checked={values.remember}
                  onChange={(event) => setField('remember', event.target.checked)}
                  disabled={busy}
                />
                <label htmlFor="register-remember" className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                  <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[6px] border border-slate-300 bg-white text-white transition peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-focus-visible:ring-4 peer-focus-visible:ring-blue-100">
                    {values.remember && <Check size={12} strokeWidth={3} />}
                  </span>
                  {t('auth.remember')}
                </label>
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
                  disabled={busy}
                  whileHover={busy ? undefined : { y: -1 }}
                  whileTap={busy ? undefined : { scale: 0.99 }}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      {t('auth.creating')}
                    </>
                  ) : (
                    <>
                      {t('auth.createAccount')}
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>

            <motion.p variants={item} className="mt-5 text-center text-sm text-slate-500">
              {t('auth.haveAccount')}{' '}
              <Link to="/login" className={linkClass}>
                {t('auth.signIn')}
              </Link>
            </motion.p>

            <motion.div variants={item} className="mt-6 flex items-start gap-2.5 rounded-xl bg-slate-50 px-4 py-3">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-blue-600" />
              <p className="text-xs leading-relaxed text-slate-500">{t('auth.registerDesc')}</p>
            </motion.div>
          </motion.div>
        </motion.div>

        <p className="mt-6 text-center text-xs text-slate-400">© {CURRENT_YEAR} Smart Money</p>
      </motion.div>
    </div>
  )
}
