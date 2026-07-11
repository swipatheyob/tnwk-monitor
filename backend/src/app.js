const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const captureRoutes = require("./routes/captureRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
const esp32Routes = require("./routes/esp32Routes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  : null;

const corsOrigin = (origin, callback) => {
  if (!allowedOrigins || !origin || allowedOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error("Not allowed by CORS"));
};

/* Middleware */
app.use(
  cors({
    origin: corsOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({extended: true}));

/* Static Files */
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");

    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    next();
  },
  express.static(path.join(__dirname, "../uploads")),
);

/* Routes */
app.use("/api/auth", authRoutes);

app.use("/api/devices", deviceRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/captures", captureRoutes);

app.use("/api/analysis", analysisRoutes);

app.use("/api/esp32", esp32Routes);

app.use("/api/profile", profileRoutes);

/* Root */
app.get("/", (req, res) => {
  res.json({
    message: "Monitoring Satwa API",
  });
});

module.exports = app;
