/**
 * One-time login helper. Opens real Chrome, you sign in to Workato yourself
 * (SSO / 2FA included), then press Enter. The session is saved to .auth/workato.json.
 * Your credentials never pass through the test code. Re-run when the session expires.
 */
import { chromium } from '@playwright/test';
import readline from 'node:readline/promises';
import dotenv from 'dotenv';

dotenv.config();

(async () => {
  const browser = await chromium.launch({ headless: false, channel: 'chrome' });
  const page = await (await browser.newContext({ viewport: null })).newPage();
  await page.goto(process.env.WORKATO_UI_URL ?? 'https://app.workato.com');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  await rl.question('Sign in to Workato in the browser, wait for the home page, then press Enter here... ');
  rl.close();
  await page.context().storageState({ path: '.auth/workato.json' });
  console.log('Saved session to .auth/workato.json');
  await browser.close();
})();
