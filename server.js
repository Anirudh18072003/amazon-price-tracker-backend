const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const contactRoutes = require("./routes/contact");
const schedulePriceCheck = require("./scheduler/priceChecker");
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  "https://your-vercel-app.vercel.app",
  "http://localhost:3000", // for local testing
];
const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173", // for local dev
      "https://amazon-price-tracker-frontend.vercel.app", // replace with actual frontend URL
    ],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/contact", contactRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    schedulePriceCheck();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error(err));
