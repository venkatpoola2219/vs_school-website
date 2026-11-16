# Ryan Group-inspired single-page school website

A React + Vite + Bootstrap frontend with a Node.js + Fastify + MySQL backend.
This is an original educational-site implementation inspired by the public layout of the reference site. It does not include Ryan Group's proprietary logo, photos, or exact copy; replace demo content and images with assets you own or are authorized to use.

## Requirements
- Node.js 20+
- MySQL 8+

## 1. Database
Run `backend/schema.sql` in MySQL Workbench or the MySQL command line.
The script creates the `school_website` database and `admission_enquiries` table.

## 2. Backend
```bash
cd backend
npm install
```
Copy `.env.example` to `.env` and update the MySQL username/password.
```bash
npm run dev
```
Backend runs at http://localhost:5000

## 3. Frontend
Open another terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL shown in the terminal (usually http://localhost:5173).

## API
- `GET /api/health` - backend status
- `POST /api/enquiries` - saves an admission enquiry to MySQL

## Notes
- The frontend works even if the backend is not running; only submitting the enquiry form requires the backend.
- Never put database credentials in React. Keep them in `backend/.env`.
- This is a starter project. Add server-side validation, rate limiting, spam protection, HTTPS, and a privacy notice before production use.
