const fs =
  require("fs");

const multer =
  require("multer");

const path =
  require("path");

const uploadDir =
  path.join(
    __dirname,
    "../../uploads/profile"
  );

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(
    uploadDir,
    {
      recursive: true
    }
  );
}

const storage =
  multer.diskStorage({

    destination:
      function (
        req,
        file,
        cb
      ) {

        cb(
          null,
          uploadDir
        );

      },

    filename:
      function (
        req,
        file,
        cb
      ) {

        const safeName =
          file.originalname
            .replace(/\s+/g, "-")
            .replace(/[^a-zA-Z0-9.-]/g, "");

        cb(
          null,
          `${Date.now()}-${safeName}`
        );

      }

  });

const fileFilter =
  (
    req,
    file,
    cb
  ) => {

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp"
    ];

    if (
      allowedTypes.includes(
        file.mimetype
      )
    ) {

      cb(
        null,
        true
      );

    } else {

      cb(
        new Error(
          "Format foto harus jpg, jpeg, png, atau webp"
        ),
        false
      );

    }

  };

const uploadProfile =
  multer({

    storage,

    fileFilter,

    limits: {
      fileSize:
        5 * 1024 * 1024
    }

  });

module.exports =
  uploadProfile;
