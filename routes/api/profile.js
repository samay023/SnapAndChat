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
      message: e
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
      console.log(req.user);
    } catch (e) {
      res.status(500).json({
        message: e.message
      });
    }
  }
);

module.exports = router;
