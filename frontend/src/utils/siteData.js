import { useEffect, useState } from "react";
import api from "../api";

// Logo, menus and banners come from the admin panel (/api/site-data).
// The last answer is saved in the browser, so on refresh the correct logo,
// menu and banners show immediately instead of the old defaults, and the
// fresh data replaces it a moment later.
const KEY = "school_site_data_v1";

const readCache = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
};

let memory = readCache();
let request = null;
const listeners = new Set();

export function loadSiteData() {
  if (!request) {
    request = api
      .get("/api/site-data")
      .then(({ data }) => {
        memory = data;
        try {
          localStorage.setItem(KEY, JSON.stringify(data));
        } catch {
          /* storage full or blocked - ignore */
        }
        listeners.forEach((fn) => fn(data));
        return data;
      })
      .catch((error) => {
        request = null;
        throw error;
      });
  }
  return request;
}

// Turn "/uploads/logo.png" into "http://backend/uploads/logo.png"
export const assetUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const base = String(api.defaults.baseURL || "").replace(/\/+$/, "").replace(/\/api$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
};

// data: site data or null while nothing is known yet
// ready: true once data arrived (or loading failed) - safe to show defaults then
export function useSiteData() {
  const [data, setData] = useState(memory);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    listeners.add(setData);
    loadSiteData().catch(() => setFailed(true));
    return () => listeners.delete(setData);
  }, []);

  return { data, ready: !!data || failed };
}
