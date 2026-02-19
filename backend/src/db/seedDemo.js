const bcrypt = require("bcrypt");
const db = require("./index");
const queries = require("./queries");

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onResult(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row || null);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows || []);
    });
  });
}

function ceilToNextQuarter(date) {
  const copy = new Date(date.getTime());
  copy.setUTCSeconds(0, 0);
  const minutes = copy.getUTCMinutes();
  const quarters = Math.ceil(minutes / 15);
  const nextMinutes = quarters * 15;
  copy.setUTCMinutes(nextMinutes);
  return copy;
}

function toIso(date) {
  return date.toISOString();
}

async function ensureUser(options) {
  const existing = await get(queries.findUserByEmail, [options.email]);
  if (existing) {
    return existing;
  }
  const hash = await bcrypt.hash(options.password, 10);
  await run(queries.insertUser, [
    options.name,
    options.email,
    hash,
    options.role
  ]);
  const created = await get(queries.findUserByEmail, [options.email]);
  return created;
}

async function createStationIfMissing(name, location, hourlyCapacity) {
  const stations = await all(queries.selectAllStations, []);
  const existing = stations.find(
    (station) => station.name === name && station.location === location
  );
  if (existing) {
    return existing;
  }
  const result = await run(queries.insertStation, [
    name,
    location,
    hourlyCapacity
  ]);
  const station = await get(queries.selectStationById, [result.lastID]);
  return station;
}

async function insertBooking(stationId, operatorId, slotStart, slotEnd, deadline) {
  const result = await run(
    "INSERT INTO bookings (station_id, operator_id, slot_start_utc, slot_end_utc, arrival_deadline_utc, status) VALUES (?, ?, ?, ?, ?, 'CONFIRMED')",
    [stationId, operatorId, toIso(slotStart), toIso(slotEnd), toIso(deadline)]
  );
  return result.lastID;
}

async function seedDemo() {
  await run("DELETE FROM station_manager_assignments");
  await run("DELETE FROM bookings");
  await run("DELETE FROM swap_stations");

  const manager = await ensureUser({
    name: "Station Manager",
    email: "manager@voltreserve.local",
    password: "Manager123!",
    role: "MANAGER"
  });

  const operator = await ensureUser({
    name: "Fleet Operator",
    email: "operator@voltreserve.local",
    password: "Operator123!",
    role: "OPERATOR"
  });

  const centralHub = await createStationIfMissing(
    "Central Hub",
    "Downtown Logistics Park",
    2.5
  );

  const eastDepot = await createStationIfMissing(
    "East Depot",
    "Eastern Industrial Corridor",
    3
  );

  await run(queries.insertStationManagerAssignment, [
    centralHub.id,
    manager.id
  ]);
  await run(queries.insertStationManagerAssignment, [eastDepot.id, manager.id]);

  const now = new Date();
  const base = ceilToNextQuarter(now);

  const futureStartOne = new Date(base.getTime() + 2 * 60 * 60 * 1000);
  const futureEndOne = new Date(futureStartOne.getTime() + 15 * 60 * 1000);
  const futureDeadlineOne = new Date(futureEndOne.getTime() + 15 * 60 * 1000);

  const futureStartTwo = new Date(base.getTime() + 3 * 60 * 60 * 1000);
  const futureEndTwo = new Date(futureStartTwo.getTime() + 15 * 60 * 1000);
  const futureDeadlineTwo = new Date(futureEndTwo.getTime() + 15 * 60 * 1000);

  const pastStart = new Date(base.getTime() - 2 * 60 * 60 * 1000);
  const pastEnd = new Date(pastStart.getTime() + 15 * 60 * 1000);
  const pastDeadline = new Date(pastEnd.getTime() + 15 * 60 * 1000);

  const completedId = await insertBooking(
    centralHub.id,
    operator.id,
    pastStart,
    pastEnd,
    pastDeadline
  );

  await run("UPDATE bookings SET status = 'COMPLETED' WHERE id = ?", [
    completedId
  ]);

  await insertBooking(
    centralHub.id,
    operator.id,
    futureStartOne,
    futureEndOne,
    futureDeadlineOne
  );

  await insertBooking(
    eastDepot.id,
    operator.id,
    futureStartTwo,
    futureEndTwo,
    futureDeadlineTwo
  );
}

seedDemo()
  .then(() => {
    console.log("Demo data seeded.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to seed demo data", err);
    process.exit(1);
  });

