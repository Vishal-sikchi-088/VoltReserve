const express = require("express");
const {
  getStations,
  postStation,
  postAssignManager,
  getUsers,
  postUser,
  putUser,
  deleteUser,
  getManagers,
  getStationAssignments,
  deleteStationManagerAssignment
} = require("../controllers/adminController");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(requireRole("ADMIN"));

router.get("/stations", getStations);
router.post("/stations", postStation);
router.get("/stations/assignments", getStationAssignments);
router.post("/stations/assign-manager", postAssignManager);
router.delete(
  "/stations/:stationId/managers/:managerId",
  deleteStationManagerAssignment
);

router.get("/users", getUsers);
router.post("/users", postUser);
router.put("/users/:userId", putUser);
router.delete("/users/:userId", deleteUser);

router.get("/managers", getManagers);

module.exports = router;
