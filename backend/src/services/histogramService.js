const Jimp =
  require("jimp");

const histogramEqualization =
async (
  inputFile,
  heOutputFile,
  enhancedOutputFile
) => {

  const original =
    await Jimp.read(
      inputFile
    );

  const width =
    original.bitmap.width;

  const height =
    original.bitmap.height;

  // =========================
  // HISTOGRAM EQUALIZATION
  // =========================

  const heImage =
    original.clone();

  const histogram =
    new Array(256).fill(0);

  heImage.scan(
    0,
    0,
    width,
    height,
    function (
      x,
      y,
      idx
    ) {

      const r =
        this.bitmap.data[idx];

      const g =
        this.bitmap.data[idx + 1];

      const b =
        this.bitmap.data[idx + 2];

      const gray =
        Math.round(
          (r + g + b) / 3
        );

      histogram[gray]++;

    }
  );

  const cdf =
    new Array(256).fill(0);

  cdf[0] =
    histogram[0];

  for (
    let i = 1;
    i < 256;
    i++
  ) {

    cdf[i] =
      cdf[i - 1] +
      histogram[i];

  }

  const totalPixels =
    width * height;

  const lookup =
    cdf.map(
      value =>
        Math.round(
          (value * 255) /
          totalPixels
        )
    );

  heImage.scan(
    0,
    0,
    width,
    height,
    function (
      x,
      y,
      idx
    ) {

      const r =
        this.bitmap.data[idx];

      const g =
        this.bitmap.data[idx + 1];

      const b =
        this.bitmap.data[idx + 2];

      const gray =
        Math.round(
          (r + g + b) / 3
        );

      const eq =
        lookup[gray];

      this.bitmap.data[idx] =
        eq;

      this.bitmap.data[idx + 1] =
        eq;

      this.bitmap.data[idx + 2] =
        eq;

    }
  );

  await heImage.writeAsync(
    heOutputFile
  );

  // =========================
  // ENHANCED COLOR VERSION
  // =========================

  const enhanced =
    original.clone();

  enhanced.scan(
    0,
    0,
    width,
    height,
    function (
      x,
      y,
      idx
    ) {

      let r =
        this.bitmap.data[idx];

      let g =
        this.bitmap.data[idx + 1];

      let b =
        this.bitmap.data[idx + 2];

      // Brightness

      r += 25;
      g += 25;
      b += 25;

      // Contrast

      const contrast =
        1.30;

      r =
        ((r - 128) *
          contrast) +
        128;

      g =
        ((g - 128) *
          contrast) +
        128;

      b =
        ((b - 128) *
          contrast) +
        128;

      // Saturation

      const avg =
        (r + g + b) / 3;

      const saturation =
        1.20;

      r =
        avg +
        (r - avg) *
        saturation;

      g =
        avg +
        (g - avg) *
        saturation;

      b =
        avg +
        (b - avg) *
        saturation;

      r =
        Math.max(
          0,
          Math.min(
            255,
            r
          )
        );

      g =
        Math.max(
          0,
          Math.min(
            255,
            g
          )
        );

      b =
        Math.max(
          0,
          Math.min(
            255,
            b
          )
        );

      this.bitmap.data[idx] =
        r;

      this.bitmap.data[idx + 1] =
        g;

      this.bitmap.data[idx + 2] =
        b;

    }
  );

  await enhanced.writeAsync(
    enhancedOutputFile
  );

  return {
    heOutputFile,
    enhancedOutputFile
  };

};

module.exports = {
  histogramEqualization
};