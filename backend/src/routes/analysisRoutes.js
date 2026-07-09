const express =
  require("express");

const router =
  express.Router();

const {
  protect
} = require(
  "../middleware/authMiddleware"
);

const {
  processHistogram,
  getMSE,
  getPSNR,
  getSSIM,
  getMetrics,
  getHistogram
} = require(
  "../controllers/analysisController"
);

router.post(
  "/histogram/:id",
  protect,
  processHistogram
);

router.get(
  "/mse/:id",
  protect,
  getMSE
);

router.get(
  "/psnr/:id",
  protect,
  getPSNR
);

router.get(
  "/ssim/:id",
  protect,
  getSSIM
);

router.get(
  "/metrics/:id",
  protect,
  getMetrics
);

router.get(
  "/histogram-data/:id",
  protect,
  getHistogram
);

module.exports =
  router;