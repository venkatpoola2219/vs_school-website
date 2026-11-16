# Admin account features update

This update adds:
- The actual signed-in username in the top-right header.
- My Account screen to change the current admin password.
- Admin Users screen to create and list additional admin accounts, and delete another admin account.
- Protection against deleting the currently signed-in account or the final remaining admin.

## Apply the update
1. Back up your current project folder.
2. Extract this ZIP and copy/replace its `frontend/src/admin/AdminPanel.jsx` and `backend/cms.js` into your project, preserving your own `.env` file and database settings.
3. No new database table is required. The features use the existing `admin_users` table created by `backend/cms-schema.sql`.
4. Restart the backend (`npm run dev`) and frontend (`npm run dev`).
5. Open `/admin`, sign in, then use **My Account** to change your password or **Admin Users** to add another admin.

New admin passwords must be at least 8 characters. The new admin can sign in at the same `/admin` URL. Each admin should change their temporary password after the first login.
