const path =
  require("path");

const Capture =
  require("../models/Capture");

const {
  histogramEqualization
} = require(
  "../services/histogramService"
);

const {
  calculateMSE,
  calculatePSNR,
  calculateSSIM,
    calculateStdDev,
    calculateHistogram
} = require(
  "../services/metricsService"
);

const processHistogram =
  async (
    req,
    res
  ) => {

    try {

      const { id } =
        req.params;

      const capture =
        await Capture.findById(
          id
        );

      if (!capture) {

        return res
          .status(404)
          .json({
            message:
              "Capture not found"
          });

      }

      const inputPath =
        path.join(
          __dirname,
          "../../uploads/original",
          capture.originalImage
        );

      const heOutputName =
        `he_${capture.originalImage}`;

      const enhancedOutputName =
        `enhanced_${capture.originalImage}`;

      const heOutputPath =
        path.join(
          __dirname,
          "../../uploads/processed",
          heOutputName
        );

      const enhancedOutputPath =
        path.join(
          __dirname,
          "../../uploads/processed",
          enhancedOutputName
        );

      await histogramEqualization(
        inputPath,
        heOutputPath,
        enhancedOutputPath
      );

      capture.heImage =
        heOutputName;

      capture.processedImage =
        enhancedOutputName;

      console.log(
        "HE:",
        heOutputName
      );

      console.log(
        "Enhanced:",
        enhancedOutputName
      );

      await capture.save();

      res.json({

        message:
          "Histogram Equalization Success",

        heImage:
          heOutputName,

        processedImage:
          enhancedOutputName

      });

    } catch (error) {

      console.error(
        "ERROR HISTOGRAM:"
      );

      console.error(
        error
      );

      res.status(500)
      .json({
        message:
          error.message
      });

    }

  };

const getMSE =
  async (
    req,
    res
  ) => {

    try {

      const { id } =
        req.params;

      const capture =
        await Capture.findById(id);

      if (
        !capture ||
        !capture.processedImage
      ) {

        return res
          .status(404)
          .json({
            message:
              "Processed image not found"
          });

      }

      const originalPath =
        path.join(
          __dirname,
          "../../uploads/original",
          capture.originalImage
        );

      const processedPath =
        path.join(
          __dirname,
          "../../uploads/processed",
          capture.processedImage
        );

      const mse =
        await calculateMSE(
          originalPath,
          processedPath
        );

      res.json({
        mse
      });

    } catch (error) {

      console.error(
        "ERROR MSE:"
      );

      console.error(error);

      res.status(500)
      .json({
        message:
          error.message
      });

    }

  };

const getPSNR =
  async (
    req,
    res
  ) => {

    try {

      const { id } =
        req.params;

      const capture =
        await Capture.findById(id);

      if (
        !capture ||
        !capture.processedImage
      ) {

        return res
          .status(404)
          .json({
            message:
              "Processed image not found"
          });

      }

      const originalPath =
        path.join(
          __dirname,
          "../../uploads/original",
          capture.originalImage
        );

      const processedPath =
        path.join(
          __dirname,
          "../../uploads/processed",
          capture.processedImage
        );

      const mse =
        await calculateMSE(
          originalPath,
          processedPath
        );

      const psnr =
        calculatePSNR(
          mse
        );

      res.json({
        mse,
        psnr
      });

    } catch (error) {

      console.error(
        "ERROR PSNR:"
      );

      console.error(error);

      res.status(500)
      .json({
        message:
          error.message
      });

    }

  };

const getSSIM =
  async (
    req,
    res
  ) => {

    try {

      const { id } =
        req.params;

      const capture =
        await Capture.findById(id);

      if (
        !capture ||
        !capture.processedImage
      ) {

        return res
          .status(404)
          .json({
            message:
              "Processed image not found"
          });

      }

      const originalPath =
        path.join(
          __dirname,
          "../../uploads/original",
          capture.originalImage
        );

      const processedPath =
        path.join(
          __dirname,
          "../../uploads/processed",
          capture.processedImage
        );

      const ssimValue =
        await calculateSSIM(
          originalPath,
          processedPath
        );

      res.json({
        ssim:
          ssimValue
      });

    } catch (error) {

      console.error(
        "ERROR SSIM:"
      );

      console.error(error);

      res.status(500)
      .json({
        message:
          error.message
      });

    }

  };

const getMetrics =
  async (
    req,
    res
  ) => {

    try {

      const { id } =
        req.params;

      const capture =
        await Capture.findById(id);

      if (
        !capture ||
        !capture.processedImage
      ) {

        return res
          .status(404)
          .json({
            message:
              "Processed image not found"
          });

      }

      const originalPath =
        path.join(
          __dirname,
          "../../uploads/original",
          capture.originalImage
        );

      const getImageMetrics =
        async (imageName) => {

          const processedPath =
            path.join(
              __dirname,
              "../../uploads/processed",
              imageName
            );

          const mse =
            await calculateMSE(
              originalPath,
              processedPath
            );

          const psnr =
            calculatePSNR(
              mse
            );

          const ssim =
            await calculateSSIM(
              originalPath,
              processedPath
            );

          const stdDev =
            await calculateStdDev(
              processedPath
            );

          return {
            mse,
            psnr,
            ssim,
            stdDev
          };

        };

      const enhanced =
        await getImageMetrics(
          capture.processedImage
        );

      const he =
        capture.heImage
          ? await getImageMetrics(
              capture.heImage
            )
          : null;

      res.json({
        ...enhanced,
        enhanced,
        he
      });

    } catch (error) {

      console.error(
        error
      );

      res.status(500)
      .json({
        message:
          error.message
      });

    }

  };

const getHistogram =
  async (
    req,
    res
  ) => {

    try {

      const { id } =
        req.params;

      const capture =
        await Capture.findById(id);

      if (!capture) {

        return res
          .status(404)
          .json({
            message:
              "Capture not found"
          });

      }

      const originalPath =
        path.join(
          __dirname,
          "../../uploads/original",
          capture.originalImage
        );

      const originalHistogram =
        await calculateHistogram(
          originalPath
        );

      let heHistogram =
        null;

      let enhancedHistogram =
        null;

      // Histogram HE
      if (
        capture.heImage
      ) {

        const hePath =
          path.join(
            __dirname,
            "../../uploads/processed",
            capture.heImage
          );

        heHistogram =
          await calculateHistogram(
            hePath
          );

      }

      // Histogram Enhanced
      if (
        capture.processedImage
      ) {

        const enhancedPath =
          path.join(
            __dirname,
            "../../uploads/processed",
            capture.processedImage
          );

        enhancedHistogram =
          await calculateHistogram(
            enhancedPath
          );

      }

      res.json({

        originalHistogram,

        heHistogram,

        enhancedHistogram

      });

    } catch (error) {

      console.error(
        error
      );

      res.status(500)
      .json({
        message:
          error.message
      });

    }

  };

module.exports = {
  processHistogram,
  getMSE,
  getPSNR,
  getSSIM,
  getMetrics,
  getHistogram
};