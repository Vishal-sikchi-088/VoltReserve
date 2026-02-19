const express = require("express");
const { getAssignedStations } = require("../controllers/managerController");
const { getSlotsForStation } = require("../controllers/bookingController");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(requireRole("MANAGER"));

router.get("/stations", getAssignedStations);
router.get("/stations/:stationId/slots", getSlotsForStation);

module.exports = router;
