const { listStations } = require("../models/stationModel");

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

module.exports = {
  getStations
};

