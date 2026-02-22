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

async function insertBooking(
  stationId,
  operatorId,
  slotStart,
  slotEnd,
  deadline,
  status = "CONFIRMED"
) {
  const result = await run(
    "INSERT INTO bookings (station_id, operator_id, slot_start_utc, slot_end_utc, arrival_deadline_utc, status) VALUES (?, ?, ?, ?, ?, ?)",
    [
      stationId,
      operatorId,
      toIso(slotStart),
      toIso(slotEnd),
      toIso(deadline),
      status
    ]
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

  const regionalManager = await ensureUser({
    name: "Regional Manager",
    email: "regional.manager@voltreserve.local",
    password: "Manager123!",
    role: "MANAGER"
  });

  const operatorBeta = await ensureUser({
    name: "Fleet Operator Beta",
    email: "operator.beta@voltreserve.local",
    password: "Operator123!",
    role: "OPERATOR"
  });

  const operatorGamma = await ensureUser({
    name: "Fleet Operator Gamma",
    email: "operator.gamma@voltreserve.local",
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

  const northYard = await createStationIfMissing(
    "North Yard",
    "Northern Distribution Yard",
    1.5
  );

  const airportHub = await createStationIfMissing(
    "Airport Hub",
    "Airport Cargo Terminal",
    4
  );

  await run(queries.insertStationManagerAssignment, [
    centralHub.id,
    manager.id
  ]);
  await run(queries.insertStationManagerAssignment, [eastDepot.id, manager.id]);
  await run(queries.insertStationManagerAssignment, [northYard.id, regionalManager.id]);
  await run(queries.insertStationManagerAssignment, [airportHub.id, regionalManager.id]);

  const now = new Date();
  const base = ceilToNextQuarter(now);
  const hourMs = 60 * 60 * 1000;
  const quarterMs = 15 * 60 * 1000;

  const pastStartOne = new Date(base.getTime() - 6 * hourMs);
  const pastEndOne = new Date(pastStartOne.getTime() + quarterMs);
  const pastDeadlineOne = new Date(pastEndOne.getTime() + quarterMs);

  const pastStartTwo = new Date(base.getTime() - 24 * hourMs);
  const pastEndTwo = new Date(pastStartTwo.getTime() + quarterMs);
  const pastDeadlineTwo = new Date(pastEndTwo.getTime() + quarterMs);

  const pastStartNoShow = new Date(base.getTime() - 3 * hourMs);
  const pastEndNoShow = new Date(pastStartNoShow.getTime() + quarterMs);
  const pastDeadlineNoShow = new Date(pastEndNoShow.getTime() + quarterMs);

  await insertBooking(
    centralHub.id,
    operator.id,
    pastStartOne,
    pastEndOne,
    pastDeadlineOne,
    "COMPLETED"
  );

  await insertBooking(
    eastDepot.id,
    operator.id,
    pastStartTwo,
    pastEndTwo,
    pastDeadlineTwo,
    "COMPLETED"
  );

  await insertBooking(
    eastDepot.id,
    operator.id,
    pastStartNoShow,
    pastEndNoShow,
    pastDeadlineNoShow,
    "NO_SHOW"
  );

  const futureStartCancelableOne = new Date(base.getTime() + 2 * hourMs);
  const futureEndCancelableOne = new Date(
    futureStartCancelableOne.getTime() + quarterMs
  );
  const futureDeadlineCancelableOne = new Date(
    futureEndCancelableOne.getTime() + quarterMs
  );

  const futureStartCancelableTwo = new Date(base.getTime() + 3 * hourMs);
  const futureEndCancelableTwo = new Date(
    futureStartCancelableTwo.getTime() + quarterMs
  );
  const futureDeadlineCancelableTwo = new Date(
    futureEndCancelableTwo.getTime() + quarterMs
  );

  const futureStartTight = new Date(base.getTime() + 30 * 60 * 1000);
  const futureEndTight = new Date(futureStartTight.getTime() + quarterMs);
  const futureDeadlineTight = new Date(futureEndTight.getTime() + quarterMs);

  await insertBooking(
    centralHub.id,
    operator.id,
    futureStartCancelableOne,
    futureEndCancelableOne,
    futureDeadlineCancelableOne,
    "CONFIRMED"
  );

  await insertBooking(
    eastDepot.id,
    operator.id,
    futureStartCancelableTwo,
    futureEndCancelableTwo,
    futureDeadlineCancelableTwo,
    "CONFIRMED"
  );

  await insertBooking(
    centralHub.id,
    operator.id,
    futureStartTight,
    futureEndTight,
    futureDeadlineTight,
    "CONFIRMED"
  );

  const futureStartBeta = new Date(base.getTime() + 4 * hourMs);
  const futureEndBeta = new Date(futureStartBeta.getTime() + quarterMs);
  const futureDeadlineBeta = new Date(futureEndBeta.getTime() + quarterMs);

  await insertBooking(
    northYard.id,
    operatorBeta.id,
    futureStartBeta,
    futureEndBeta,
    futureDeadlineBeta,
    "CONFIRMED"
  );

  const pastStartGamma = new Date(base.getTime() - 5 * hourMs);
  const pastEndGamma = new Date(pastStartGamma.getTime() + quarterMs);
  const pastDeadlineGamma = new Date(pastEndGamma.getTime() + quarterMs);

  await insertBooking(
    airportHub.id,
    operatorGamma.id,
    pastStartGamma,
    pastEndGamma,
    pastDeadlineGamma,
    "CANCELLED"
  );
}

module.exports = seedDemo;

seedDemo()
  .then(() => {
    console.log("Demo data seeded.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to seed demo data", err);
    process.exit(1);
  });
