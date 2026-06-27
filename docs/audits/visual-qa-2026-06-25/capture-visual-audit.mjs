import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer";

const themeMode = process.env.WEATHERON_THEME === "light" ? "light" : "dark";
const captureScreenshots = process.env.WEATHERON_SCREENSHOTS !== "0";
const outDir = `docs/audits/visual-qa-2026-06-25/screenshots-${themeMode}`;
fs.mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  headless: "new",
  protocolTimeout: 300000,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();
page.setDefaultTimeout(300000);
await page.setViewport({ width: 1280, height: 920, deviceScaleFactor: 1 });
await page.goto(`http://127.0.0.1:5173/?audit=${Date.now()}`, { waitUntil: "networkidle0" });
if (themeMode === "light") {
  await page.$$eval(".preview-theme-toggle button", (buttons) => {
    const light = buttons.find((button) => button.textContent?.includes("라이트"));
    light?.click();
  });
  await new Promise((resolve) => setTimeout(resolve, 160));
}

const count = await page.$$eval(".preview-list button", (els) => els.length);
const results = [];

for (let i = 0; i < count; i += 1) {
  await page.$$eval(".preview-list button", (els, index) => els[index].click(), i);
  await new Promise((resolve) => setTimeout(resolve, 120));

  const meta = await page.evaluate(() => {
    const active = document.querySelector(".preview-list button.active");
    const id = active?.querySelector("span")?.textContent?.trim() || "";
    const title = (active?.textContent || "").replace(id, "").trim();
    const stage = document.querySelector(".preview-stage");
    const candidates = [...stage.querySelectorAll("div")]
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { el, w: r.width, h: r.height, x: r.x, y: r.y };
      })
      .filter((o) => Math.abs(o.w - 393) < 4 && Math.abs(o.h - 852) < 4);
    const phone = candidates[0]?.el || stage.firstElementChild;
    const pr = phone.getBoundingClientRect();

    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none" && parseFloat(cs.opacity || "1") > 0.01;
    };

    const tiny = [];
    const clipped = [];
    const scrollContinuation = [];
    const buttons = [];
    const imgs = [];
    const lowContrast = [];

    const parseColor = (value) => {
      const match = value.match(/rgba?\(([^)]+)\)/);
      if (!match) return null;
      const [r, g, b, a = "1"] = match[1].split(",").map((part) => part.trim());
      return { r: Number(r), g: Number(g), b: Number(b), a: Number(a) };
    };
    const blend = (fg, bg) => {
      const a = fg.a + bg.a * (1 - fg.a);
      if (!a) return { r: 255, g: 255, b: 255, a: 1 };
      return {
        r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
        g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
        b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a,
        a,
      };
    };
    const relLum = (c) => {
      const srgb = [c.r, c.g, c.b].map((v) => {
        const n = v / 255;
        return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
    };
    const ratio = (a, b) => {
      const l1 = relLum(a);
      const l2 = relLum(b);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };
    const backgroundFor = (el) => {
      let bg = { r: 255, g: 255, b: 255, a: 1 };
      const chain = [];
      for (let node = el; node && node.nodeType === 1; node = node.parentElement) chain.push(node);
      for (const node of chain.reverse()) {
        const color = parseColor(getComputedStyle(node).backgroundColor || "");
        if (color && color.a > 0) bg = blend(color, bg);
      }
      return bg;
    };
    const isScrollable = (node) => {
      if (!node || node.nodeType !== 1) return false;
      const cs = getComputedStyle(node);
      return /(auto|scroll|overlay)/.test(cs.overflowY) && node.scrollHeight > node.clientHeight + 1;
    };
    const inScrollableArea = (el) => {
      for (let node = el; node && node !== phone; node = node.parentElement) {
        if (isScrollable(node)) return true;
      }
      return false;
    };

    for (const el of [...phone.querySelectorAll("*")]) {
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const text = (el.innerText || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80);
      if (text && el.children.length === 0) {
        const fontSize = parseFloat(cs.fontSize) || 0;
        if (fontSize < 10) tiny.push({ text, fontSize: fontSize.toFixed(1) });
        const fg = parseColor(cs.color || "");
        if (fg) {
          const contrast = ratio(blend(fg, backgroundFor(el)), backgroundFor(el));
          const required = fontSize >= 18 ? 3 : 4.5;
          if (contrast < required) {
            lowContrast.push({ text, fontSize: fontSize.toFixed(1), contrast: contrast.toFixed(2) });
          }
        }
      }

      const tag = el.tagName.toLowerCase();
      const isLeafText = text && el.children.length === 0;
      const meaningful = isLeafText || tag === "button" || tag === "img" || el.getAttribute("role");
      if (meaningful && (r.left < pr.left - 1 || r.right > pr.right + 1 || r.top < pr.top - 1 || r.bottom > pr.bottom + 1)) {
        const item = {
          tag,
          text,
          w: Math.round(r.width),
          h: Math.round(r.height),
          side: {
            l: Math.round(r.left - pr.left),
            r: Math.round(r.right - pr.right),
            t: Math.round(r.top - pr.top),
            b: Math.round(r.bottom - pr.bottom),
          },
        };
        const onlyBelowFrame = r.left >= pr.left - 1 && r.right <= pr.right + 1 && r.top >= pr.top - 1 && r.bottom > pr.bottom + 1;
        if (onlyBelowFrame && inScrollableArea(el)) scrollContinuation.push(item);
        else clipped.push(item);
      }

      if (tag === "button") buttons.push({ text, w: Math.round(r.width), h: Math.round(r.height) });
      if (tag === "img") imgs.push({ alt: el.getAttribute("alt") || "", w: Math.round(r.width), h: Math.round(r.height), src: el.currentSrc || el.src });
    }

    return {
      id,
      title,
      phone: { x: pr.x, y: pr.y, w: pr.width, h: pr.height },
      tiny: tiny.slice(0, 12),
      clipped: clipped.slice(0, 12),
      scrollContinuation: scrollContinuation.slice(0, 12),
      lowContrast: lowContrast.slice(0, 12),
      shortButtons: buttons.filter((b) => b.h < 44 || b.w < 36).slice(0, 8),
      imgCount: imgs.length,
    };
  });

  const clip = {
    x: Math.max(0, Math.round(meta.phone.x)),
    y: Math.max(0, Math.round(meta.phone.y)),
    width: Math.round(meta.phone.w),
    height: Math.round(meta.phone.h),
  };
  const safeTitle = meta.title.replace(/[^가-힣A-Za-z0-9_-]+/g, "_");
  const filename = path.join(outDir, `${String(i + 1).padStart(2, "0")}-${meta.id}-${safeTitle}.png`);
  console.log(`[${themeMode}] ${i + 1}/${count} ${meta.id} ${meta.title}${captureScreenshots ? "" : " (metrics only)"}`);
  if (captureScreenshots) {
    await page.screenshot({ path: filename, clip, captureBeyondViewport: false, optimizeForSpeed: true });
  }
  results.push({ ...meta, filename: captureScreenshots ? filename : null });
}

await browser.close();
fs.writeFileSync(`docs/audits/visual-qa-2026-06-25/visual-audit-results-${themeMode}.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results.map((r) => ({
  id: r.id,
  title: r.title,
  tiny: r.tiny.length,
  clipped: r.clipped.length,
  scrollContinuation: r.scrollContinuation.length,
  lowContrast: r.lowContrast.length,
  shortButtons: r.shortButtons.length,
  imgCount: r.imgCount,
  file: r.filename,
})), null, 2));
