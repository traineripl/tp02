const puppeteer = require("puppeteer");
const AxePuppeteer = require("@axe-core/puppeteer").default;
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"]
  });

  const page = await browser.newPage();
  await page.goto("http://localhost:3000");

  console.log("\n♿ AXE ANALYSIS");
  const axeResults = await new AxePuppeteer(page).analyze();
  console.log("Violations:", axeResults.violations.length);

  console.log("\n🧏 SCREEN READER SIMULATION");
  const sr = await page.evaluate(() => ({
    headings: Array.from(document.querySelectorAll("h1,h2,h3")).map(h => h.innerText),
    inputsWithoutLabel: Array.from(document.querySelectorAll("input")).filter(i => !i.labels?.length).length,
    landmarks: Array.from(document.querySelectorAll("main,header,footer,nav")).length
  }));
  console.log(sr);

  await browser.close();

  console.log("\n🌐 LIGHTHOUSE");
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });

  const lighthouseResult = await lighthouse("http://localhost:3000", {
    port: chrome.port,
    output: "json"
  });

  console.log("Accessibility score:", lighthouseResult.lhr.categories.accessibility.score * 100);

  await chrome.kill();
})();