const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const queries = require("./queries");

const dbFilePath =
  process.env.DB_FILE || path.join(__dirname, "..", "..", "data", "database.sqlite");

const db = new sqlite3.Database(dbFilePath);

function runMigrations() {
  db.serialize(() => {
    db.run(queries.createUsersTable);
    db.run(queries.createStationsTable);
    db.run(queries.createStationManagerAssignmentsTable);
    db.run(queries.createBookingsTable);
  });
}

function seedAdmin() {
  const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@voltreserve.local";
  const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "Admin123!";

  db.get(queries.countAdmins, [], (err, row) => {
    if (err) {
      console.error("Failed to count admins", err);
      return;
    }

    const adminCount = row ? row.count : 0;
    if (adminCount > 0) {
      return;
    }

    bcrypt
      .hash(defaultAdminPassword, 10)
      .then((hash) => {
        db.run(
          queries.insertUser,
          ["Admin", defaultAdminEmail, hash, "ADMIN"],
          (insertErr) => {
            if (insertErr) {
              console.error("Failed to seed default admin", insertErr);
            }
          }
        );
      })
      .catch((hashErr) => {
        console.error("Failed to hash default admin password", hashErr);
      });
  });
}

runMigrations();
seedAdmin();

module.exports = db;
