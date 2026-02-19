const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const queries = require("./queries");

const dbFilePath = process.env.DB_FILE || path.join(__dirname, "..", "..", "data", "database.sqlite");

const db = new sqlite3.Database(dbFilePath);

function runMigrations() {
  db.serialize(() => {
    db.run(queries.createUsersTable);
    db.run(queries.createStationsTable);
    db.run(queries.createStationManagerAssignmentsTable);
    db.run(queries.createBookingsTable);
  });
}

runMigrations();

module.exports = db;

