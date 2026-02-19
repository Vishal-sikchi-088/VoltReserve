const express = require("express");
const { getStations } = require("../controllers/operatorController");
const { getSlotsForStation, postBooking, getOperatorBookings, deleteOperatorBooking } = require("../controllers/bookingController");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(requireRole("OPERATOR"));

router.get("/stations", getStations);
router.get("/stations/:stationId/slots", getSlotsForStation);
router.post("/bookings", postBooking);
router.get("/bookings", getOperatorBookings);
router.delete("/bookings/:bookingId", deleteOperatorBooking);

module.exports = router;
