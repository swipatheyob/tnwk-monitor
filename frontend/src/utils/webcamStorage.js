const getWebcamStorageKey = (deviceId) =>
  `tnwk-monitor:webcam-device:${deviceId}`;

export const saveWebcamDeviceId = (deviceId, browserDeviceId) => {
  localStorage.setItem(getWebcamStorageKey(deviceId), browserDeviceId);
};

export const getWebcamDeviceId = (deviceId) =>
  localStorage.getItem(getWebcamStorageKey(deviceId));

export const isWebcamDevice = (device) =>
  device?.cameraType === "webcam" ||
  String(device?.deviceCode || "").toUpperCase().startsWith("WEBCAM-") ||
  Boolean(device?._id && getWebcamDeviceId(device._id));
