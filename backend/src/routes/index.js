const express = require("express")
const IdentityController = require("../controllers/IdentityController")

const router = express.Router()

// Health check route
router.get("/health", IdentityController.health)

// Main identity reconciliation endpoint
router.post("/identify", IdentityController.identify)

// API documentation route
router.get("/", (req, res) => {
  res.json({
    service: "Bitespeed Identity Reconciliation API",
    version: "1.0.0",
    endpoints: {
      "POST /identify": "Identify and reconcile customer contacts",
      "GET /health": "Health check endpoint",
    },
    documentation: {
      identify: {
        method: "POST",
        path: "/identify",
        body: {
          email: "string (optional)",
          phoneNumber: "string|number (optional)",
        },
        response: {
          contact: {
            primaryContatctId: "number",
            emails: "string[]",
            phoneNumbers: "string[]",
            secondaryContactIds: "number[]",
          },
        },
      },
    },
  })
})

module.exports = router
