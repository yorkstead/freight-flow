import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(`${process.env.PLAYWRIGHT_MODULE}/index.mjs`).href : 'playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const base = process.env.PWA_URL || 'http://localhost:3094';
    await page.goto(base);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    const manifest = await (await context.request.get(`${base}/manifest.webmanifest`)).json();
    assert.equal(manifest.display, 'standalone');
    assert.equal(manifest.scope, '/');
    for (const icon of manifest.icons) {
      const result = await context.request.get(base + icon.src);
      assert.equal(result.status(), 200);
      assert.match(result.headers()['content-type'], /image\/png/);
    }
    const iconSizes = await page.evaluate(async icons => Promise.all(icons.map(async icon => {
      const image = new Image(); image.src = icon.src; await image.decode();
      return `${image.naturalWidth}x${image.naturalHeight}`;
    })), manifest.icons);
    assert.deepEqual(iconSizes, manifest.icons.map(icon => icon.sizes));
    const sw = await context.request.get(`${base}/sw.js`);
    assert.match(sw.headers()['cache-control'], /no-store/);
    await page.screenshot({ path: '.next/pwa-desktop.png' });
    const cdp = await context.newCDPSession(page);
    const installability = await cdp.send('Page.getInstallabilityErrors');
    assert.deepEqual(installability.installabilityErrors, []);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.getByRole('button', { name: 'Close navigation' }).click();
    await page.waitForFunction(() => {
      const nav = document.querySelector('aside');
      return nav && nav.getBoundingClientRect().right <= 0;
    });
    await page.screenshot({ path: '.next/pwa-mobile.png' });
    await context.setOffline(true);
    await page.goto(`${base}/my-queue`);
    assert.match(await page.locator('h1').innerText(), /offline/);
    await context.setOffline(false);
    await page.getByRole('link', { name: 'Try again' }).click();
    await page.waitForURL(`${base}/`);
    assert.match(await page.title(), /FreightFlow/);
    console.log('PASS: icon dimensions and routes, manifest, worker control and headers, Chromium installability, mobile navigation, offline navigation and reconnect.');
    assert.deepEqual(errors, [], 'Application page errors detected separately from the PWA checks');
    console.log('PASS: no application page errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
