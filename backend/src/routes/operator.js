const express = require("express");
const { getStations } = require("../controllers/operatorController");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(requireRole("OPERATOR"));

router.get("/stations", getStations);

module.exports = router;

