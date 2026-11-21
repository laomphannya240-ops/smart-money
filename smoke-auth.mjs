import puppeteer from 'puppeteer-core'

const BASE = 'http://127.0.0.1:4173'
const OWNER = 'owner@gmail.com'
const PASSWORD = 'DemoPass123!'
const AUTH_KEY = 'smart-money.auth.v1'
const DATA_KEY = 'smart-money.v1'

const results = []
const check = (name, condition, detail = '') => {
  results.push({ name, ok: Boolean(condition), detail })
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

const page = await browser.newPage()
const browserErrors = []
page.on('pageerror', (error) => browserErrors.push(`pageerror: ${error.message}`))
page.on('console', (message) => {
  if (message.type() === 'error' && !message.text().includes('favicon')) {
    browserErrors.push(`console: ${message.text()}`)
  }
})

const go = async (path) => {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle0' })
}
const path = () => new URL(page.url()).pathname
const fill = async (selector, value) => {
  await page.$eval(
    selector,
    (element, next) => {
      const setter = Object.getOwnPropertyDescriptor(element.constructor.prototype, 'value').set
      setter.call(element, next)
      element.dispatchEvent(new Event('input', { bubbles: true }))
    },
    value,
  )
}
const alertText = async () => page.$eval('[role="alert"]', (element) => element.textContent.trim()).catch(() => '')
const clickLogout = async (area) => page.click(`${area} button[aria-label="Sign out"]`)
const stores = () =>
  page.evaluate(
    (key) => ({
      local: localStorage.getItem(key),
      session: sessionStorage.getItem(key),
    }),
    AUTH_KEY,
  )

try {
  // 1. Protected route redirect
  await go('/income')
  await page.waitForSelector('#login-email')
  check('unauthenticated /income redirects to login', path() === '/login', path())

  // 2. Non-Gmail address
  await fill('#login-email', 'owner@yahoo.com')
  await fill('#login-password', PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForSelector('[role="alert"]')
  check('non-Gmail address rejected', (await alertText()).includes('valid Gmail'), await alertText())

  // 3. Wrong (unauthorized) Gmail
  await fill('#login-email', 'someone@gmail.com')
  await page.click('button[type="submit"]')
  await page.waitForFunction(() => {
    const node = document.querySelector('[role="alert"]')
    return node && node.textContent.includes('not authorized')
  })
  check('other Gmail address rejected', (await alertText()).includes('not authorized'), await alertText())

  // 4. Wrong password
  await fill('#login-email', OWNER)
  await fill('#login-password', 'WrongPassword123')
  await page.click('button[type="submit"]')
  await page.waitForFunction(() => {
    const node = document.querySelector('[role="alert"]')
    return node && node.textContent.includes('Incorrect password')
  })
  check('incorrect password rejected', (await alertText()).includes('Incorrect password'), await alertText())

  // 5. Show / hide password
  const beforeToggle = await page.$eval('#login-password', (element) => element.type)
  await page.click('button[aria-label="Show password"]')
  const afterToggle = await page.$eval('#login-password', (element) => element.type)
  await page.click('button[aria-label="Hide password"]')
  check('show/hide password toggle works', beforeToggle === 'password' && afterToggle === 'text', `${beforeToggle} → ${afterToggle}`)

  // 6. Correct credentials, Remember Me off
  const dataBefore = await page.evaluate((key) => localStorage.getItem(key), DATA_KEY)
  await fill('#login-email', OWNER)
  await fill('#login-password', PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForFunction(() => location.pathname === '/income')
  await page.waitForSelector('h1')
  let session = await stores()
  check('correct credentials sign in and return to requested route', path() === '/income', path())
  check('session without Remember Me uses sessionStorage', !session.local && Boolean(session.session), JSON.stringify(session))
  check('password not stored in session', !JSON.stringify(session).includes(PASSWORD))
  const dataAfter = await page.evaluate((key) => localStorage.getItem(key), DATA_KEY)
  check('finance data unchanged by login', dataBefore === dataAfter)

  // 7. Refresh keeps session
  await page.reload({ waitUntil: 'networkidle0' })
  check('refresh keeps authenticated session', path() === '/income', path())

  // 8. Direct protected route while authenticated
  await go('/reports')
  await page.waitForFunction(() => location.pathname === '/reports')
  check('authenticated user can open protected route', path() === '/reports', path())

  // 9. Logout (topbar)
  await clickLogout('header')
  await page.waitForFunction(() => location.pathname === '/login')
  session = await stores()
  check('logout returns to login and clears session', !session.local && !session.session, JSON.stringify(session))

  // 10. Protected route again after logout
  await go('/settings')
  await page.waitForSelector('#login-email')
  check('protected route blocked after logout', path() === '/login', path())

  // 11. Remember Me persists in localStorage
  await fill('#login-email', OWNER)
  await fill('#login-password', PASSWORD)
  await page.click('#login-remember')
  await page.click('button[type="submit"]')
  await page.waitForFunction(() => location.pathname === '/settings')
  session = await stores()
  check('Remember Me persists in localStorage', Boolean(session.local) && !session.session, JSON.stringify(session))

  // Authenticated user visiting /login is sent to the dashboard
  await go('/login')
  await page.waitForFunction(() => location.pathname === '/')
  check('authenticated user is redirected away from login', path() === '/', path())

  // 12. New page in same browser keeps remembered session
  const secondPage = await browser.newPage()
  secondPage.on('pageerror', (error) => browserErrors.push(`pageerror(2): ${error.message}`))
  await secondPage.goto(`${BASE}/`, { waitUntil: 'networkidle0' })
  check('remembered session survives a new tab', new URL(secondPage.url()).pathname === '/')
  await secondPage.close()

  // 13. Logout via sidebar (desktop layout)
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle0' })
  await clickLogout('aside')
  await page.waitForFunction(() => location.pathname === '/login').catch(() => {})
  check('sidebar sign out works', path() === '/login', path())

  // 14. Responsive login layout
  await go('/login')
  for (const width of [320, 768, 1440]) {
    await page.setViewport({ width, height: 850 })
    await new Promise((resolve) => setTimeout(resolve, 250))
    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      card: Boolean(document.querySelector('form')),
      buttonWidth: document.querySelector('button[type="submit"]').getBoundingClientRect().width,
    }))
    check(
      `login responsive at ${width}px`,
      metrics.scrollWidth <= metrics.innerWidth && metrics.card && metrics.buttonWidth > 200,
      JSON.stringify(metrics),
    )
  }

  check('no browser console/page errors', browserErrors.length === 0, browserErrors.join(' | '))
} catch (error) {
  check('smoke test completed without exception', false, error.stack || error.message)
} finally {
  await browser.close()
}

const failed = results.filter((result) => !result.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exitCode = failed.length ? 1 : 0
