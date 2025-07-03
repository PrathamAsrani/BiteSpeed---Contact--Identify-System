const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const config = require("./config")
const routes = require("./routes")
const errorHandler = require("./middleware/errorHandler")
const requestLogger = require("./middleware/requestLogger")
const { setupDatabase } = require("./database/setup")

// rest-api instance
const app = express()

// database setup and load data
setupDatabase()

// Security middleware
app.use(helmet())

// CORS configuration
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? ["https://your-frontend-domain.com"] : true,
    credentials: true, // cookies
  }),
)

// Request parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Request logging
if (process.env.NODE_ENV !== "test") {
  app.use(requestLogger)
}

// Routes
app.use("/", routes)

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  })
})

// Error handling middleware (must be last)
app.use(errorHandler)

// Start server
const PORT = config.port
const server = app.listen(PORT, () => {
  console.log(`🚀 Bitespeed Identity Reconciliation API running on port ${PORT}`)
  console.log(`📊 Environment: ${config.nodeEnv}`)
  console.log(`🔗 API Documentation: http://localhost:${PORT}/`)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully")
  server.close(() => {
    console.log("Process terminated")
  })
})

module.exports = app
