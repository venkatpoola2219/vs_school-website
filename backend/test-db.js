
const db = require("./db");

async function testConnection() {
  try {
    const [rows] = await db.query("SHOW TABLES");

    console.log("Database connected successfully!");
    console.log("Tables:", rows);

    await db.end();
    process.exit(0);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

testConnection();
