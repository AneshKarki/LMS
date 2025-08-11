const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: true,
      message: err.message,
      code: "VALIDATION_ERROR",
    });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      error: true,
      message: "Invalid token",
      code: "UNAUTHORIZED",
    });
  }

  res.status(err.status || 500).json({
    error: true,
    message: err.message || "Internal Server Error",
    code: err.code || "INTERNAL_SERVER_ERROR",
  });
};

module.exports = { errorHandler };
