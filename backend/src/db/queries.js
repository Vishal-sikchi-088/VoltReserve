const queries = {
  createUsersTable: `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,
  createStationsTable: `
    CREATE TABLE IF NOT EXISTS swap_stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      hourly_capacity REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,
  createStationManagerAssignmentsTable: `
    CREATE TABLE IF NOT EXISTS station_manager_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_id INTEGER NOT NULL,
      manager_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (station_id, manager_id),
      FOREIGN KEY (station_id) REFERENCES swap_stations(id),
      FOREIGN KEY (manager_id) REFERENCES users(id)
    );
  `,
  createBookingsTable: `
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_id INTEGER NOT NULL,
      operator_id INTEGER NOT NULL,
      slot_start_utc DATETIME NOT NULL,
      slot_end_utc DATETIME NOT NULL,
      arrival_deadline_utc DATETIME NOT NULL,
      status TEXT NOT NULL,
      cancellation_reason TEXT,
      rescheduled_from_booking_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (station_id) REFERENCES swap_stations(id),
      FOREIGN KEY (operator_id) REFERENCES users(id),
      FOREIGN KEY (rescheduled_from_booking_id) REFERENCES bookings(id)
    );
  `,
  findUserByEmail: `
    SELECT id, name, email, password_hash, role
    FROM users
    WHERE email = ?
    LIMIT 1;
  `,
  insertUser: `
    INSERT INTO users (name, email, password_hash, role)
    VALUES (?, ?, ?, ?);
  `,
  countAdmins: `
    SELECT COUNT(*) as count
    FROM users
    WHERE role = 'ADMIN';
  `,
  selectAllStations: `
    SELECT id, name, location, hourly_capacity, created_at, updated_at
    FROM swap_stations
    ORDER BY name ASC;
  `,
  insertStation: `
    INSERT INTO swap_stations (name, location, hourly_capacity)
    VALUES (?, ?, ?);
  `,
  insertStationManagerAssignment: `
    INSERT OR IGNORE INTO station_manager_assignments (station_id, manager_id)
    VALUES (?, ?);
  `,
  selectStationsForManager: `
    SELECT s.id, s.name, s.location, s.hourly_capacity, s.created_at, s.updated_at
    FROM swap_stations s
    INNER JOIN station_manager_assignments sma ON s.id = sma.station_id
    WHERE sma.manager_id = ?;
  `,
  selectStationById: `
    SELECT id, name, location, hourly_capacity, created_at, updated_at
    FROM swap_stations
    WHERE id = ?;
  `,
  selectBookingsForStationBetween: `
    SELECT station_id, slot_start_utc, status
    FROM bookings
    WHERE station_id = ?
      AND slot_start_utc >= ?
      AND slot_start_utc < ?
      AND status IN ('CONFIRMED', 'COMPLETED');
  `,
  selectUpcomingBookingsForStation: `
    SELECT
      b.id,
      b.station_id,
      b.operator_id,
      u.name as operator_name,
      b.slot_start_utc,
      b.slot_end_utc,
      b.status
    FROM bookings b
    INNER JOIN users u ON u.id = b.operator_id
    WHERE b.station_id = ?
      AND b.slot_start_utc >= ?
    ORDER BY b.slot_start_utc ASC;
  `,
  selectManagerAssignmentForStation: `
    SELECT 1 as exists
    FROM station_manager_assignments
    WHERE station_id = ?
      AND manager_id = ?
    LIMIT 1;
  `,
  insertBooking: `
    INSERT INTO bookings (
      station_id,
      operator_id,
      slot_start_utc,
      slot_end_utc,
      arrival_deadline_utc,
      status
    )
    VALUES (?, ?, ?, ?, ?, 'CONFIRMED');
  `,
  selectOperatorBookingsUpcoming: `
    SELECT
      b.id,
      b.station_id,
      s.name as station_name,
      s.location as station_location,
      b.operator_id,
      b.slot_start_utc,
      b.slot_end_utc,
      b.arrival_deadline_utc,
      b.status
    FROM bookings b
    INNER JOIN swap_stations s ON s.id = b.station_id
    WHERE b.operator_id = ?
      AND b.slot_start_utc >= ?
    ORDER BY b.slot_start_utc ASC;
  `,
  selectOperatorBookingsHistory: `
    SELECT
      b.id,
      b.station_id,
      s.name as station_name,
      s.location as station_location,
      b.operator_id,
      b.slot_start_utc,
      b.slot_end_utc,
      b.arrival_deadline_utc,
      b.status
    FROM bookings b
    INNER JOIN swap_stations s ON s.id = b.station_id
    WHERE b.operator_id = ?
      AND b.slot_start_utc < ?
    ORDER BY b.slot_start_utc DESC;
  `,
  markExpiredNoShows: `
    UPDATE bookings
    SET status = 'NO_SHOW'
    WHERE status = 'CONFIRMED'
      AND arrival_deadline_utc < ?;
  `,
  cancelOperatorBooking: `
    UPDATE bookings
    SET status = 'CANCELLED'
    WHERE id = ?
      AND operator_id = ?
      AND status = 'CONFIRMED'
      AND slot_start_utc > ?;
  `
};

module.exports = queries;
