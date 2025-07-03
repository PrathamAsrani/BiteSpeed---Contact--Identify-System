const fs = require("fs")
const path = require("path")
const pool = require("../config/database")

async function setupDatabase() {
  try {
    console.log("Setting up database...")

    // Read and execute schema
    const schemaPath = path.join(__dirname, "schema.sql")
    const schema = fs.readFileSync(schemaPath, "utf8")

    await pool.query(schema)
    console.log("Database schema created successfully!")

    // Insert sample data for testing
    await insertSampleData()

    console.log("Database setup completed!")
    // process.exit(0)
  } catch (error) {
    console.error("Error setting up database:", error)
    process.exit(1)
  }
}

async function insertSampleData() {
    await pool.query(`DELETE FROM contacts;`);
  const sampleContacts = [
    {
      phoneNumber: "123456",
      email: "lorraine@hillvalley.edu",
      linkPrecedence: "primary",
    },
    {
      phoneNumber: "919191",
      email: "george@hillvalley.edu",
      linkPrecedence: "primary",
    },
  ]

  for (const contact of sampleContacts) {
    await pool.query(
      `INSERT INTO contacts (phone_number, email, link_precedence) 
       VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [contact.phoneNumber, contact.email, contact.linkPrecedence],
    )
  }

  console.log("Sample data inserted successfully!")
}

if (require.main === module) {
  setupDatabase()
}

module.exports = { setupDatabase }
