require("dotenv").config()

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || "bitespeed_db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
  },
  jwtSecret: process.env.JWT_SECRET || "fallback-secret-key",
}
