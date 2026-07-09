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