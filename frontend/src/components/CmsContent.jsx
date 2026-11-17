import React, { useMemo } from "react";
import { contentToSafeHtml } from "../utils/content";

// Shows page content written in the admin editor (text, photos, files, tables, links).
export default function CmsContent({ html, style }) {
  const safe = useMemo(() => contentToSafeHtml(html), [html]);
  return (
    <div
      className="cms-content"
      style={style}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
