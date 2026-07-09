const express =
  require("express");

const router =
  express.Router();

const {
  createDevice,
  getDevices,
  getDeviceById,
  updateDevice,
  deleteDevice
} = require(
  "../controllers/deviceController"
);

const {
  protect
} = require(
  "../middleware/authMiddleware"
);

router.post(
  "/",
  protect,
  createDevice
);

router.get(
  "/",
  protect,
  getDevices
);

router.get(
  "/:id",
  protect,
  getDeviceById
);

router.put(
  "/:id",
  protect,
  updateDevice
);

router.delete(
  "/:id",
  protect,
  deleteDevice
);

module.exports =
  router;