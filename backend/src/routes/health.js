const express = require("express");
const db = require("../db");
const queries = require("../db/queries");

const router = express.Router();

router.get("/", (req, res) => {
  db.get(queries.healthCheck, [], (err) => {
    const dbStatus = err ? "unhealthy" : "ok";
    const status = dbStatus === "ok" ? "ok" : "degraded";
    const code = dbStatus === "ok" ? 200 : 503;

    res.status(code).json({
      status,
      timestamp: new Date().toISOString(),
      components: {
        db: dbStatus
      }
    });
  });
});

module.exports = router;
