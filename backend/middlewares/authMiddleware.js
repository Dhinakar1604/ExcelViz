const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("[AUTH PROTECT]: No token provided in Authorization header.");
      return res.status(401).json({ message: "No token provided. Please log in." });
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      console.error("[AUTH PROTECT]: JWT_SECRET is not defined in environment variables.");
      return res.status(500).json({ message: "Server misconfiguration: JWT_SECRET missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !(decoded.id || decoded._id || decoded.userId)) {
      console.error("[AUTH PROTECT]: Decoded token does not contain user ID.", decoded);
      return res.status(401).json({ message: "Invalid token: User ID missing." });
    }

    req.user = {
      id: decoded.id || decoded._id || decoded.userId,
      email: decoded.email || "",
      role: decoded.role || "user",
      userName: decoded.userName || decoded.name || ""
    };

    console.log("[AUTH PROTECT]: Authenticated user ID:", req.user.id);
    next();
  } catch (err) {
    console.error("[AUTH PROTECT ERROR]:", err.message || err);
    return res.status(401).json({ message: "Invalid or expired token. Please log in again." });
  }
};

module.exports = protect;

