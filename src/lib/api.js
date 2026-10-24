import axios from "axios";

export const TOKEN_KEY = "bb_token";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 25000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function storeToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getApiMessage(error, fallback = "Something went wrong. Please try again.") {
  return error?.response?.data?.message || error?.message || fallback;
}

export function getFieldErrors(error) {
  const errors = error?.response?.data?.errors;
  if (!Array.isArray(errors)) return {};
  return errors.reduce((map, item) => {
    if (item?.field && !map[item.field]) map[item.field] = item.message;
    return map;
  }, {});
}

export function assetUrl(url) {
  if (!url) return "";
  if (/^(https?:|data:|blob:)/.test(url)) return url;
  return url.startsWith("/") ? url : `/${url}`;
}

export default api;
