const bcrypt = require("bcrypt");
const { findUserByEmail } = require("../models/userModel");

async function login(req, res, next) {
  try {
    const { email, password, selectedRole } = req.body || {};

    if (!email || !password || !selectedRole) {
      res.status(400).json({
        error: {
          code: "INVALID_INPUT",
          message: "Email, password and selected role are required"
        }
      });
      return;
    }

    const allowedRoles = ["ADMIN", "MANAGER", "OPERATOR"];
    if (!allowedRoles.includes(selectedRole)) {
      res.status(400).json({
        error: {
          code: "INVALID_ROLE",
          message: "Selected role must be one of ADMIN, MANAGER or OPERATOR"
        }
      });
      return;
    }

    const user = await findUserByEmail(email);
    if (!user) {
      res.status(401).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password"
        }
      });
      return;
    }

    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
      res.status(401).json({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password"
        }
      });
      return;
    }

    if (user.role !== selectedRole) {
      res.status(403).json({
        error: {
          code: "ROLE_MISMATCH",
          message: `Selected role ${selectedRole} does not match your account role ${user.role}`
        }
      });
      return;
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.json({
      user: req.session.user
    });
  } catch (err) {
    next(err);
  }
}

function logout(req, res, next) {
  req.session.destroy((err) => {
    if (err) {
      next(err);
      return;
    }

    res.clearCookie("connect.sid");
    res.status(204).end();
  });
}

function me(req, res) {
  if (!req.session || !req.session.user) {
    res.status(401).json({
      error: {
        code: "UNAUTHENTICATED",
        message: "User is not authenticated"
      }
    });
    return;
  }

  res.json({
    user: req.session.user
  });
}

module.exports = {
  login,
  logout,
  me
};
