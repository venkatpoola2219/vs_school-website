# Admin Panel Setup

This adds a CMS-style admin panel to the existing React + Vite + Fastify + MySQL project. Existing school finder and admission enquiry API routes are retained.

## 1. Run the CMS database script once

Open MySQL Workbench, select your existing `school_website` database, and run the complete file:

`backend/cms-schema.sql`

Do not re-run your original `schema.sql` just for the admin panel. The CMS script only creates the additional CMS tables and default settings.

## 2. Configure the existing backend/.env

Keep your existing DB connection values unchanged. Add these three settings at the bottom of `backend/.env`:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Choose_A_Strong_Password
ADMIN_TOKEN_SECRET=Use_A_Long_Random_Secret_At_Least_32_Characters
```

Change the example password and secret before starting. Do not share the `.env` file or upload it publicly. The initial admin user is created automatically the first time the backend starts after the CMS tables exist. If that username already exists, its password is not overwritten by startup.

## 3. Install the new backend dependency

Open a terminal in the `backend` folder:

```bash
npm install
npm run dev
```

The new image upload route uses Fastify multipart. Uploaded images are stored in `backend/uploads/`; only their relative paths are stored in MySQL.

## 4. Start the frontend

Open another terminal in `frontend`:

```bash
npm install
npm run dev
```

## 5. Open the admin panel

Visit `http://localhost:5173/admin` and sign in using the username/password you added to `.env`.

## Features included

- Admin login with a signed, expiring token; passwords are stored using Node.js scrypt hashing.
- Logo and website name settings.
- Banner create, edit, delete, active/inactive, ordering and image upload. Active CMS banners replace the existing hard-coded hero slides on the public home page. If no CMS banners are active, the original hero images remain as fallback.
- CMS pages create, edit, publish/unpublish and delete. Published pages are available at `/page/<slug>`.
- Menu items create, edit, delete, active/inactive and grouping by parent menu. When at least one CMS menu item is active, the CMS menu replaces the default navigation menu.
- Existing school finder, admissions enquiry and other public pages/routes are retained.

## Important notes

- This is a local development implementation. Before production deployment, use HTTPS, rate limiting, login attempt protection, backups, stricter upload scanning and a secure secret manager.
- The page content editor currently accepts plain text (not arbitrary HTML), which avoids introducing stored cross-site scripting through the admin form.
- For CMS menu links to a CMS page, use `/page/your-page-slug`.
- Keep your existing `backend/.env`. It is intentionally not included in the updated ZIP.
