export const getDeviceDisplayName =
  capture => {

    const deviceName =
      capture?.deviceId
        ?.deviceName
        ?.trim();

    return deviceName ||
      "Device tidak tersedia";

  };

export const getCaptureDate =
  capture => {

    const date =
      new Date(
        capture?.capturedAt ||
        capture?.createdAt
      );

    return Number.isNaN(
      date.getTime()
    )
      ? "-"
      : [
        [
          date.getDate(),
          date.getMonth() + 1,
          date.getFullYear()
        ]
          .map(
            value =>
              String(value)
                .padStart(2, "0")
          )
          .join("/"),
        [
          date.getHours(),
          date.getMinutes(),
          date.getSeconds()
        ]
          .map(
            value =>
              String(value)
                .padStart(2, "0")
          )
          .join(":")
      ].join(" ");

  };
