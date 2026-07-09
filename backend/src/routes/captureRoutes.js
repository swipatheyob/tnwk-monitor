const express =
  require("express");

const router =
  express.Router();

const upload =
  require(
    "../config/multer"
  );

const {
  protect
} = require(
  "../middleware/authMiddleware"
);

const {
  createCapture,
  getCaptures,
  getCaptureById,
  deleteCapture
} = require(
  "../controllers/captureController"
);

router.post(
  "/",
  protect,
  upload.single(
    "image"
  ),
  createCapture
);

router.get(
  "/",
  protect,
  getCaptures
);

router.get(
  "/:id",
  protect,
  getCaptureById
);

router.delete(
  "/:id",
  protect,
  deleteCapture
);

module.exports =
  router;

