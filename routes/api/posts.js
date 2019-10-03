const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Post = require("../../models/Post");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");

/**
 * Route - POST api/post
 * Description - post route
 * Access - Private
 */
router.post(
  "/",
  [
    auth,
    [
      check("text", "Text is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } else {
        const user = await User.findById(req.user.id).select("-password");

        const newPost = new Post({
          text: req.body.text,
          name: user.name,
          avatar: user.avatar,
          user: req.user.id
        });

        const post = await newPost.save();

        res.status(200).json(post);
      }
    } catch (error) {
      return res.status(500).json({
        msg: error.message
      });
    }
  }
);

/**
 * Route - GET api/post
 * Description - GET all posts
 * Access - Private
 */
router.get("/", [auth], async (req, res) => {
  try {
    const post = await Post.find().sort({ date: -1 });

    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({
      msg: error.message
    });
  }
});

/**
 * Route - DELETE api/post
 * Description - Delete post by id
 * Access - Private
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if user owns the post
    if (post.user.toString() == req.user.id) {
      await post.remove();
      return res.status(200).json({ msg: "Success" });
    } else {
      return res.status(401).json({ msg: "User not authorized" });
    }
  } catch (error) {
    return res.status(500).json({
      msg: error.message
    });
  }
});

/**
 * Route - PUT api/post
 * Description - Like a post
 * Access - Private
 */
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ message: "Post already liked" });
    } else {
      post.likes.unshift({ user: req.user.id });
      await post.save();
      return res.status(200).json(post.likes);
    }
  } catch (error) {
    return res.status(500).json({
      msg: error.message
    });
  }
});

/**
 * Route - PUT api/like/:id
 * Description - Unlike a post
 * Access - Private
 */
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      return res.status(400).json({ msg: "Post not yet liked by the user" });
    } else {
      // Get remove index
      const removeIndex = post.likes
        .map(like => like.user.toString())
        .indexOf(req.user.id);

      post.likes.splice(removeIndex, 1);
      await post.save();
      return res.status(200).json(post.likes);
    }
  } catch (error) {
    return res.status(500).json({
      msg: error.message
    });
  }
});

/**
 * Route - POST api/post/comment
 * Description - Comment on a post
 * Access - Private
 */
router.post(
  "/comment/:id",
  [
    auth,
    [
      check("text", "Text is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } else {
        const user = await User.findById(req.user.id).select("-password");

        const post = await Post.findById(req.params.id);

        const newComment = {
          text: req.body.text,
          name: user.name,
          avatar: user.avatar,
          user: req.user.id
        };

        post.comments.unshift(newComment);

        await post.save();

        return res.status(200).json(post.comments);
      }
    } catch (error) {
      return res.status(500).json({
        msg: error.message
      });
    }
  }
);

/**
 * Route - Delete api/post/comment
 * Description - Delete Comment on a post
 * Access - Private
 */
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    const comment = post.comments.find(
      comment => comment.id.toString() === req.params.comment_id
    );

    if (!comment) {
      return res
        .status(404)
        .json({ msg: "Comment does not exist for that post" });
    } else if (comment.user.toString() != req.user.id) {
      return res
        .status(401)
        .json({ msg: "Comment does not belong to that user" });
    } else {
      // Get remove index
      const removeIndex = post.comments
        .map(comment => comment.user.toString())
        .indexOf(req.user.id);

      post.comments.splice(removeIndex, 1);
      await post.save();
      return res.status(200).json(post.comments);
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;
