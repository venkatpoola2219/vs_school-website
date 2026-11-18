require("dotenv").config();
const Fastify = require("fastify");
const cors = require("@fastify/cors");
const multipart = require("@fastify/multipart");
const db = require("./db");
const { registerCms, ensureAdmin } = require("./cms");

const app = Fastify({ logger: true });

async function start() {
  await app.register(cors, {
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    // PUT and DELETE are needed by the admin panel (edit / delete). The cors
    // plugin only allows GET, HEAD and POST unless methods are listed.
    methods: ["GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS"]
  });
  await app.register(multipart);
  await registerCms(app);

  app.get("/api/health", async () => ({ status: "ok", message: "Fastify API is running" }));

  /* ---------- School finder ---------- */

  // All boards
  app.get("/api/boards", async (request, reply) => {
    try {
      const [rows] = await db.execute(
        "SELECT name, slug FROM boards ORDER BY name"
      );
      return rows;
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ message: "Unable to load boards." });
    }
  });

  // Cities that have schools for a board: /api/cities?board=cbse
  app.get("/api/cities", async (request, reply) => {
    const { board } = request.query;
    if (!board) {
      return reply.code(400).send({ message: "board is required." });
    }

    try {
      const [rows] = await db.execute(
        `SELECT DISTINCT c.name, c.slug
           FROM cities c
           JOIN schools s ON s.city_id = c.id
           JOIN boards b ON b.id = s.board_id
          WHERE b.slug = ?
          ORDER BY c.name`,
        [board]
      );
      return rows;
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ message: "Unable to load cities." });
    }
  });

  // Schools for board + city: /api/schools?board=cbse&city=hyderabad
  app.get("/api/schools", async (request, reply) => {
    const { board, city } = request.query;
    if (!board || !city) {
      return reply.code(400).send({ message: "board and city are required." });
    }

    try {
      const [rows] = await db.execute(
        `SELECT s.name, s.slug, s.url
           FROM schools s
           JOIN boards b ON b.id = s.board_id
           JOIN cities c ON c.id = s.city_id
          WHERE b.slug = ? AND c.slug = ?
          ORDER BY s.name`,
        [board, city]
      );
      return rows;
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ message: "Unable to load schools." });
    }
  });

  // One school, for the page opened from /boardname/cityname/schoolname
  app.get("/api/schools/:board/:city/:school", async (request, reply) => {
    const { board, city, school } = request.params;

    try {
      const [rows] = await db.execute(
        `SELECT s.id, s.name, s.slug, b.name AS board, c.name AS city
           FROM schools s
           JOIN boards b ON b.id = s.board_id
           JOIN cities c ON c.id = s.city_id
          WHERE b.slug = ? AND c.slug = ? AND s.slug = ?`,
        [board, city, school]
      );
      if (rows.length === 0) {
        return reply.code(404).send({ message: "School not found." });
      }

      // Design + content written in the admin panel (null = show the default page)
      let profile = null;
      try {
        const [profiles] = await db.execute(
          "SELECT template, data FROM cms_school_profiles WHERE school_id = ?",
          [rows[0].id]
        );
        if (profiles.length) {
          profile = { template: profiles[0].template, data: JSON.parse(profiles[0].data || "{}") };
        }
      } catch (profileError) {
        request.log.warn(profileError, "School profile not available");
      }

      const { id, ...schoolInfo } = rows[0];
      return { ...schoolInfo, profile };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ message: "Unable to load school." });
    }
  });

  /* ---------- Enquiries (your existing code) ---------- */

  app.post("/api/enquiries", async (request, reply) => {
    const { parentName, email, phone, city, grade, message = "" } = request.body || {};
    if (![parentName, email, phone, city, grade].every(v => typeof v === "string" && v.trim())) {
      return reply.code(400).send({ message: "Please complete all required fields." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return reply.code(400).send({ message: "Please enter a valid email address." });
    }

    try {
      const [result] = await db.execute(
        `INSERT INTO admission_enquiries
         (parent_name, email, phone, city, grade, message)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [parentName.trim(), email.trim(), phone.trim(), city.trim(), grade.trim(), String(message).trim()]
      );
      return reply.code(201).send({ message: "Enquiry submitted successfully.", id: result.insertId });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ message: "Unable to save your enquiry. Please try again later." });
    }
  });

  try { await ensureAdmin(); } catch (error) { app.log.error(error, "Unable to create initial admin account. Check cms-schema.sql and ADMIN_USERNAME/ADMIN_PASSWORD."); }

  const port = Number(process.env.PORT || 5000);
  try {
    await app.listen({ port, host: "0.0.0.0" });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();