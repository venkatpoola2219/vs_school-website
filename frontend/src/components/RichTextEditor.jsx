import React, { useEffect, useRef, useState } from "react";
import { withBackendUrl, withoutBackendUrl } from "../utils/content";

const escapeAttr = (text = "") =>
  String(text).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// keep the editor selection when clicking toolbar buttons
const keep = (e) => e.preventDefault();

const Btn = ({ title, onClick, children, disabled }) => (
  <button type="button" className="rte-btn" title={title} onMouseDown={keep} onClick={onClick} disabled={disabled}>
    {children}
  </button>
);

/**
 * Page content editor with two modes:
 *   - Visual:    type like Word, bold / headings / lists / links / tables / photos / files
 *   - HTML code: write or paste your own HTML
 *
 * Props
 *   value        the page content (HTML string)
 *   onChange     called with the new HTML string
 *   uploadFile   async (file) => ({ path, name, isImage })   uploads to the backend
 *   onError      (message) => void
 */
export default function RichTextEditor({ value = "", onChange, uploadFile, onError }) {
  const [mode, setMode] = useState("visual");
  const [busy, setBusy] = useState(false);

  const editorRef = useRef(null);
  const textRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const savedRange = useRef(null);

  // Put the saved HTML into the visual editor (only when it really differs,
  // so the cursor does not jump while typing).
  useEffect(() => {
    if (mode !== "visual" || !editorRef.current) return;
    const current = withoutBackendUrl(editorRef.current.innerHTML);
    if (current !== (value || "")) {
      editorRef.current.innerHTML = withBackendUrl(value || "");
    }
  }, [value, mode]);

  const emit = () => {
    if (!editorRef.current) return;
    let html = withoutBackendUrl(editorRef.current.innerHTML);
    if (html === "<br>" || html === "<div><br></div>") html = "";
    onChange(html);
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && editorRef.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    if (savedRange.current) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  const exec = (command, arg = null) => {
    restoreSelection();
    document.execCommand(command, false, arg);
    saveSelection();
    emit();
  };

  // Insert HTML at the cursor (visual mode) or at the text cursor (code mode)
  const insertHtml = (visualHtml, codeHtml = visualHtml) => {
    if (mode === "visual") {
      restoreSelection();
      document.execCommand("insertHTML", false, visualHtml);
      saveSelection();
      emit();
    } else {
      const area = textRef.current;
      const start = area ? area.selectionStart : (value || "").length;
      const end = area ? area.selectionEnd : start;
      onChange((value || "").slice(0, start) + codeHtml + (value || "").slice(end));
    }
  };

  const pickUpload = async (event, kind) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const result = await uploadFile(file);
      const path = result.path;
      if (kind === "image") {
        const alt = escapeAttr(file.name.replace(/\.[^.]+$/, ""));
        insertHtml(`<img src="${withBackendUrl(path)}" alt="${alt}">`, `<img src="${path}" alt="${alt}">`);
      } else {
        const name = escapeAttr(result.name || file.name);
        insertHtml(
          `<a class="file-link" href="${withBackendUrl(path)}" target="_blank" rel="noopener">📎 ${name}</a>&nbsp;`,
          `<a class="file-link" href="${path}" target="_blank" rel="noopener">📎 ${name}</a>&nbsp;`
        );
      }
    } catch (err) {
      onError?.(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const openPicker = (ref) => {
    saveSelection();
    ref.current?.click();
  };

  const addLink = () => {
    saveSelection();
    const url = window.prompt("Link address (for example https://example.com or /page/fees)");
    if (!url) return;
    if (mode === "visual") exec("createLink", url);
    else insertHtml("", `<a href="${escapeAttr(url)}">link text</a>`);
  };

  const addTable = () =>
    insertHtml(
      "<table><thead><tr><th>Heading 1</th><th>Heading 2</th><th>Heading 3</th></tr></thead>" +
        "<tbody><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>" +
        "<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table><p><br></p>"
    );

  return (
    <div className="rte">
      <div className="rte-tabs">
        <button type="button" className={mode === "visual" ? "active" : ""} onClick={() => setMode("visual")}>
          Visual editor
        </button>
        <button type="button" className={mode === "code" ? "active" : ""} onClick={() => setMode("code")}>
          HTML code
        </button>
        {busy && <span className="rte-busy">Uploading…</span>}
      </div>

      <div className="rte-toolbar">
        {mode === "visual" && (
          <>
            <select
              className="rte-select"
              defaultValue=""
              onMouseDown={saveSelection}
              onChange={(e) => {
                if (e.target.value) exec("formatBlock", e.target.value);
                e.target.value = "";
              }}
              title="Text style"
            >
              <option value="">Style…</option>
              <option value="<p>">Paragraph</option>
              <option value="<h2>">Heading</option>
              <option value="<h3>">Sub heading</option>
              <option value="<blockquote>">Quote</option>
            </select>
            <Btn title="Bold" onClick={() => exec("bold")}><b>B</b></Btn>
            <Btn title="Italic" onClick={() => exec("italic")}><i>I</i></Btn>
            <Btn title="Underline" onClick={() => exec("underline")}><u>U</u></Btn>
            <span className="rte-sep" />
            <Btn title="Bullet list" onClick={() => exec("insertUnorderedList")}>• List</Btn>
            <Btn title="Numbered list" onClick={() => exec("insertOrderedList")}>1. List</Btn>
            <span className="rte-sep" />
            <Btn title="Align left" onClick={() => exec("justifyLeft")}>⬅</Btn>
            <Btn title="Align center" onClick={() => exec("justifyCenter")}>↔</Btn>
            <Btn title="Align right" onClick={() => exec("justifyRight")}>➡</Btn>
            <span className="rte-sep" />
          </>
        )}
        <Btn title="Add link" onClick={addLink}>🔗 Link</Btn>
        {mode === "visual" && <Btn title="Remove link" onClick={() => exec("unlink")}>Unlink</Btn>}
        <Btn title="Insert photo from your computer" onClick={() => openPicker(imageInputRef)} disabled={busy}>🖼 Photo</Btn>
        <Btn title="Attach PDF / Word / Excel file" onClick={() => openPicker(fileInputRef)} disabled={busy}>📎 File</Btn>
        <Btn title="Insert table" onClick={addTable}>▦ Table</Btn>
        {mode === "visual" && (
          <>
            <span className="rte-sep" />
            <Btn title="Clear formatting" onClick={() => exec("removeFormat")}>Clear</Btn>
            <Btn title="Undo" onClick={() => exec("undo")}>↶</Btn>
            <Btn title="Redo" onClick={() => exec("redo")}>↷</Btn>
          </>
        )}
      </div>

      <input
        ref={imageInputRef}
        type="file"
        hidden
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={(e) => pickUpload(e, "image")}
      />
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,image/*"
        onChange={(e) => pickUpload(e, "file")}
      />

      {mode === "visual" ? (
        <div
          ref={editorRef}
          className="rte-area cms-content"
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          onBlur={() => {
            saveSelection();
            emit();
          }}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          onPaste={(e) => {
            // paste as plain text so Word / website styles do not mess up the page
            e.preventDefault();
            const text = e.clipboardData.getData("text/plain");
            document.execCommand("insertText", false, text);
          }}
          data-placeholder="Start typing the page content here…"
        />
      ) : (
        <textarea
          ref={textRef}
          className="rte-code"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="<h2>Heading</h2>&#10;<p>Write or paste your HTML here…</p>"
        />
      )}

      <p className="rte-help">
        {mode === "visual"
          ? "Tip: select text, then use the buttons above. Photos and files are uploaded to your server and placed where your cursor is."
          : "HTML code mode: scripts, forms and styles are removed automatically for safety when the page is shown."}
      </p>
    </div>
  );
}
