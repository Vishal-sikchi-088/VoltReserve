const { listStationsForManager } = require("../models/stationModel");

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

module.exports = {
  getAssignedStations
};

