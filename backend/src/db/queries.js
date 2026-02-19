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
  `
};

module.exports = queries;
