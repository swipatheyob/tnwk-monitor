const getDefaultBackendOrigin = () => {
  if (typeof window === "undefined") {
    return "http://localhost:5000";
  }

  return `${window.location.protocol}//${window.location.hostname}:5000`;
};

export const BACKEND_BASE_URL =
  (
    import.meta.env.VITE_BACKEND_URL ||
    getDefaultBackendOrigin()
  ).replace(/\/$/, "");

export const API_BASE_URL =
  (
    import.meta.env.VITE_API_BASE_URL ||
    `${BACKEND_BASE_URL}/api`
  ).replace(/\/$/, "");

export const getApiUrl =
  path =>
    `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const getBackendUrl =
  path =>
    `${BACKEND_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
