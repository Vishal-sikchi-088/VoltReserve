const express = require("express");
const { getStations, postStation, postAssignManager } = require("../controllers/adminController");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(requireRole("ADMIN"));

router.get("/stations", getStations);
router.post("/stations", postStation);
router.post("/stations/assign-manager", postAssignManager);

module.exports = router;

