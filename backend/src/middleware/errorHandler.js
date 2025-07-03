const errorHandler = (err, req, res, next) => {
  console.error("Error:", err)

  // Default error
  const error = {
    message: err.message || "Internal Server Error",
    status: err.status || 500,
  }

  // Database connection errors
  if (err.code === "ECONNREFUSED") {
    error.message = "Database connection failed"
    error.status = 503
  }

  // Validation errors
  if (err.name === "ValidationError") {
    error.message = "Validation failed"
    error.status = 400
  }

  // Send error response
  res.status(error.status).json({
    error: error.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}

module.exports = errorHandler
