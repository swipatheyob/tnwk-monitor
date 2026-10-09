import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import DeviceList from "../pages/DeviceList";
import DeviceForm from "../pages/DeviceForm";
import DeviceLocation from "../pages/DeviceLocation";
import Capture from "../pages/Capture";
import CaptureDetail from "../pages/CaptureDetail";
import Analysis from "../pages/Analysis";
import CameraSimulator  from "../pages/CameraSimulator";
import UploadCapture from "../pages/UploadCapture";
import Profile from "../pages/Profile";
import LiveMonitoring from "../pages/LiveMonitoring";
import AddWebcam from "../pages/AddWebcam";
import LiveCameraView from "../pages/LiveCameraView";
import SystemArchitecture from "../pages/SystemArchitecture";

import ProtectedRoute from "../components/ProtectedRoute";

function AppRoutes() {

  return (

    <BrowserRouter>

      <Routes>

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/architecture"
          element={<ProtectedRoute><SystemArchitecture /></ProtectedRoute>}
        />

        {/* Device List */}
        <Route
          path="/devices"
          element={
            <ProtectedRoute>
              <DeviceList />
            </ProtectedRoute>
          }
        />

        {/* Add Device */}
        <Route
          path="/devices/add"
          element={
            <ProtectedRoute>
              <DeviceForm />
            </ProtectedRoute>
          }
        />

        {/* Edit Device */}
        <Route
          path="/devices/edit/:id"
          element={
            <ProtectedRoute>
              <DeviceForm />
            </ProtectedRoute>
          }
        />

        {/* Device Location */}
        <Route
          path="/locations"
          element={
            <ProtectedRoute>
              <DeviceLocation />
            </ProtectedRoute>
          }
        />

        {/* Capture */}
        <Route
          path="/captures"
          element={
            <ProtectedRoute>
              <Capture />
            </ProtectedRoute>
          }
        />

        <Route
          path="/captures/:id"
          element={
            <ProtectedRoute>
              <CaptureDetail />
            </ProtectedRoute>
          }
        />

        {/* Analysis */}
        <Route
          path="/analysis"
          element={
            <ProtectedRoute>
              <Analysis />
            </ProtectedRoute>
          }
        />

        {/* Camera Simulator */}
        <Route
          path="/simulator"
          element={
            <ProtectedRoute>
              <CameraSimulator />
            </ProtectedRoute>
          }
         />

        <Route
          path="/monitoring"
          element={<ProtectedRoute><LiveMonitoring /></ProtectedRoute>}
        />

        <Route
          path="/monitoring/add-webcam"
          element={<ProtectedRoute><AddWebcam /></ProtectedRoute>}
        />

        <Route
          path="/monitoring/camera/:deviceId"
          element={<ProtectedRoute><LiveCameraView /></ProtectedRoute>}
        />

        {/* Upload Capture */}
        <Route
          path="/upload-capture"
          element={
            <ProtectedRoute>
              <UploadCapture />
            </ProtectedRoute>
          }
        />

        {/* Profile Administrator */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>

  );

}

export default AppRoutes;
