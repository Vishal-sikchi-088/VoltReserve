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

async function getStationStats(req, res, next) {
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
    const windowEnd = now;
    const windowStart = new Date(windowEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

    const rows = await new Promise((resolve, reject) => {
      db.all(
        queries.selectStationBookingStatsForWindow,
        [stationId, toIsoUtc(windowStart), toIsoUtc(windowEnd)],
        (err, stats) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(stats || []);
        }
      );
    });

    const byStatus = {};
    let total = 0;
    rows.forEach((row) => {
      byStatus[row.status] = row.count;
      total += row.count;
    });

    const completed = byStatus.COMPLETED || 0;
    const noShow = byStatus.NO_SHOW || 0;
    const observed = completed + noShow;
    const noShowRate = observed === 0 ? 0 : noShow / observed;

    res.json({
      stationId,
      windowDays: 7,
      total,
      byStatus,
      noShowRate
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAssignedStations,
  getStationBookings,
  getStationStats
};
