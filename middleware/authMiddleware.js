const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      console.error("JWT expired at:", err.expiredAt);
      return res
        .status(401)
        .json({ message: "Token expired", expiredAt: err.expiredAt });
    }

    console.error("JWT verification failed:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
