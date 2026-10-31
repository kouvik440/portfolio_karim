import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({ headless: process.argv.includes("--headless") });
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:8002");
  console.log("Titre de la page :", await page.title());
  await page.waitForTimeout(3000);
  await browser.close();
  console.log("OK — Playwright fonctionne.");
})();
