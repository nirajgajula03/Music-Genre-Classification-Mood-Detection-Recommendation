import axios from "axios";
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const origin = baseURL.replace(/\/api\/?$/, "");
const client = axios.create({ baseURL });
client.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("dm_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
export function resolveStreamUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//.test(url)) return url;
  return origin + url;
}
export default client;
