#include <Arduino.h>
#include <WiFi.h>
#include "esp_camera.h"
#include "esp_http_server.h"

// Isi dengan Wi-Fi yang sama dengan komputer/server backend.
const char *WIFI_SSID = "GANTI_DENGAN_NAMA_WIFI";
const char *WIFI_PASSWORD = "GANTI_DENGAN_PASSWORD_WIFI";

// Pinout ESP32-CAM AI-Thinker.
#define PWDN_GPIO_NUM 32
#define RESET_GPIO_NUM -1
#define XCLK_GPIO_NUM 0
#define SIOD_GPIO_NUM 26
#define SIOC_GPIO_NUM 27
#define Y9_GPIO_NUM 35
#define Y8_GPIO_NUM 34
#define Y7_GPIO_NUM 39
#define Y6_GPIO_NUM 36
#define Y5_GPIO_NUM 21
#define Y4_GPIO_NUM 19
#define Y3_GPIO_NUM 18
#define Y2_GPIO_NUM 5
#define VSYNC_GPIO_NUM 25
#define HREF_GPIO_NUM 23
#define PCLK_GPIO_NUM 22

static const char *STREAM_CONTENT_TYPE =
    "multipart/x-mixed-replace;boundary=frame";
static const char *STREAM_BOUNDARY = "\r\n--frame\r\n";
static const char *STREAM_PART =
    "Content-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n";

httpd_handle_t stream_httpd = nullptr;

static esp_err_t indexHandler(httpd_req_t *request) {
  httpd_resp_set_type(request, "text/plain; charset=utf-8");
  return httpd_resp_send(request, "ESP32-CAM online. MJPEG: /stream\n", HTTPD_RESP_USE_STRLEN);
}

static esp_err_t streamHandler(httpd_req_t *request) {
  esp_err_t result = httpd_resp_set_type(request, STREAM_CONTENT_TYPE);
  if (result != ESP_OK) {
    return result;
  }

  httpd_resp_set_hdr(request, "Access-Control-Allow-Origin", "*");
  httpd_resp_set_hdr(request, "Cache-Control", "no-cache, no-store, must-revalidate");
  httpd_resp_set_hdr(request, "Pragma", "no-cache");

  char part_header[64];

  while (true) {
    camera_fb_t *frame = esp_camera_fb_get();
    if (frame == nullptr) {
      Serial.println("Gagal mengambil frame kamera");
      return ESP_FAIL;
    }

    result = httpd_resp_send_chunk(
        request, STREAM_BOUNDARY, strlen(STREAM_BOUNDARY));

    if (result == ESP_OK) {
      const size_t header_length = snprintf(
          part_header, sizeof(part_header), STREAM_PART, frame->len);
      result = httpd_resp_send_chunk(request, part_header, header_length);
    }

    if (result == ESP_OK) {
      result = httpd_resp_send_chunk(
          request, reinterpret_cast<const char *>(frame->buf), frame->len);
    }

    esp_camera_fb_return(frame);

    if (result != ESP_OK) {
      break;
    }
  }

  return result;
}

static bool startCamera() {
  camera_config_t config = {};
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_VGA;
  config.jpeg_quality = 12;
  config.fb_count = psramFound() ? 2 : 1;
  config.fb_location = psramFound() ? CAMERA_FB_IN_PSRAM : CAMERA_FB_IN_DRAM;
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;

  const esp_err_t result = esp_camera_init(&config);
  if (result != ESP_OK) {
    Serial.printf("Inisialisasi kamera gagal: 0x%x\n", result);
    return false;
  }

  return true;
}

static bool startStreamServer() {
  httpd_config_t config = HTTPD_DEFAULT_CONFIG();
  config.server_port = 81;
  config.ctrl_port = 32769;
  config.stack_size = 8192;
  config.max_open_sockets = 2;

  if (httpd_start(&stream_httpd, &config) != ESP_OK) {
    Serial.println("Gagal memulai HTTP stream server di port 81");
    return false;
  }

  httpd_uri_t index_uri = {};
  index_uri.uri = "/";
  index_uri.method = HTTP_GET;
  index_uri.handler = indexHandler;

  httpd_uri_t stream_uri = {};
  stream_uri.uri = "/stream";
  stream_uri.method = HTTP_GET;
  stream_uri.handler = streamHandler;

  httpd_register_uri_handler(stream_httpd, &index_uri);
  httpd_register_uri_handler(stream_httpd, &stream_uri);
  return true;
}

void setup() {
  Serial.begin(115200);
  Serial.println();

  if (!startCamera()) {
    Serial.println("Periksa board ESP32-CAM dan sambungan kamera.");
    return;
  }

  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.printf("Menghubungkan ke Wi-Fi %s", WIFI_SSID);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();

  if (!startStreamServer()) {
    return;
  }

  Serial.printf("ESP32-CAM siap: http://%s:81/stream\n",
                WiFi.localIP().toString().c_str());
  Serial.println("Arahkan backend ESP32_STREAM_URL ke URL di atas.");
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    WiFi.reconnect();
    delay(1000);
  }
}