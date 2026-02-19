const db = require("../db");
const queries = require("../db/queries");

function listBookingsForStationBetween(stationId, fromIso, toIso) {
  return new Promise((resolve, reject) => {
    db.all(
      queries.selectBookingsForStationBetween,
      [stationId, fromIso, toIso],
      (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows || []);
      }
    );
  });
}

function createBooking(stationId, operatorId, slotStartIso, slotEndIso, arrivalDeadlineIso) {
  return new Promise((resolve, reject) => {
    db.run(
      queries.insertBooking,
      [stationId, operatorId, slotStartIso, slotEndIso, arrivalDeadlineIso],
      function onResult(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({
          id: this.lastID,
          station_id: stationId,
          operator_id: operatorId,
          slot_start_utc: slotStartIso,
          slot_end_utc: slotEndIso,
          arrival_deadline_utc: arrivalDeadlineIso,
          status: "CONFIRMED"
        });
      }
    );
  });
}

function markExpiredNoShows(nowIso) {
  return new Promise((resolve, reject) => {
    db.run(queries.markExpiredNoShows, [nowIso], function onResult(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function listOperatorUpcoming(operatorId, fromIso) {
  return new Promise((resolve, reject) => {
    db.all(
      queries.selectOperatorBookingsUpcoming,
      [operatorId, fromIso],
      (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows || []);
      }
    );
  });
}

function listOperatorHistory(operatorId, beforeIso) {
  return new Promise((resolve, reject) => {
    db.all(
      queries.selectOperatorBookingsHistory,
      [operatorId, beforeIso],
      (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows || []);
      }
    );
  });
}

module.exports = {
  listBookingsForStationBetween,
  createBooking,
  markExpiredNoShows,
  listOperatorUpcoming,
  listOperatorHistory
};

