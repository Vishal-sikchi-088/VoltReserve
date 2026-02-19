function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const code = err.code || "INTERNAL_SERVER_ERROR";
  const message = err.message || "Unexpected error";

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    error: {
      code,
      message
    }
  });
}

module.exports = errorHandler;

