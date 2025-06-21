const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const scrapeAmazonProduct = require("../scrapper/scrapeAmazon");

const authMiddleware = require("../middleware/authMiddleware");
// Middleware to authenticate JWT

// @POST /api/products/add
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { url, targetPrice } = req.body; // Check if URL and target price are provided

    if (!url || !targetPrice) {
      return res.status(400).json({
        message: "URL and target price are required",
      });
    }

    console.log("Scraping URL:", url);
    const scrapedData = await scrapeAmazonProduct(url); // Check if scraping succeeded

    if (!scrapedData || !scrapedData.title || scrapedData.price == null) {
      return res.status(500).json({
        message: "Failed to extract product info from Amazon",
      });
    }

    const { title, price: currentPrice, imageUrl } = scrapedData;

    const product = new Product({
      user: req.user.id,
      url,
      title,
      currentPrice,
      targetPrice,
      imageUrl,
    });

    await product.save();

    res.status(201).json({
      message: "Product tracked successfully",
      product,
    });
  } catch (err) {
    console.error("Error in /api/products/add:", err);
    res.status(500).json({
      message: "Internal server error while adding product",
      error: err.message,
    });
  }
});

// @GET /api/products
router.get("/", authMiddleware, async (req, res) => {
  try {
    const products = await Product.find({ user: req.user.id });
    res.status(200).json(products);
  } catch (err) {
    console.error("Error in GET /api/products:", err);
    res.status(500).json({
      message: "Failed to retrieve products",
      error: err.message,
    });
  }
});

router.get("/history/:productid", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.productid, // ✅ Correct param name
      user: req.user.id,
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ history: product.priceHistory }); // ✅ Wrap in an object like frontend expects
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    // 1. Check if product exists
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 2. Check if the logged-in user owns this product
    if (product.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // 3. Delete product
    await product.deleteOne();

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
