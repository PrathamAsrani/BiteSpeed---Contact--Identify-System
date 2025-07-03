const morgan = require("morgan")

// Custom token for request body (be careful with sensitive data)
morgan.token("body", (req) => {
  if (req.method === "POST" && req.body) {
    // Don't log sensitive information in production
    if (process.env.NODE_ENV === "production") {
      return "body-hidden-in-production"
    }
    return JSON.stringify(req.body)
  }
  return ""
})

// Custom format
const customFormat = ":method :url :status :res[content-length] - :response-time ms :body"

module.exports = morgan(customFormat)
