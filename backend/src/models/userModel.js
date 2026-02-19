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

module.exports = {
  findUserByEmail,
  createUser,
  countAdmins
};

