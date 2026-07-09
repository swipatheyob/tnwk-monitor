const Jimp =
  require("jimp");

const {
  ssim
} = require("ssim.js");

const calculateMSE =
  async (
    originalPath,
    processedPath
  ) => {

    const original =
      await Jimp.read(
        originalPath
      );

    const processed =
      await Jimp.read(
        processedPath
      );

    const width =
      Math.min(
        original.bitmap.width,
        processed.bitmap.width
      );

    const height =
      Math.min(
        original.bitmap.height,
        processed.bitmap.height
      );

    let sum = 0;

    let totalPixels =
      width * height;

    for (
      let y = 0;
      y < height;
      y++
    ) {

      for (
        let x = 0;
        x < width;
        x++
      ) {

        const originalColor =
          Jimp.intToRGBA(
            original.getPixelColor(
              x,
              y
            )
          );

        const processedColor =
          Jimp.intToRGBA(
            processed.getPixelColor(
              x,
              y
            )
          );

        const originalGray =
          (
            originalColor.r +
            originalColor.g +
            originalColor.b
          ) / 3;

        const processedGray =
          (
            processedColor.r +
            processedColor.g +
            processedColor.b
          ) / 3;

        const diff =
          originalGray -
          processedGray;

        sum +=
          diff * diff;

      }

    }

    const mse =
      sum /
      totalPixels;

    return Number(
      mse.toFixed(4)
    );

  };

const calculatePSNR =
  (mse) => {

    if (mse === 0) {

      return Infinity;

    }

    const psnr =
      10 *
      Math.log10(
        (255 * 255) / mse
      );

    return Number(
      psnr.toFixed(4)
    );

  };

const calculateSSIM =
  async (
    originalPath,
    processedPath
  ) => {

    const original =
      await Jimp.read(
        originalPath
      );

    const processed =
      await Jimp.read(
        processedPath
      );

    const width =
      Math.min(
        original.bitmap.width,
        processed.bitmap.width
      );

    const height =
      Math.min(
        original.bitmap.height,
        processed.bitmap.height
      );

    const originalData = [];
    const processedData = [];

    for (
      let y = 0;
      y < height;
      y++
    ) {

      for (
        let x = 0;
        x < width;
        x++
      ) {

        const o =
          Jimp.intToRGBA(
            original.getPixelColor(
              x,
              y
            )
          );

        const p =
          Jimp.intToRGBA(
            processed.getPixelColor(
              x,
              y
            )
          );

        originalData.push(
          (
            o.r +
            o.g +
            o.b
          ) / 3
        );

        processedData.push(
          (
            p.r +
            p.g +
            p.b
          ) / 3
        );

      }

    }

    const result =
      ssim(
        {
          data:
            originalData,
          width,
          height
        },
        {
          data:
            processedData,
          width,
          height
        }
      );

    return Number(
      result.mssim
        .toFixed(4)
    );

  };

const calculateStdDev =
  async (
    imagePath
  ) => {

    const image =
      await Jimp.read(
        imagePath
      );

    const values = [];

    for (
      let y = 0;
      y < image.bitmap.height;
      y++
    ) {

      for (
        let x = 0;
        x < image.bitmap.width;
        x++
      ) {

        const pixel =
          Jimp.intToRGBA(
            image.getPixelColor(
              x,
              y
            )
          );

        const gray =
          (
            pixel.r +
            pixel.g +
            pixel.b
          ) / 3;

        values.push(
          gray
        );

      }

    }

    const mean =
      values.reduce(
        (a, b) =>
          a + b,
        0
      ) /
      values.length;

    const variance =
      values.reduce(
        (sum, value) =>
          sum +
          Math.pow(
            value - mean,
            2
          ),
        0
      ) /
      values.length;

    return Number(
      Math.sqrt(
        variance
      ).toFixed(4)
    );

  };

const calculateHistogram =
  async (
    imagePath
  ) => {

    const image =
      await Jimp.read(
        imagePath
      );

    const histogram =
      new Array(256)
      .fill(0);

    for (
      let y = 0;
      y < image.bitmap.height;
      y++
    ) {

      for (
        let x = 0;
        x < image.bitmap.width;
        x++
      ) {

        const pixel =
          Jimp.intToRGBA(
            image.getPixelColor(
              x,
              y
            )
          );

        const gray =
          Math.round(
            (
              pixel.r +
              pixel.g +
              pixel.b
            ) / 3
          );

        histogram[
          gray
        ]++;

      }

    }

    return histogram;

  };

module.exports = {
  calculateMSE,
  calculatePSNR,
  calculateSSIM,
    calculateStdDev,
    calculateHistogram
};