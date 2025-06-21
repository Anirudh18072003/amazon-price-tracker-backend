const cron = require("node-cron");
const Product = require("../models/product");
const User = require("../models/user");
const scrapeAmazonProduct = require("../scrapper/scrapeAmazon");
const sendEmail = require("../utils/sendEmail");

const schedulePriceCheck = () => {
  // Run every 2 minutes (change to "0 */6 * * *" for every 6 hours)
  cron.schedule("0 */6 * * *", async () => {
    console.log("⏰ Running scheduled price check...");

    try {
      const products = await Product.find().populate("user");

      for (const product of products) {
        try {
          const { title, price: latestPrice } = await scrapeAmazonProduct(
            product.url
          ); // Update product fields

          product.currentPrice = latestPrice;
          product.lastChecked = new Date(); // Push to priceHistory

          product.priceHistory.push({
            price: latestPrice,
            checkedAt: new Date(),
          }); // Optional: limit history to last 30 entries

          if (product.priceHistory.length > 30) {
            product.priceHistory.shift();
          }

          await product.save(); // Notify user if price drops below target

          if (latestPrice <= product.targetPrice) {
            if (product.user && product.user.email) {
              const message = `🛒 Price Drop Alert!\n\n${title}\nCurrent Price: ₹${latestPrice}\nTarget Price: ₹${product.targetPrice}\n\nCheck it here: ${product.url}`;
              await sendEmail(
                product.user.email,
                `Price Drop: ${title}`,
                message
              );
            } else {
              console.warn(
                `⚠️ Missing user or email for product ID ${product._id}`
              );
            }
          }
        } catch (productErr) {
          console.error(
            `❌ Error checking product ${product._id}:`,
            productErr.message
          );
        }
      }
    } catch (err) {
      console.error("❌ Error in scheduled price check:", err.message);
    }
  });
};

module.exports = schedulePriceCheck;
