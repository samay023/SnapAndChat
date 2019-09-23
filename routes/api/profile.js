const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");

/**
 * Route - GET api/profile/me
 * Description - Get current users profile
 * Access - Private
 */
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({
        message: "Profile does not exist"
      });
    }
    res.send(profile);
  } catch (e) {
    res.status(500).json({
      message: e.message
    });
  }
});

/**
 * Route - POST api/profile
 * Description - Create / Update user profile
 * Access - Private
 */
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required")
        .not()
        .isEmpty(),
      check("skills", "Skills is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array()
        });
      } else {
        const {
          company,
          website,
          location,
          bio,
          status,
          skills,
          experience,
          education
        } = req.body;

        const profileFields = {};
        profileFields.user = req.user.id;

        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (skills) {
          profileFields.skills = skills.split(",").map(skill => skill.trim());
        }

        if (experience) profileFields.experience = experience;
        if (education) profileFields.education = education;

        let profile = await Profile.findOne({
          user: req.user.id
        });

        if (profile) {
          // Update profile if found
          profile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true, useFindAndModify: false }
          );
          res.status(200).json(profile);
        } else {
          profile = new Profile(profileFields);
          await profile.save();
          res.status(200).json(profile);
        }
      }
    } catch (e) {
      res.status(500).json({
        message: e.message
      });
    }
  }
);

/**
 * Route - GET api/profiles
 * Description - Get all profiles
 * Access - Public
 */
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (e) {
    res.status(500).json({
      message: e.message
    });
  }
});

/**
 * Route - GET api/profile/user/:userid
 * Description - Get user profile based on id
 * Access - Public
 */
router.get("/user/:userid", async (req, res) => {
  try {
    const userID = req.params.userid || "";
    if (userID.match(/^[0-9a-fA-F]{24}$/)) {
      const profile = await Profile.findOne({
        user: userID
      }).populate("user", ["name", "avatar"]);

      profile
        ? res.status(200).json(profile)
        : res.status(400).json({ message: "No profile found" });
    } else {
      throw Error("No profile found");
    }
  } catch (e) {
    res.status(500).json({
      message: e.message
    });
  }
});

/**
 * Route - DELETE api/profile/user/:userid
 * Description - Delete profile, user and posts
 * Access - public
 */
router.delete("/user/:userid", async (req, res) => {
  try {
    const userID = req.params.userid || "";

    if (userID.match(/^[0-9a-fA-F]{24}$/)) {
      await Profile.findOneAndRemove({
        user: userID
      });

      await User.findOneAndRemove({ _id: userID });

      res.status(200).json({ message: "Profile deleted" });
    } else {
      throw Error("No profile found");
    }
  } catch (e) {
    res.status(500).json({
      message: e.message
    });
  }
});

module.exports = router;
