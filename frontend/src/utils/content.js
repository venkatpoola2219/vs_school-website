import DOMPurify from "dompurify";
import api from "../api";

// Backend address, e.g. http://localhost:5000 (without a trailing slash)
export const backendBase = () =>
  String(api.defaults.baseURL || "").replace(/\/+$/, "").replace(/\/api$/, "");

const UPLOAD_ATTR = /(src|href)="\/uploads\//g;

// Pages store uploaded files as "/uploads/xyz.png" so the site keeps working if
// the backend address ever changes. These two helpers add / remove the address.
export const withBackendUrl = (html = "") =>
  html.replace(UPLOAD_ATTR, `$1="${backendBase()}/uploads/`);

export const withoutBackendUrl = (html = "") => {
  const base = backendBase();
  if (!base) return html;
  return html.split(`="${base}/uploads/`).join('="/uploads/');
};

const looksLikeHtml = (text) => /<\/?[a-z][\s\S]*>/i.test(text);
const escapeHtml = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Old pages were saved as plain text; new pages are saved as HTML.
// This turns either into safe HTML that can be shown on the website.
export function contentToSafeHtml(content = "") {
  const raw = String(content || "");
  const html = looksLikeHtml(raw)
    ? raw
    : escapeHtml(raw).replace(/\r?\n/g, "<br>");

  const clean = DOMPurify.sanitize(withBackendUrl(html), {
    ADD_ATTR: ["target", "download"],
    FORBID_TAGS: ["style", "form", "input", "button", "textarea", "select"],
  });
  return clean;
}
