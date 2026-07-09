const http = require("http");
const https = require("https");

const ESP32_STREAM_URL =
  process.env.ESP32_STREAM_URL ||
  "http://10.130.31.35:81/stream";

console.log("ESP32 URL =", ESP32_STREAM_URL);

const proxyEsp32Stream =
  (req, res) => {

    let streamUrl;

    try {
      streamUrl =
        new URL(
          ESP32_STREAM_URL
        );
    } catch (error) {
      console.error(
        "Invalid ESP32_STREAM_URL:",
        error.message
      );

      return res.status(500).json({
        message:
          "ESP32 stream URL is invalid"
      });
    }

    const client =
      streamUrl.protocol === "https:"
        ? https
        : http;

    const upstreamRequest =
      client.get(
        streamUrl,
        {
          headers: {
            Accept:
              "multipart/x-mixed-replace,image/jpeg,*/*",
            "Cache-Control":
              "no-cache"
          },
          timeout: 5000
        },
        upstreamResponse => {

          if (
            upstreamResponse.statusCode < 200 ||
            upstreamResponse.statusCode >= 300
          ) {
            upstreamResponse.resume();

            return res.status(502).json({
              message:
                `ESP32-CAM returned status ${upstreamResponse.statusCode}`
            });
          }

          res.status(200);
          res.set({
            "Content-Type":
              upstreamResponse.headers[
                "content-type"
              ] ||
              "multipart/x-mixed-replace; boundary=frame",
            "Cache-Control":
              "no-cache, no-store, must-revalidate",
            Connection:
              "keep-alive",
            Pragma:
              "no-cache",
            "X-Accel-Buffering":
              "no"
          });

          res.flushHeaders();

          upstreamResponse.on(
            "data",
            chunk => {
              if (!res.write(chunk)) {
                upstreamResponse.pause();
              }
            }
          );

          res.on(
            "drain",
            () => {
              upstreamResponse.resume();
            }
          );

          upstreamResponse.on(
            "error",
            error => {

              if (
                error.code === "ECONNRESET" ||
                error.message === "aborted"
              ) {
                return;
              }

              console.error(
                "ESP32 stream response error:",
                error.message
              );

              if (!res.destroyed) {
                res.destroy(error);
              }
            }
          );

        }
      );

    upstreamRequest.on(
      "socket",
      socket => {
        socket.setTimeout(0);
        socket.setKeepAlive(true);
        socket.setNoDelay(true);
        if (socket.setMaxListeners) {
          socket.setMaxListeners(0);
        }
      }
    );

    res.on(
      "socket",
      socket => {
        socket.setNoDelay(true);
      }
    );

    upstreamRequest.on(
      "error",
      error => {

        if (
          error.code === "ECONNRESET" ||
          error.code === "EPIPE" ||
          error.message === "socket hang up"
        ) {
          return;
        }

        console.error(
          "ESP32 stream connection error:",
          error.message
        );

        if (!res.headersSent) {

          res.status(502).json({
            message:
              "Unable to connect to ESP32-CAM stream"
          });

        } else if (!res.destroyed) {

          res.destroy(error);

        }

      }
    );

    res.on(
      "close",
      () => {
        upstreamRequest.destroy();
      }
    );

  };

module.exports = {
  proxyEsp32Stream
};

