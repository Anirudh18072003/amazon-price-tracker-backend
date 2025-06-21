const playwright = require("playwright");

async function scrapeAmazonProduct(url) {
  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  try {
    console.log("Navigating to:", url);
    await page.goto(url, { timeout: 60000, waitUntil: "domcontentloaded" });

    await page.waitForSelector("#productTitle", { timeout: 10000 }); // ✅ Get the product title

    const title = await page.$eval("#productTitle", (el) =>
      el.textContent.trim()
    ); // ✅ Try multiple selectors for price

    const priceSelectors = [
      "#priceblock_ourprice",
      "#priceblock_dealprice",
      "#priceblock_saleprice",
      ".a-price .a-offscreen",
    ];

    let price = null;
    for (const selector of priceSelectors) {
      try {
        price = await page.$eval(selector, (el) =>
          parseFloat(el.textContent.replace(/[^0-9.]/g, ""))
        );
        if (price) break;
      } catch {}
    } // ✅ Try to get the image URL

    let imageUrl = null;
    try {
      imageUrl = await page.$eval("#landingImage", (img) => img.src);
    } catch {
      try {
        // fallback: use first gallery image
        imageUrl = await page.$eval("#imgTagWrapperId img", (img) => img.src);
      } catch {}
    }

    if (!title || !price) {
      throw new Error("Title or price not found");
    }

    return { title, price, imageUrl };
  } catch (err) {
    console.error("Scraper error:", err.message);
    throw err;
  } finally {
    await browser.close();
  }
}

module.exports = scrapeAmazonProduct;
