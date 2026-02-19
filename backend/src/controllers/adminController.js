const { listStations, createStation, assignManagerToStation } = require("../models/stationModel");
const { findUserByEmail } = require("../models/userModel");

async function getStations(req, res, next) {
  try {
    const stations = await listStations();
    res.json({
      stations
    });
  } catch (err) {
    next(err);
  }
}

async function postStation(req, res, next) {
  try {
    const { name, location, hourly_capacity } = req.body || {};

    if (!name || !location || typeof hourly_capacity !== "number") {
      res.status(400).json({
        error: {
          code: "INVALID_INPUT",
          message: "Name, location and numeric hourly_capacity are required"
        }
      });
      return;
    }

    const station = await createStation(name, location, hourly_capacity);

    res.status(201).json({
      station
    });
  } catch (err) {
    next(err);
  }
}

async function postAssignManager(req, res, next) {
  try {
    const { stationId, managerEmail } = req.body || {};

    if (!stationId || !managerEmail) {
      res.status(400).json({
        error: {
          code: "INVALID_INPUT",
          message: "stationId and managerEmail are required"
        }
      });
      return;
    }

    const manager = await findUserByEmail(managerEmail);
    if (!manager || manager.role !== "MANAGER") {
      res.status(400).json({
        error: {
          code: "INVALID_MANAGER",
          message: "Manager with given email not found or not a manager"
        }
      });
      return;
    }

    await assignManagerToStation(stationId, manager.id);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStations,
  postStation,
  postAssignManager
};

