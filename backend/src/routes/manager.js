const express = require("express");
const { getAssignedStations, getStationBookings, getStationStats, completeStationBooking } = require("../controllers/managerController");
const { getSlotsForStation } = require("../controllers/bookingController");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(requireRole("MANAGER"));

router.get("/stations", getAssignedStations);
router.get("/stations/:stationId/slots", getSlotsForStation);
router.get("/stations/:stationId/bookings", getStationBookings);
router.get("/stations/:stationId/stats", getStationStats);
router.post("/stations/:stationId/bookings/:bookingId/complete", completeStationBooking);

module.exports = router;
