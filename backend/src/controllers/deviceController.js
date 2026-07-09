const Device =
  require("../models/Device");


// CREATE
const createDevice =
async (req, res) => {

  try {

    const device =
      await Device.create(
        req.body
      );

    res.status(201).json(
      device
    );

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


// GET ALL
const getDevices =
async (req, res) => {

  try {

    const devices =
      await Device.find();

    res.json(devices);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


// GET BY ID
const getDeviceById =
async (req, res) => {

  try {

    const device =
      await Device.findById(
        req.params.id
      );

    if (!device) {

      return res.status(404)
      .json({
        message:
        "Device not found"
      });

    }

    res.json(device);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


// UPDATE
const updateDevice =
async (req, res) => {

  try {

    const device =
      await Device.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

    res.json(device);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


// DELETE
const deleteDevice =
async (req, res) => {

  try {

    await Device.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message:
      "Device deleted"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

module.exports = {
  createDevice,
  getDevices,
  getDeviceById,
  updateDevice,
  deleteDevice
};