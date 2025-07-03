const pool = require("../config/database")

class Contact {
  constructor(data) {
    this.id = data.id
    this.phoneNumber = data.phone_number
    this.email = data.email
    this.linkedId = data.linked_id
    this.linkPrecedence = data.link_precedence
    this.createdAt = data.created_at
    this.updatedAt = data.updated_at
    this.deletedAt = data.deleted_at
  }

  static async findByEmailOrPhone(email, phoneNumber) {
    const query = `
      SELECT * FROM contacts 
      WHERE deleted_at IS NULL 
      AND (email = $1 OR phone_number = $2)
      ORDER BY created_at ASC
    `

    const result = await pool.query(query, [email, phoneNumber])
    return result.rows.map((row) => new Contact(row))
  }

  static async findByEmail(email) {
    const query = `
      SELECT * FROM contacts 
      WHERE email = $1 AND deleted_at IS NULL
      ORDER BY created_at ASC
    `

    const result = await pool.query(query, [email])
    return result.rows.map((row) => new Contact(row))
  }

  static async findByPhone(phoneNumber) {
    const query = `
      SELECT * FROM contacts 
      WHERE phone_number = $1 AND deleted_at IS NULL
      ORDER BY created_at ASC
    `

    const result = await pool.query(query, [phoneNumber])
    return result.rows.map((row) => new Contact(row))
  }

  static async findById(id) {
    const query = `
      SELECT * FROM contacts 
      WHERE id = $1 AND deleted_at IS NULL
    `

    const result = await pool.query(query, [id])
    return result.rows.length > 0 ? new Contact(result.rows[0]) : null
  }

  static async findAllLinked(primaryId) {
    const query = `
      WITH RECURSIVE contact_tree AS (
        -- Base case: find the primary contact
        SELECT * FROM contacts 
        WHERE id = $1 AND deleted_at IS NULL
        
        UNION ALL
        
        -- Recursive case: find all contacts linked to this tree
        SELECT c.* FROM contacts c
        INNER JOIN contact_tree ct ON (c.linked_id = ct.id OR c.id = ct.linked_id)
        WHERE c.deleted_at IS NULL
      )
      SELECT DISTINCT * FROM contact_tree
      ORDER BY created_at ASC
    `

    const result = await pool.query(query, [primaryId])
    return result.rows.map((row) => new Contact(row))
  }

  static async create(data) {
    const query = `
      INSERT INTO contacts (phone_number, email, linked_id, link_precedence)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `

    const values = [data.phoneNumber || null, data.email || null, data.linkedId || null, data.linkPrecedence]

    const result = await pool.query(query, values)
    return new Contact(result.rows[0])
  }

  static async updateLinkPrecedence(id, linkedId, linkPrecedence) {
    const query = `
      UPDATE contacts 
      SET linked_id = $2, link_precedence = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `

    const result = await pool.query(query, [id, linkedId, linkPrecedence])
    return result.rows.length > 0 ? new Contact(result.rows[0]) : null
  }

  async save() {
    if (this.id) {
      // Update existing contact
      const query = `
        UPDATE contacts 
        SET phone_number = $2, email = $3, linked_id = $4, link_precedence = $5
        WHERE id = $1
        RETURNING *
      `

      const values = [this.id, this.phoneNumber, this.email, this.linkedId, this.linkPrecedence]
      const result = await pool.query(query, values)
      return new Contact(result.rows[0])
    } else {
      // Create new contact
      return await Contact.create(this)
    }
  }
}

module.exports = Contact
