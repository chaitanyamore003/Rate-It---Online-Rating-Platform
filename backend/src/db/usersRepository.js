const pool = require("./index");

class UserRepository {
  async findByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  }

  async createUser({ name, email, passwordHash, address, userRole }) {
    const result = await pool.query(
      "INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, email, passwordHash, address, userRole],
    );
    return result.rows[0];
  }

  async findById(id) {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0];
  }

  async updatePassword(id, passwordHash) {
    const result = await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2 RETURNING *",
      [passwordHash, id],
    );
    return result.rows[0];
  }

  async findMany({
    name,
    email,
    address,
    role,
    sortBy = "created_at",
    order = "DESC",
  }) {
    let query =
      "SELECT id, name, email, address, role, created_at FROM users WHERE 1=1";
    const queryParams = [];
    let paramIndex = 1;

    if (name) {
      query += ` AND name ILIKE $${paramIndex++}`;
      queryParams.push(`%${name}%`);
    }
    if (email) {
      query += ` AND email ILIKE $${paramIndex++}`;
      queryParams.push(`%${email}%`);
    }
    if (address) {
      query += ` AND address ILIKE $${paramIndex++}`;
      queryParams.push(`%${address}%`);
    }
    if (role) {
      query += ` AND role = $${paramIndex++}`;
      queryParams.push(role);
    }

    const validSortFields = ["name", "email", "address", "role", "created_at"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "created_at";
    const sortOrder = order.toLowerCase() === "asc" ? "ASC" : "DESC";

    query += ` ORDER BY ${sortField} ${sortOrder}`;

    const res = await pool.query(query, queryParams);
    return res.rows;
  }
}

module.exports = new UserRepository();
