const pool = require("./index");

class StoreRepository {
  // ============================================================
  // Get all stores with optional search/filter conditions
  // ============================================================
  async findMany({ name, email, address }) {
    // Base query to get store details and owner's name
    let query = `
      SELECT
        s.id,
        s.name,
        s.email,
        s.address,
        s.created_at,
        u.name AS owner_name,

        (
          SELECT COALESCE(AVG(rating), 0)
          FROM ratings
          WHERE store_id = s.id
        ) AS overall_rating

      FROM stores s

      LEFT JOIN users u ON s.owner_id = u.id

      WHERE 1=1
    `;

    // Values for $1, $2, $3...
    const queryParams = [];

    // PostgreSQL parameter counter
    let paramIndex = 1;

    // ------------------------------------------------------------
    // Search/filter by store name
    // ------------------------------------------------------------
    if (name) {
      query += ` AND s.name ILIKE $${paramIndex++}`;
      queryParams.push(`%${name}%`);
    }

    // ------------------------------------------------------------
    // Filter by store email
    // ------------------------------------------------------------
    if (email) {
      query += ` AND s.email ILIKE $${paramIndex++}`;
      queryParams.push(`%${email}%`);
    }

    // ------------------------------------------------------------
    // Filter by store address
    // ------------------------------------------------------------
    if (address) {
      query += ` AND s.address ILIKE $${paramIndex++}`;
      queryParams.push(`%${address}%`);
    }

    // Execute the final query
    const res = await pool.query(query, queryParams);

    // Return all matching stores
    return res.rows;
  }

  // ============================================================
  // Get all stores along with the logged-in user's rating
  // Used by Normal Users
  // ============================================================
  async findManyWithUserRating(userId, { name, address }) {
    // Get store details, overall rating and current user's rating
    let query = `
      SELECT
        s.id,
        s.name,
        s.address,
        s.created_at,

        (
          SELECT COALESCE(ROUND(AVG(rating), 2), 0)
          FROM ratings
          WHERE store_id = s.id
        ) AS overall_rating,

        (
          SELECT rating
          FROM ratings
          WHERE store_id = s.id
          AND user_id = $1
        ) AS user_rating

      FROM stores s

      WHERE 1=1
    `;

    // $1 is reserved for the logged-in user's ID
    const queryParams = [userId];

    // Next parameter starts from $2
    let paramIndex = 2;

    // ------------------------------------------------------------
    // Search/filter by store name
    // ------------------------------------------------------------
    if (name) {
      query += ` AND s.name ILIKE $${paramIndex++}`;
      queryParams.push(`%${name}%`);
    }

    // ------------------------------------------------------------
    // Filter by store address
    // ------------------------------------------------------------
    if (address) {
      query += ` AND s.address ILIKE $${paramIndex++}`;
      queryParams.push(`%${address}%`);
    }

    // Execute the query
    const res = await pool.query(query, queryParams);

    // Return matching stores
    return res.rows;
  }

  // ============================================================
  // Get one specific store with the user's rating
  // ============================================================
  async findByIdWithUserRating(id, userId) {
    const res = await pool.query(
      `
      SELECT
        s.id,
        s.name,
        s.address,

        (
          SELECT COALESCE(ROUND(AVG(rating), 2), 0)
          FROM ratings
          WHERE store_id = s.id
        ) AS overall_rating,

        (
          SELECT rating
          FROM ratings
          WHERE store_id = s.id
          AND user_id = $1
        ) AS user_rating

      FROM stores s

      WHERE s.id = $2
      `,

      // $1 = userId
      // $2 = store id
      [userId, id],
    );

    // Return the store
    return res.rows[0];
  }

  // ============================================================
  // Find the store belonging to a specific owner
  // ============================================================
  async findByOwnerId(ownerId) {
    const res = await pool.query(
      `
      SELECT
        s.id,
        s.name,

        (
          SELECT COALESCE(ROUND(AVG(rating), 2), 0)
          FROM ratings
          WHERE store_id = s.id
        ) AS average_rating

      FROM stores s

      WHERE s.owner_id = $1
      `,

      [ownerId],
    );

    // Return the owner's store
    return res.rows[0];
  }

  // ============================================================
  // Create a new store
  // ============================================================
  async create({ name, email, address, ownerId }) {
    const res = await pool.query(
      `
      INSERT INTO stores (
        name,
        email,
        address,
        owner_id
      )
      VALUES ($1, $2, $3, $4)

      -- Return the newly created store
      RETURNING *
      `,
      [name, email, address, ownerId],
    );

    // Return newly created store
    return res.rows[0];
  }
}

// Export a single repository instance
module.exports = new StoreRepository();
