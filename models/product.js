const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  url: { type: String, required: true },
  title: String,
  currentPrice: Number,
  targetPrice: Number,
  imageUrl: String,
  priceHistory: [
    {
      price: Number,
      checkedAt: { type: Date, default: Date.now },
    },
  ],
  lastChecked: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);
