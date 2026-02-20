const {
  listStations,
  createStation,
  assignManagerToStation,
  listStationManagerAssignments,
  deleteStationManagerAssignment
} = require("../models/stationModel");
const {
  findUserByEmail,
  findUserById,
  createUser,
  countAdmins,
  listUsers,
  updateUser,
  deleteUser,
  listManagers
} = require("../models/userModel");
const db = require("../db");
const queries = require("../db/queries");
const bcrypt = require("bcrypt");

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

async function postStation(req, res, next) {
  try {
    const { name, location, hourly_capacity } = req.body || {};

    if (!name || !location || typeof hourly_capacity !== "number") {
      res.status(400).json({
        error: {
          code: "INVALID_INPUT",
          message: "Name, location and numeric hourly_capacity are required"
        }
      });
      return;
    }

    const station = await createStation(name, location, hourly_capacity);

    res.status(201).json({
      station
    });
  } catch (err) {
    next(err);
  }
}

async function postAssignManager(req, res, next) {
  try {
    const { stationId, managerEmail, managerId } = req.body || {};

    if (!stationId || (!managerEmail && !managerId)) {
      res.status(400).json({
        error: {
          code: "INVALID_INPUT",
          message: "stationId and managerEmail or managerId are required"
        }
      });
      return;
    }

    let manager = null;
    if (managerId) {
      manager = await findUserById(managerId);
    } else if (managerEmail) {
      manager = await findUserByEmail(managerEmail);
    }

    if (!manager || manager.role !== "MANAGER") {
      res.status(400).json({
        error: {
          code: "INVALID_MANAGER",
          message: "Manager with given email not found or not a manager"
        }
      });
      return;
    }

    await assignManagerToStation(stationId, manager.id);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

async function getUsers(req, res, next) {
  try {
    const users = await listUsers();
    res.json({
      users
    });
  } catch (err) {
    next(err);
  }
}

async function postUser(req, res, next) {
  try {
    const { name, email, password, role } = req.body || {};

    if (!name || !email || !password || !role) {
      res.status(400).json({
        error: {
          code: "INVALID_INPUT",
          message: "name, email, password and role are required"
        }
      });
      return;
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedName = String(name).trim();

    if (!trimmedName || !trimmedEmail) {
      res.status(400).json({
        error: {
          code: "INVALID_INPUT",
          message: "Valid name and email are required"
        }
      });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      res.status(400).json({
        error: {
          code: "INVALID_EMAIL",
          message: "Email must be a valid email address"
        }
      });
      return;
    }

    const hasMinLength = typeof password === "string" && password.length >= 8;
    const hasUpper = typeof password === "string" && /[A-Z]/.test(password);
    const hasLower = typeof password === "string" && /[a-z]/.test(password);
    const hasNumber = typeof password === "string" && /[0-9]/.test(password);
    const hasSymbol =
      typeof password === "string" && /[^A-Za-z0-9]/.test(password);
    if (!(hasMinLength && hasUpper && hasLower && hasNumber && hasSymbol)) {
      res.status(400).json({
        error: {
          code: "WEAK_PASSWORD",
          message:
            "Password must be at least 8 characters with upper, lower, number and symbol"
        }
      });
      return;
    }

    const allowedRoles = ["ADMIN", "MANAGER", "OPERATOR"];
    if (!allowedRoles.includes(role)) {
      res.status(400).json({
        error: {
          code: "INVALID_ROLE",
          message: "Role must be one of ADMIN, MANAGER or OPERATOR"
        }
      });
      return;
    }

    const existing = await findUserByEmail(trimmedEmail);
    if (existing) {
      res.status(409).json({
        error: {
          code: "EMAIL_IN_USE",
          message: "A user with this email already exists"
        }
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser(trimmedName, trimmedEmail, passwordHash, role);

    res.status(201).json({
      user
    });
  } catch (err) {
    next(err);
  }
}

async function putUser(req, res, next) {
  try {
    const userId = Number.parseInt(req.params.userId, 10);
    const { name, email, role } = req.body || {};

    if (Number.isNaN(userId)) {
      res.status(400).json({
        error: {
          code: "INVALID_INPUT",
          message: "userId must be a number"
        }
      });
      return;
    }

    if (!name || !email || !role) {
      res.status(400).json({
        error: {
          code: "INVALID_INPUT",
          message: "name, email and role are required"
        }
      });
      return;
    }

    const existing = await findUserById(userId);
    if (!existing) {
      res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "User not found"
        }
      });
      return;
    }

    const allowedRoles = ["ADMIN", "MANAGER", "OPERATOR"];
    if (!allowedRoles.includes(role)) {
      res.status(400).json({
        error: {
          code: "INVALID_ROLE",
          message: "Role must be one of ADMIN, MANAGER or OPERATOR"
        }
      });
      return;
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedName = String(name).trim();

    if (!trimmedName || !trimmedEmail) {
      res.status(400).json({
        error: {
          code: "INVALID_INPUT",
          message: "Valid name and email are required"
        }
      });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      res.status(400).json({
        error: {
          code: "INVALID_EMAIL",
          message: "Email must be a valid email address"
        }
      });
      return;
    }

    const emailOwner = await findUserByEmail(trimmedEmail);
    if (emailOwner && emailOwner.id !== userId) {
      res.status(409).json({
        error: {
          code: "EMAIL_IN_USE",
          message: "A user with this email already exists"
        }
      });
      return;
    }

    if (existing.role === "ADMIN" && role !== "ADMIN") {
      const adminCount = await countAdmins();
      if (adminCount <= 1) {
        res.status(400).json({
          error: {
            code: "LAST_ADMIN_PROTECTED",
            message: "Cannot change role of the last admin"
          }
        });
        return;
      }
    }

    const changes = await updateUser(
      userId,
      trimmedName,
      trimmedEmail,
      role
    );

    if (changes === 0) {
      res.status(500).json({
        error: {
          code: "UPDATE_FAILED",
          message: "User update failed"
        }
      });
      return;
    }

    const updated = await findUserById(userId);

    res.json({
      user: updated
    });
  } catch (err) {
    next(err);
  }
}

async function deleteUserHandler(req, res, next) {
  try {
    const userId = Number.parseInt(req.params.userId, 10);

    if (Number.isNaN(userId)) {
      res.status(400).json({
        error: {
          code: "INVALID_INPUT",
          message: "userId must be a number"
        }
      });
      return;
    }

    const existing = await findUserById(userId);
    if (!existing) {
      res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "User not found"
        }
      });
      return;
    }

    if (existing.role === "ADMIN") {
      const adminCount = await countAdmins();
      if (adminCount <= 1) {
        res.status(400).json({
          error: {
            code: "LAST_ADMIN_PROTECTED",
            message: "Cannot delete the last admin"
          }
        });
        return;
      }
    }

    await new Promise((resolve, reject) => {
      db.run(
        queries.deleteAssignmentsForManager,
        [userId],
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        }
      );
    });

    const changes = await deleteUser(userId);

    if (changes === 0) {
      res.status(500).json({
        error: {
          code: "DELETE_FAILED",
          message: "User delete failed"
        }
      });
      return;
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

async function getManagers(req, res, next) {
  try {
    const managers = await listManagers();
    res.json({
      managers
    });
  } catch (err) {
    next(err);
  }
}

async function getStationAssignments(req, res, next) {
  try {
    const assignments = await listStationManagerAssignments();
    res.json({
      assignments
    });
  } catch (err) {
    next(err);
  }
}

async function deleteStationManagerAssignmentHandler(req, res, next) {
  try {
    const stationId = Number.parseInt(req.params.stationId, 10);
    const managerId = Number.parseInt(req.params.managerId, 10);

    if (Number.isNaN(stationId) || Number.isNaN(managerId)) {
      res.status(400).json({
        error: {
          code: "INVALID_INPUT",
          message: "stationId and managerId must be numbers"
        }
      });
      return;
    }

    const changes = await deleteStationManagerAssignment(stationId, managerId);

    if (changes === 0) {
      res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Assignment not found"
        }
      });
      return;
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStations,
  postStation,
  postAssignManager,
  getUsers,
  postUser,
  putUser,
  deleteUser: deleteUserHandler,
  getManagers,
  getStationAssignments,
  deleteStationManagerAssignment: deleteStationManagerAssignmentHandler
};
