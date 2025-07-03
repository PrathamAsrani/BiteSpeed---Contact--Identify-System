const Contact = require("../models/contact")

class IdentityService {
  async identifyContact(email, phoneNumber) {
    try {
      // Find existing contacts with matching email or phone
      const existingContacts = await Contact.findByEmailOrPhone(email, phoneNumber)

      if (existingContacts.length === 0) {
        // No existing contacts found, create new primary contact
        return await this.createNewPrimaryContact(email, phoneNumber)
      }

      // Check if we need to create a new secondary contact
      const needsNewContact = this.shouldCreateNewContact(existingContacts, email, phoneNumber)

      if (needsNewContact) {
        await this.createSecondaryContact(existingContacts, email, phoneNumber)
      }

      // Handle linking of separate primary contacts
      await this.handlePrimaryContactLinking(existingContacts, email, phoneNumber)

      // Get the primary contact and build response
      return await this.buildContactResponse(existingContacts, email, phoneNumber)
    } catch (error) {
      console.error("Error in identifyContact:", error)
      throw new Error("Failed to identify contact")
    }
  }

  async createNewPrimaryContact(email, phoneNumber) {
    const newContact = await Contact.create({
      email,
      phoneNumber,
      linkPrecedence: "primary",
    })

    return {
      primaryContactId: newContact.id,
      emails: newContact.email ? [newContact.email] : [],
      phoneNumbers: newContact.phoneNumber ? [newContact.phoneNumber] : [],
      secondaryContactIds: [],
    }
  }

  shouldCreateNewContact(existingContacts, email, phoneNumber) {
    // Check if the exact combination of email and phone already exists
    const exactMatch = existingContacts.find(
      (contact) => contact.email === email && contact.phoneNumber === phoneNumber,
    )

    if (exactMatch) {
      return false
    }

    // Check if we have new information to add
    const hasNewEmail = email && !existingContacts.some((contact) => contact.email === email)
    const hasNewPhone = phoneNumber && !existingContacts.some((contact) => contact.phoneNumber === phoneNumber)

    return hasNewEmail || hasNewPhone
  }

  async createSecondaryContact(existingContacts, email, phoneNumber) {
    // Find the primary contact (oldest one)
    const primaryContact = this.findPrimaryContact(existingContacts)

    await Contact.create({
      email,
      phoneNumber,
      linkedId: primaryContact.id,
      linkPrecedence: "secondary",
    })
  }

  async handlePrimaryContactLinking(existingContacts, email, phoneNumber) {
    // Find contacts that match email
    const emailMatches = email ? await Contact.findByEmail(email) : []
    // Find contacts that match phone
    const phoneMatches = phoneNumber ? await Contact.findByPhone(phoneNumber) : []

    // Combine and get unique contacts
    const allMatches = [...emailMatches, ...phoneMatches]
    const uniqueContacts = this.getUniqueContacts(allMatches)

    // Find primary contacts that need to be linked
    const primaryContacts = uniqueContacts.filter(
      (contact) => contact.linkPrecedence === "primary" && !contact.linkedId,
    )

    if (primaryContacts.length > 1) {
      // Sort by creation date to determine which should remain primary
      primaryContacts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

      const mainPrimary = primaryContacts[0]
      const contactsToUpdate = primaryContacts.slice(1)

      // Update other primary contacts to secondary
      for (const contact of contactsToUpdate) {
        await Contact.updateLinkPrecedence(contact.id, mainPrimary.id, "secondary")
      }
    }
  }

  async buildContactResponse(existingContacts, email, phoneNumber) {
    // Get all related contacts
    const primaryContact = this.findPrimaryContact(existingContacts)
    const allLinkedContacts = await Contact.findAllLinked(primaryContact.id)

    // Separate primary and secondary contacts
    const primary = allLinkedContacts.find((contact) => contact.linkPrecedence === "primary" && !contact.linkedId)
    const secondaries = allLinkedContacts.filter(
      (contact) => contact.linkPrecedence === "secondary" || contact.linkedId,
    )

    // Collect unique emails and phone numbers
    const emails = this.getUniqueValues(allLinkedContacts, "email")
    const phoneNumbers = this.getUniqueValues(allLinkedContacts, "phoneNumber")

    // Ensure primary contact's info comes first
    if (primary) {
      if (primary.email) {
        emails.unshift(primary.email)
      }
      if (primary.phoneNumber) {
        phoneNumbers.unshift(primary.phoneNumber)
      }
    }

    return {
      primaryContactId: primary ? primary.id : primaryContact.id,
      emails: [...new Set(emails)].filter(Boolean),
      phoneNumbers: [...new Set(phoneNumbers)].filter(Boolean),
      secondaryContactIds: secondaries.map((contact) => contact.id),
    }
  }

  findPrimaryContact(contacts) {
    // Find the primary contact (one without linkedId or oldest one)
    const primary = contacts.find((contact) => contact.linkPrecedence === "primary" && !contact.linkedId)

    if (primary) {
      return primary
    }

    // If no clear primary, return the oldest contact
    return contacts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0]
  }

  getUniqueContacts(contacts) {
    const seen = new Set()
    return contacts.filter((contact) => {
      if (seen.has(contact.id)) {
        return false
      }
      seen.add(contact.id)
      return true
    })
  }

  getUniqueValues(contacts, field) {
    return contacts.map((contact) => contact[field]).filter((value) => value !== null && value !== undefined)
  }
}

module.exports = new IdentityService()
