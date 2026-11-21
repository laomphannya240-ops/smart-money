import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
const page = await browser.newPage()
for (const [name, width, height] of [
  ['desktop', 1440, 900],
  ['mobile', 320, 780],
]) {
  await page.setViewport({ width, height })
  await page.goto('http://127.0.0.1:4173/login', { waitUntil: 'networkidle0' })
  await new Promise((resolve) => setTimeout(resolve, 900))
  await page.screenshot({ path: `login-${name}.png`, fullPage: name === 'mobile' })
}
await browser.close()
