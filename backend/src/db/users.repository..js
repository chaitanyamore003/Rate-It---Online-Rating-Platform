const pool = require("./index");

class UserRepository {
  // Find a user by their email
  async findByEmail(email) {
    const result = await pool.query(
      `SELECT
        id,
        name,
        email,
        password_hash,
        address,
        role,
        created_at
       FROM users
       WHERE email = $1`,
      [email],
    );

    return result.rows[0];
  }

  // Create a new user
  async createUser({ name, email, passwordHash, address, userRole }) {
    const result = await pool.query(
      `INSERT INTO users
        (name, email, password_hash, address, role)
       VALUES
        ($1, $2, $3, $4, $5)
       RETURNING
        id,
        name,
        email,
        password_hash,
        address,
        role,
        created_at`,
      [name, email, passwordHash, address, userRole],
    );

    return result.rows[0];
  }

  // Find a user by ID
  async findById(id) {
    const result = await pool.query(
      `SELECT
        id,
        name,
        email,
        address,
        role,
        created_at
       FROM users
       WHERE id = $1`,
      [id],
    );

    return result.rows[0];
  }

  // Update user's password
  async updatePassword(id, passwordHash) {
    const result = await pool.query(
      `UPDATE users
       SET password_hash = $1
       WHERE id = $2
       RETURNING
        id,
        name,
        email,
        address,
        role,
        created_at`,
      [passwordHash, id],
    );

    return result.rows[0];
  }

  // Find multiple users with optional filters and sorting
  async findMany({
    name,
    email,
    address,
    role,
    sortBy = "created_at",
    order = "DESC",
  }) {
    let query = `
      SELECT
        id,
        name,
        email,
        address,
        role,
        created_at
      FROM users
      WHERE 1 = 1
    `;

    const queryParams = [];
    let paramIndex = 1;

    // Filter by name
    if (name) {
      query += ` AND name ILIKE $${paramIndex++}`;
      queryParams.push(`%${name}%`);
    }

    // Filter by email
    if (email) {
      query += ` AND email ILIKE $${paramIndex++}`;
      queryParams.push(`%${email}%`);
    }

    // Filter by address
    if (address) {
      query += ` AND address ILIKE $${paramIndex++}`;
      queryParams.push(`%${address}%`);
    }

    // Filter by role
    if (role) {
      query += ` AND role = $${paramIndex++}`;
      queryParams.push(role);
    }

    // Whitelist allowed columns for sorting
    const validSortFields = ["name", "email", "address", "role", "created_at"];

    const sortField = validSortFields.includes(sortBy) ? sortBy : "created_at";

    // Only allow ASC or DESC
    const sortOrder = order.toLowerCase() === "asc" ? "ASC" : "DESC";

    query += ` ORDER BY ${sortField} ${sortOrder}`;

    const result = await pool.query(query, queryParams);

    return result.rows;
  }
}

module.exports = new UserRepository();
