const bcrypt = require("bcrypt");
const { findUserByEmail } = require("../models/userModel");

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      res.status(400).json({
        error: {
          code: "INVALID_INPUT",
          message: "Email and password are required"
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

