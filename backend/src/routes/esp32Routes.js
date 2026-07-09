const express =
  require("express");

const {
  proxyEsp32Stream
} = require(
  "../controllers/esp32Controller"
);

const router =
  express.Router();

router.get(
  "/stream",
  proxyEsp32Stream
);

module.exports =
  router;
