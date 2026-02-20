const db = require("../db");
const queries = require("../db/queries");

function listStations() {
  return new Promise((resolve, reject) => {
    db.all(queries.selectAllStations, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows || []);
    });
  });
}

function createStation(name, location, hourlyCapacity) {
  return new Promise((resolve, reject) => {
    db.run(
      queries.insertStation,
      [name, location, hourlyCapacity],
      function onResult(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({
          id: this.lastID,
          name,
          location,
          hourly_capacity: hourlyCapacity
        });
      }
    );
  });
}

function assignManagerToStation(stationId, managerId) {
  return new Promise((resolve, reject) => {
    db.run(
      queries.insertStationManagerAssignment,
      [stationId, managerId],
      (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      }
    );
  });
}

function listStationManagerAssignments() {
  return new Promise((resolve, reject) => {
    db.all(
      queries.selectStationManagerAssignmentsDetailed,
      [],
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

function deleteStationManagerAssignment(stationId, managerId) {
  return new Promise((resolve, reject) => {
    db.run(
      queries.deleteStationManagerAssignment,
      [stationId, managerId],
      function onResult(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes || 0);
      }
    );
  });
}

function listStationsForManager(managerId) {
  return new Promise((resolve, reject) => {
    db.all(queries.selectStationsForManager, [managerId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows || []);
    });
  });
}

module.exports = {
  listStations,
  createStation,
  assignManagerToStation,
  listStationManagerAssignments,
  deleteStationManagerAssignment,
  listStationsForManager
};
