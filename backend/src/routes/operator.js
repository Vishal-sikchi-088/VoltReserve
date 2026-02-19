const express = require("express");
const { getStations } = require("../controllers/operatorController");
const { getSlotsForStation, postBooking, getOperatorBookings } = require("../controllers/bookingController");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(requireRole("OPERATOR"));

router.get("/stations", getStations);
router.get("/stations/:stationId/slots", getSlotsForStation);
router.post("/bookings", postBooking);
router.get("/bookings", getOperatorBookings);

module.exports = router;
