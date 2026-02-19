const express = require("express");
const { getAssignedStations } = require("../controllers/managerController");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(requireRole("MANAGER"));

router.get("/stations", getAssignedStations);

module.exports = router;

