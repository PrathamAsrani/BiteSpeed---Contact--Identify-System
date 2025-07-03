const Contact = require("../models/contact");

class IdentityService {
  async identifyContact(email, phoneNumber) {
    try {
      console.log("🟡 [identifyContact] Input:", { email, phoneNumber });

      const existingContacts = await Contact.findByEmailOrPhone(email, phoneNumber);
      console.log("🟢 [identifyContact] Found existingContacts:", existingContacts);

      if (existingContacts.length === 0) {
        console.log("🟠 [identifyContact] No existing contacts. Creating new primary...");
        return await this.createNewPrimaryContact(email, phoneNumber);
      }

      const needsNewContact = this.shouldCreateNewContact(existingContacts, email, phoneNumber);
      console.log("🟠 [identifyContact] needsNewContact:", needsNewContact);

      if (needsNewContact) {
        console.log("🟠 [identifyContact] Creating new secondary contact...");
        await this.createSecondaryContact(existingContacts, email, phoneNumber);
      }

      console.log("🟠 [identifyContact] Handling primary contact linking...");
      await this.handlePrimaryContactLinking(existingContacts, email, phoneNumber);

      console.log("🟢 [identifyContact] Building contact response...");
      const response = await this.buildContactResponse(existingContacts, email, phoneNumber);
      console.log("✅ [identifyContact] Final response:", response);

      return response;
    } catch (error) {
      console.error("❌ [identifyContact] Error:", error);
      throw new Error("Failed to identify contact");
    }
  }

  async createNewPrimaryContact(email, phoneNumber) {
    console.log("🟢 [createNewPrimaryContact] Creating new primary:", { email, phoneNumber });

    const newContact = await Contact.create({
      email,
      phoneNumber,
      linkPrecedence: "primary",
    });

    return {
      primaryContactId: newContact.id,
      emails: newContact.email ? [newContact.email] : [],
      phoneNumbers: newContact.phoneNumber ? [newContact.phoneNumber] : [],
      secondaryContactIds: [],
    };
  }

  shouldCreateNewContact(existingContacts, email, phoneNumber) {
    const exactMatch = existingContacts.find(
      (contact) => contact.email === email && contact.phoneNumber === phoneNumber,
    );
    if (exactMatch) {
      console.log("🟢 [shouldCreateNewContact] Exact match found — skipping secondary creation.");
      return false;
    }

    const hasNewEmail = email && !existingContacts.some((contact) => contact.email === email);
    const hasNewPhone = phoneNumber && !existingContacts.some((contact) => contact.phoneNumber === phoneNumber);

    console.log("🟡 [shouldCreateNewContact] hasNewEmail:", hasNewEmail, "hasNewPhone:", hasNewPhone);
    return hasNewEmail || hasNewPhone;
  }

  async createSecondaryContact(existingContacts, email, phoneNumber) {
    const primaryContact = this.findPrimaryContact(existingContacts);
    console.log("🟢 [createSecondaryContact] Linking to primary ID:", primaryContact?.id);

    await Contact.create({
      email,
      phoneNumber,
      linkedId: primaryContact.id,
      linkPrecedence: "secondary",
    });
  }

  async handlePrimaryContactLinking(existingContacts, email, phoneNumber) {
    console.log("🟠 [handlePrimaryContactLinking] Checking for multiple primaries...");

    const emailMatches = email ? await Contact.findByEmail(email) : [];
    const phoneMatches = phoneNumber ? await Contact.findByPhone(phoneNumber) : [];

    const allMatches = [...emailMatches, ...phoneMatches];
    const uniqueContacts = this.getUniqueContacts(allMatches);
    console.log("🟢 [handlePrimaryContactLinking] Unique contacts found:", uniqueContacts.length);

    const primaryContacts = uniqueContacts.filter(
      (contact) => contact.linkPrecedence === "primary" && !contact.linkedId,
    );

    if (primaryContacts.length > 1) {
      primaryContacts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const mainPrimary = primaryContacts[0];
      const contactsToUpdate = primaryContacts.slice(1);
      console.log("🟠 [handlePrimaryContactLinking] Updating primaries to secondaries:", contactsToUpdate.length);

      for (const contact of contactsToUpdate) {
        console.log("🔁 [handlePrimaryContactLinking] Updating contact:", contact.id);
        await Contact.updateLinkPrecedence(contact.id, mainPrimary.id, "secondary");
      }
    }
  }

  async buildContactResponse(existingContacts, email, phoneNumber) {
    console.log("🟠 [buildContactResponse] Building response...");

    const primaryContact = this.findPrimaryContact(existingContacts);
    const allLinkedContacts = await Contact.findAllLinked(primaryContact.id);

    console.log("🟢 [buildContactResponse] allLinkedContacts found:", allLinkedContacts.length);

    const primary = allLinkedContacts.find(
      (contact) => contact.linkPrecedence === "primary" && !contact.linkedId,
    );

    const secondaries = allLinkedContacts.filter(
      (contact) => contact.linkPrecedence === "secondary" || contact.linkedId,
    );

    const emails = this.getUniqueValues(allLinkedContacts, "email");
    const phoneNumbers = this.getUniqueValues(allLinkedContacts, "phoneNumber");

    if (primary) {
      if (primary.email) emails.unshift(primary.email);
      if (primary.phoneNumber) phoneNumbers.unshift(primary.phoneNumber);
    }

    return {
      primaryContactId: primary ? primary.id : primaryContact.id,
      emails: [...new Set(emails)].filter(Boolean),
      phoneNumbers: [...new Set(phoneNumbers)].filter(Boolean),
      secondaryContactIds: secondaries.map((contact) => contact.id),
    };
  }

  findPrimaryContact(contacts) {
    const primary = contacts.find((contact) => contact.linkPrecedence === "primary" && !contact.linkedId);
    return primary || contacts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];
  }

  getUniqueContacts(contacts) {
    const seen = new Set();
    return contacts.filter((contact) => {
      if (seen.has(contact.id)) return false;
      seen.add(contact.id);
      return true;
    });
  }

  getUniqueValues(contacts, field) {
    return contacts
      .map((contact) => contact[field])
      .filter((value) => value !== null && value !== undefined);
  }
}

module.exports = new IdentityService();
