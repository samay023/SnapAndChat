const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Post = require("../../models/Post");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");

/**
 * Route - GET api/post
 * Description - post route
 * Access - Private
 */
router.get("/", [auth,[
    check("text", "Text is required")
      .not()
      .isEmpty(),
    check("skills", "Skills is required")
      .not()
      .isEmpty()
  ]], await (req, res) => {
    res.send("post route")});

module.exports = router;
