const express =
  require("express");

const router =
  express.Router();

const uploadProfile =
  require("../config/profileMulter");

const {
  protect
} = require("../middleware/authMiddleware");

const {
  getProfile,
  updateProfile,
  updatePassword
} = require("../controllers/profileController");

router.get(
  "/",
  protect,
  getProfile
);

router.put(
  "/",
  protect,
  uploadProfile.single("photo"),
  updateProfile
);

router.put(
  "/password",
  protect,
  updatePassword
);

module.exports =
  router;
