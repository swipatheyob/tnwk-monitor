const Capture = require("../models/Capture");

const createCapture = async (req, res) => {
  try {
    const {deviceId, source} = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "File wajib diupload",
      });
    }

    const captureSource = source || "webcam";

    const capture = await Capture.create({
      deviceId,

      source: captureSource,

      originalImage: req.file.filename,

      mediaType: req.file.mimetype.startsWith("video/") ? "video" : "image",

      processedImage: null,
    });

    await capture.populate("deviceId");

    res.status(201).json(capture);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const getCaptures = async (req, res) => {
  try {
    const captures = await Capture.find().populate("deviceId").sort({
      capturedAt: -1,
    });

    res.json({
      captures,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getCaptureById = async (req, res) => {
  try {
    const capture = await Capture.findById(req.params.id).populate("deviceId");

    if (!capture) {
      return res.status(404).json({
        message: "Capture not found",
      });
    }

    res.json(capture);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteCapture = async (req, res) => {
  try {
    const capture = await Capture.findByIdAndDelete(req.params.id);

    if (!capture) {
      return res.status(404).json({
        message: "Capture not found",
      });
    }

    res.json({
      message: "Capture deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = {
  createCapture,
  getCaptures,
  getCaptureById,
  deleteCapture,
};
