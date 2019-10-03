const jwttoken = require("jsonwebtoken");
const config = require("config");

module.exports = (req, res, next) => {
  // Get JSON web token from header
  const token = req.header("x-auth-token");

  // Check if valid token
  if (!token) {
    return res.status(401).json({
      msg: "Unauthorized token"
    });
  }

  // Verify token
  try {
    const decoded = jwttoken.verify(token, config.get("jwtSecret"));

    req.user = decoded.user;

    next();
  } catch (e) {
    res.status(401).json({ msg: e.message });
  }
};
