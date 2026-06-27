import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer";

const out = "design-qa-screenshots";
fs.mkdirSync(out, { recursive: true });

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });

const logs = [];
page.on("console", (message) => logs.push({ type: message.type(), text: message.text() }));
page.on("pageerror", (error) => logs.push({ type: "pageerror", text: error.message }));

await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle0" });

const screenIds = ["A1", "H1", "O2", "O6", "C1", "C2", "C3", "C4", "G1", "G2", "P3", "M2"];

async function clickTheme(theme) {
  await page.evaluate((targetTheme) => {
    const button = [...document.querySelectorAll("button")].find((item) => item.textContent.trim() === targetTheme);
    button?.click();
  }, theme);
  await new Promise((resolve) => setTimeout(resolve, 250));
}

async function clickScreen(id) {
  await page.evaluate((screenId) => {
    const button = [...document.querySelectorAll("button")].find((item) => item.textContent.trim().replace(/\s+/g, " ").startsWith(screenId));
    button?.click();
  }, id);
  await new Promise((resolve) => setTimeout(resolve, 350));
}

const result = [];

for (const theme of ["Light", "Dark"]) {
  await clickTheme(theme);
  for (const id of screenIds) {
    await clickScreen(id);
    const file = path.join(out, `${theme.toLowerCase()}-${id}.png`);
    await page.screenshot({ path: file, fullPage: false });
    const metrics = await page.evaluate(() => {
      const phone = document.querySelector(".mockup-device") || document.querySelector(".phone") || document.querySelector("main");
      const rect = phone.getBoundingClientRect();
      return {
        bodyText: document.body.innerText.slice(0, 900),
        phone: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
        scroll: {
          bodyH: document.body.scrollHeight,
          bodyW: document.body.scrollWidth,
          innerH: window.innerHeight,
          innerW: window.innerWidth,
        },
      };
    });
    result.push({ theme, id, file, metrics });
  }
}

await browser.close();
fs.writeFileSync(path.join(out, "capture-results.json"), JSON.stringify({ result, logs }, null, 2));
console.log(JSON.stringify({ count: result.length, out, logCount: logs.length }, null, 2));
