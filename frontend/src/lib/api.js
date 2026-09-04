import axios from "axios";

const configuredBackendUrl = process.env.REACT_APP_BACKEND_URL?.trim();
const isProductionBuild = process.env.NODE_ENV === "production";

if (!configuredBackendUrl && isProductionBuild) {
  console.error("REACT_APP_BACKEND_URL is required for production builds.");
}

const backendUrl = configuredBackendUrl || (isProductionBuild ? "" : "http://localhost:8000");
const api = axios.create({ baseURL: `${backendUrl.replace(/\/$/, "")}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("amurao_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API request failed", error.config?.method?.toUpperCase(), error.config?.url, error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export function formatApiError(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export default api;
