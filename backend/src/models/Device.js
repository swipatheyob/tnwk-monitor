const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    deviceName: {
      type: String,
      required: true
    },

    deviceCode: {
      type: String,
      required: true,
      unique: true
    },

    cameraType: {
      type: String,
      enum: ["esp32cam", "webcam"],
      default: "esp32cam"
    },

    // MAC address dipakai sebagai identitas stream WebSocket tiap kamera.
    // Bersifat opsional agar data perangkat lama tetap dapat digunakan.
    macAddress: {
      type: String,
      trim: true,
      uppercase: true,
      default: ""
    },

    latitude: {
      type: Number,
      default: 0
    },

    longitude: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline"
    },

    lastSeen: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.model(
    "Device",
    deviceSchema
  );
