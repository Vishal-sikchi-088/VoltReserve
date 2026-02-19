function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    res.status(401).json({
      error: {
        code: "UNAUTHENTICATED",
        message: "Authentication required"
      }
    });
    return;
  }

  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      res.status(401).json({
        error: {
          code: "UNAUTHENTICATED",
          message: "Authentication required"
        }
      });
      return;
    }

    if (req.session.user.role !== role) {
      res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Insufficient permissions"
        }
      });
      return;
    }

    next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};

