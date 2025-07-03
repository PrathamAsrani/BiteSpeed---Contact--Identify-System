const fs = require("fs");
const path = require("path");
const pool = require("../config/database");

async function setupDatabase() {
  try {
    console.log("Setting up database...");

    // Read and execute schema
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    await pool.query(schema);
    console.log("✅ Database schema created successfully!");

    // Insert sample data for testing
    await insertSampleData();

    console.log("✅ Database setup completed!");
  } catch (error) {
    console.error("❌ Error setting up database:", error);
    process.exit(1);
  }
}

async function insertSampleData() {
  await pool.query(`DELETE FROM contacts;`);

  const primaryContacts = [
    { phoneNumber: "9145495032", email: "pratham@bitespeed.in", key: "pratham" },
    { phoneNumber: "9999988888", email: "aishwarya@gmail.com", key: "aish" },
    { phoneNumber: "8000000000", email: "rahul@gmail.com", key: "rahul" },
    { phoneNumber: "7012345678", email: "virat@gmail.com", key: "virat" },
    { phoneNumber: "9876512345", email: "anushka@gmail.com", key: "anushka" },
    { phoneNumber: "9191919191", email: "ranbir@kapoor.com", key: "ranbir" },
    { phoneNumber: "8080808080", email: "alia@bhatt.com", key: "alia" },
    { phoneNumber: "9312345678", email: "rohit@sharma.in", key: "rohit" },
    { phoneNumber: "8899776655", email: "dhoni@csk.in", key: "dhoni" },
    { phoneNumber: "9876543211", email: "harsh@startup.in", key: "harsh" }
  ];

  const contactIdMap = {}; // Track inserted primary contacts' IDs

  for (const contact of primaryContacts) {
    const result = await pool.query(
      `INSERT INTO contacts (phone_number, email, link_precedence, linked_id)
       VALUES ($1, $2, 'primary', NULL) RETURNING id`,
      [contact.phoneNumber, contact.email]
    );
    contactIdMap[contact.key] = result.rows[0].id;
  }

  const secondaryContacts = [
    { phoneNumber: "9145495032", email: "asrani@bitespeed.in", linkedTo: "pratham" },
    { phoneNumber: "8888877777", email: "aishwarya@gmail.com", linkedTo: "aish" },
    { phoneNumber: "8000000000", email: "raj@gmail.com", linkedTo: "rahul" },
    { phoneNumber: "7012345678", email: "kohli@gmail.com", linkedTo: "virat" },
    { phoneNumber: "9876543210", email: "virat@gmail.com", linkedTo: "virat" },
    { phoneNumber: "9312345678", email: "rsharma@bcci.in", linkedTo: "rohit" },
    { phoneNumber: "8899776655", email: "ms@csk.in", linkedTo: "dhoni" },
    { phoneNumber: "7000000001", email: "duplicate@startup.in", linkedTo: "harsh" }
  ];

  for (const contact of secondaryContacts) {
    await pool.query(
      `INSERT INTO contacts (phone_number, email, link_precedence, linked_id)
       VALUES ($1, $2, 'secondary', $3)`,
      [contact.phoneNumber, contact.email, contactIdMap[contact.linkedTo]]
    );
  }

  console.log("✅ Inserted sample contacts into DB");
}


if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
