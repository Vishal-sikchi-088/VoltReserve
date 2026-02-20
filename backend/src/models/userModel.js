const db = require("../db");
const queries = require("../db/queries");

function findUserByEmail(email) {
  return new Promise((resolve, reject) => {
    db.get(queries.findUserByEmail, [email], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row || null);
    });
  });
}

function countAdmins() {
  return new Promise((resolve, reject) => {
    db.get(queries.countAdmins, [], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row ? row.count : 0);
    });
  });
}

function createUser(name, email, passwordHash, role) {
  return new Promise((resolve, reject) => {
    db.run(
      queries.insertUser,
      [name, email, passwordHash, role],
      function onResult(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({
          id: this.lastID,
          name,
          email,
          role
        });
      }
    );
  });
}

function listUsers() {
  return new Promise((resolve, reject) => {
    db.all(queries.selectAllUsers, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows || []);
    });
  });
}

function findUserById(id) {
  return new Promise((resolve, reject) => {
    db.get(queries.selectUserById, [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row || null);
    });
  });
}

function updateUser(id, name, email, role) {
  return new Promise((resolve, reject) => {
    db.run(queries.updateUser, [name, email, role, id], function onResult(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.changes || 0);
    });
  });
}

function deleteUser(id) {
  return new Promise((resolve, reject) => {
    db.run(queries.deleteUser, [id], function onResult(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.changes || 0);
    });
  });
}

function listManagers() {
  return new Promise((resolve, reject) => {
    db.all(queries.selectManagers, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows || []);
    });
  });
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  countAdmins,
  listUsers,
  updateUser,
  deleteUser,
  listManagers
};
