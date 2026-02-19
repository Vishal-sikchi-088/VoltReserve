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
  `
};

module.exports = queries;

