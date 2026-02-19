const { listStationsForManager } = require("../models/stationModel");
const db = require("../db");
const queries = require("../db/queries");
const { getUtcNow, toIsoUtc } = require("../utils/time");

async function getAssignedStations(req, res, next) {
  try {
    const managerId = req.session.user.id;
    const stations = await listStationsForManager(managerId);
    res.json({
      stations
    });
  } catch (err) {
    next(err);
  }
}

async function getStationBookings(req, res, next) {
  try {
    const managerId = req.session.user.id;
    const stationId = Number.parseInt(req.params.stationId, 10);

    if (Number.isNaN(stationId)) {
      res.status(400).json({
        error: {
          code: "INVALID_INPUT",
          message: "stationId must be a number"
        }
      });
      return;
    }

    const assignment = await new Promise((resolve, reject) => {
      db.get(
        queries.selectManagerAssignmentForStation,
        [stationId, managerId],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row || null);
        }
      );
    });

    if (!assignment) {
      res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "You are not assigned to this station"
        }
      });
      return;
    }

    const now = getUtcNow();
    const bookings = await new Promise((resolve, reject) => {
      db.all(
        queries.selectUpcomingBookingsForStation,
        [stationId, toIsoUtc(now)],
        (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows || []);
        }
      );
    });

    res.json({
      stationId,
      bookings
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAssignedStations,
  getStationBookings
};
