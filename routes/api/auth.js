const express = require("express");
const router = express.Router();

/**
 * Route - GET api/auth
 * Description - auth route
 * Access - Public
 */
router.get("/", (req, res) => res.send("auth route"));

module.exports = router;
