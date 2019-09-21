const express = require("express");
const router = express.Router();

/**
 * Route - GET api/post
 * Description - post route
 * Access - Public
 */
router.get("/", (req, res) => res.send("post route"));

module.exports = router;
