const express = require("express");
const { getAssignedStations, getStationBookings } = require("../controllers/managerController");
const { getSlotsForStation } = require("../controllers/bookingController");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(requireRole("MANAGER"));

router.get("/stations", getAssignedStations);
router.get("/stations/:stationId/slots", getSlotsForStation);
router.get("/stations/:stationId/bookings", getStationBookings);

module.exports = router;
