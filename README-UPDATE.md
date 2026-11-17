# Update: header fix, page editor, photos & files

## What changed (and where)
| Change | File |
|---|---|
| Header dropdown stays open / two menus open at once | `frontend/src/components/Navbar.jsx`, `frontend/src/App.css` (search `.mega-menu`) |
| "We couldn't find this page" + admin save/delete not working (missing `/api` in URLs) | `frontend/src/pages/WebsiteDetailPage.jsx`, `frontend/src/admin/AdminPanel.jsx` |
| Visual editor + HTML code editor (photos, files, tables, links) | `frontend/src/components/RichTextEditor.jsx` |
| Pages now show HTML (safely) on the website | `frontend/src/components/CmsContent.jsx`, `frontend/src/utils/content.js`, `frontend/src/pages/CmsPage.jsx` |
| New page -> automatically added to header menu | `frontend/src/admin/AdminPanel.jsx` (Pages tab) |
| Upload PDF/Word/Excel/PPT/images (15 MB), CORS PUT/DELETE fix | `backend/cms.js`, `backend/server.js` |

## To run
```
cd frontend && npm install && npm run dev      # a new package (dompurify) was added
cd backend  && npm install && npm run dev
```
No database change is needed. Keep your own `backend/.env` (it is not included in this zip).

## Using it
Admin -> Pages -> Create page -> write content in the editor -> keep
"Show this page in the website header menu" ticked -> choose the header menu
(or create a new one) -> Create page.
