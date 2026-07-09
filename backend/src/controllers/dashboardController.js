const Device =
  require("../models/Device");

const Capture =
  require("../models/Capture");

const getDashboardStats =
  async (
    req,
    res
  ) => {

    try {

      const totalDevice =
        await Device.countDocuments();

      const onlineDevice =
        await Device.countDocuments({
          status:
            "online"
        });

      const offlineDevice =
        await Device.countDocuments({
          status:
            "offline"
        });

      const totalCapture =
        await Capture.countDocuments();

      res.json({

        totalDevice,

        onlineDevice,

        offlineDevice,

        totalCapture

      });

    } catch (error) {

      res.status(500)
        .json({
          message:
            error.message
        });

    }

  };

module.exports = {
  getDashboardStats
};