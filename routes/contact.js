const express = require("express");
const router = express.Router();
const sendContactEmail = require("../utils/sendContactEmail");

router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message, rating } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    await sendContactEmail({ name, email, subject, message, rating });
    res.status(200).json({ message: "📨 Message sent successfully!" });
  } catch (err) {
    console.error("❌ Error sending email:", err.message);
    res
      .status(500)
      .json({ message: "Failed to send message. Try again later." });
  }
});

module.exports = router;
