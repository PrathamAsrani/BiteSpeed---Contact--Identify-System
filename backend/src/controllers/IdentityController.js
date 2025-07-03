const IdentityService = require("../services/IdentityService")
const { validateIdentifyRequest } = require("../utils/validation")

class IdentityController {
  async identify(req, res) {
    try {
      // Validate request body
      const { error, value } = validateIdentifyRequest(req.body)
      if (error) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.details.map((detail) => detail.message),
        })
      }

      const { email, phoneNumber } = value

      // Ensure at least one of email or phoneNumber is provided
      if (!email && !phoneNumber) {
        return res.status(400).json({
          error: "At least one of email or phoneNumber must be provided",
        })
      }

      // Process the identity reconciliation
      const contact = await IdentityService.identifyContact(email, phoneNumber)

      // Return the response in the required format
      res.status(200).json({
        contact: {
          primaryContatctId: contact.primaryContactId, // Note: keeping the typo as per requirement
          emails: contact.emails,
          phoneNumbers: contact.phoneNumbers,
          secondaryContactIds: contact.secondaryContactIds,
        },
      })
    } catch (error) {
      console.error("Error in identify controller:", error)
      res.status(500).json({
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
      })
    }
  }

  // Health check endpoint
  async health(req, res) {
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      service: "Bitespeed Identity Reconciliation",
    })
  }
}

module.exports = new IdentityController()
