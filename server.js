const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const contactRoutes = require("./routes/contact");
const schedulePriceCheck = require("./scheduler/priceChecker");
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = "https://amazon-price-tracker-frontend.vercel.app";

const app = express();
app.use(
  cors({
    origin: FRONTEND_URL, // allow only your Vercel app
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true, // if you need to send cookies/auth
    optionsSuccessStatus: 200, // some browsers choke on 204 responses
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
