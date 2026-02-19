const { listBookingsForStationBetween, createBooking, markExpiredNoShows, listOperatorUpcoming, listOperatorHistory } = require("../models/bookingModel");
const { listStations } = require("../models/stationModel");
const { getUtcNow, toIsoUtc, ceilToNextQuarterHour, addHours, addMinutes } = require("../utils/time");
const { buildSlotsForWindow } = require("../utils/capacity");
const db = require("../db");
const queries = require("../db/queries");

async function getSlotsForStation(req, res, next) {
  try {
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

    const stations = await new Promise((resolve, reject) => {
      db.get(queries.selectStationById, [stationId], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row || null);
      });
    });

    if (!stations) {
      res.status(404).json({
        error: {
          code: "STATION_NOT_FOUND",
          message: "Station not found"
        }
      });
      return;
    }

    const now = getUtcNow();
    const windowStart = ceilToNextQuarterHour(now);
    const windowEnd = addHours(windowStart, 24);

    const bookings = await listBookingsForStationBetween(
      stationId,
      toIsoUtc(windowStart),
      toIsoUtc(windowEnd)
    );

    const bookingsBySlot = {};
    bookings.forEach((booking) => {
      const key = booking.slot_start_utc;
      if (!bookingsBySlot[key]) {
        bookingsBySlot[key] = 0;
      }
      bookingsBySlot[key] += 1;
    });

    const hourSpan = 24;
    const slots = buildSlotsForWindow(stations.hourly_capacity, windowStart, hourSpan);

    const resultSlots = slots.map((slot) => {
      const key = toIsoUtc(slot.startUtc);
      const used = bookingsBySlot[key] || 0;
      const availableCapacity = Math.max(slot.maxCapacity - used, 0);

      return {
        startUtc: key,
        endUtc: toIsoUtc(slot.endUtc),
        availableCapacity,
        maxCapacity: slot.maxCapacity
      };
    });

    res.json({
      stationId,
      slots: resultSlots
    });
  } catch (err) {
    next(err);
  }
}

async function postBooking(req, res, next) {
  try {
    const { stationId, slotStartUtc } = req.body || {};

    if (!stationId || !slotStartUtc) {
      res.status(400).json({
        error: {
          code: "INVALID_INPUT",
          message: "stationId and slotStartUtc are required"
        }
      });
      return;
    }

    const parsedStationId = Number.parseInt(stationId, 10);
    if (Number.isNaN(parsedStationId)) {
      res.status(400).json({
        error: {
          code: "INVALID_INPUT",
          message: "stationId must be a number"
        }
      });
      return;
    }

    const operatorId = req.session.user.id;

    const station = await new Promise((resolve, reject) => {
      db.get(queries.selectStationById, [parsedStationId], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row || null);
      });
    });

    if (!station) {
      res.status(404).json({
        error: {
          code: "STATION_NOT_FOUND",
          message: "Station not found"
        }
      });
      return;
    }

    const now = getUtcNow();
    const slotStart = new Date(slotStartUtc);
    const slotEnd = addMinutes(slotStart, 15);
    const arrivalDeadline = addMinutes(slotEnd, 15);

    const windowStart = ceilToNextQuarterHour(now);
    const windowEnd = addHours(windowStart, 24);

    if (slotStart < windowStart || slotStart >= windowEnd) {
      res.status(400).json({
        error: {
          code: "OUT_OF_WINDOW",
          message: "Slot must be within the next 24 hours"
        }
      });
      return;
    }

    const bookings = await listBookingsForStationBetween(
      parsedStationId,
      toIsoUtc(windowStart),
      toIsoUtc(windowEnd)
    );

    const bookingsBySlot = {};
    bookings.forEach((booking) => {
      const key = booking.slot_start_utc;
      if (!bookingsBySlot[key]) {
        bookingsBySlot[key] = 0;
      }
      bookingsBySlot[key] += 1;
    });

    const slots = buildSlotsForWindow(station.hourly_capacity, windowStart, 24);
    const targetSlotKey = toIsoUtc(slotStart);
    const targetSlot = slots.find((slot) => toIsoUtc(slot.startUtc) === targetSlotKey);

    if (!targetSlot) {
      res.status(400).json({
        error: {
          code: "INVALID_SLOT",
          message: "Slot does not align to a 15 minute boundary"
        }
      });
      return;
    }

    const used = bookingsBySlot[targetSlotKey] || 0;
    if (used >= targetSlot.maxCapacity) {
      res.status(409).json({
        error: {
          code: "SLOT_FULL",
          message: "Selected slot is fully booked"
        }
      });
      return;
    }

    const booking = await createBooking(
      parsedStationId,
      operatorId,
      toIsoUtc(slotStart),
      toIsoUtc(slotEnd),
      toIsoUtc(arrivalDeadline)
    );

    res.status(201).json({
      booking
    });
  } catch (err) {
    next(err);
  }
}

async function getOperatorBookings(req, res, next) {
  try {
    const operatorId = req.session.user.id;
    const now = getUtcNow();
    const nowIso = toIsoUtc(now);

    await markExpiredNoShows(nowIso);

    const upcoming = await listOperatorUpcoming(operatorId, nowIso);
    const history = await listOperatorHistory(operatorId, nowIso);

    res.json({
      upcoming,
      history
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSlotsForStation,
  postBooking,
  getOperatorBookings
};

