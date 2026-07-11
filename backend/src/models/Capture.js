const mongoose = require("mongoose");

const captureSchema = new mongoose.Schema(
  {
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },

    originalImage: {
      type: String,
      required: true,
    },

    mediaType: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },

    // HASIL HISTOGRAM EQUALIZATION
    heImage: {
      type: String,
      default: null,
    },

    // HASIL ENHANCEMENT AKHIR
    processedImage: {
      type: String,
      default: null,
    },

    source: {
      type: String,
      enum: ["webcam", "esp32cam", "websocket"],
      default: "webcam",
      required: true,
    },

    capturedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Capture", captureSchema);
