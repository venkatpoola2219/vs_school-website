# Multi-page website and admin page management

## What changed
- Each website section has its own route and page content (for example `/about/vision`, `/academics/curriculum`, `/admissions/enquire`).
- Navigation uses React Router links, so moving between pages stays inside the React single-page application.
- The existing CMS pages API and MySQL `cms_pages` table are used for the public page content.
- On the first successful admin load, the frontend creates starter page and navigation records through the existing admin CMS API. Hidden system markers prevent deleted starter pages or menu items from being automatically recreated on later logins.
- The Admin Panel Pages tab can create, edit, publish/unpublish, preview and delete pages. Deleting a page removes its CMS record; an unpublished or deleted page is not shown publicly.
- The Menus tab starts with the current website navigation and lets the admin add, edit or delete menu links. Set a URL to `/section/slug` for a starter page or `/page/slug` for a custom page.

## Backend and database
The backend source files and SQL schema are unchanged. Existing Fastify endpoints and the existing MySQL database are reused. No database drop, reset, migration or table recreation is part of this update. Keep your current `backend/.env` and database as they are.

## Run locally
1. Open a terminal in `frontend` and run `npm install`.
2. Start the frontend with `npm run dev`.
3. Open another terminal in `backend` and run `npm install` if dependencies are not installed.
4. Start the backend using the script already defined in `backend/package.json`.
5. Sign in at `/admin`. The starter pages are added to the existing CMS table on the first successful admin load.

Back up your project and database before applying any update. Do not run schema reset commands against your existing database.
