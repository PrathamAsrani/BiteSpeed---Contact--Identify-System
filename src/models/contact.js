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
        let query = `SELECT * FROM contacts WHERE deleted_at IS NULL`;
        const values = [];
        const conditions = [];

        if (email) {
            values.push(email);
            conditions.push(`email = $${values.length}`);
        }

        if (phoneNumber) {
            values.push(phoneNumber);
            conditions.push(`phone_number = $${values.length}`);
        }

        if (conditions.length === 0) return [];

        query += ` AND (${conditions.join(" OR ")}) ORDER BY created_at ASC`;

        const result = await pool.query(query, values);
        return result.rows.map((row) => new Contact(row));
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
        SELECT *, ARRAY[id] AS path
        FROM contacts
        WHERE id = $1 AND deleted_at IS NULL

        UNION ALL

        SELECT c.*, ct.path || c.id
        FROM contacts c
        INNER JOIN contact_tree ct 
          ON (c.linked_id = ct.id OR c.id = ct.linked_id)
        WHERE 
          c.deleted_at IS NULL
          AND NOT c.id = ANY(ct.path)
      )
      SELECT DISTINCT id, phone_number, email, linked_id, link_precedence, created_at, updated_at, deleted_at
      FROM contact_tree
      ORDER BY created_at ASC
    `;

        console.log("🔍 [findAllLinked] Running recursive query for primaryId:", primaryId);
        const result = await pool.query(query, [primaryId]);
        console.log("🔍 [findAllLinked] Found rows:", result.rows.length);

        return result.rows.map((row) => new Contact(row));
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
