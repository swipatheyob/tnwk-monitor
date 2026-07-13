const multer = require("multer");

const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/original/");
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    // IMAGE

    "image/jpeg",
    "image/jpg",
    "image/png",

    // VIDEO

    "video/mp4",
    "video/webm",
    "video/avi",
    "video/quicktime",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format file tidak didukung"), false);
  }
};

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 100 * 1024 * 1024,

    // 100 MB
  },
});

module.exports = upload;
