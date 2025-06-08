import pool from "../../database/connection";

export const getAllProducts = async () => {
  const [rows] = await pool.query("SELECT * FROM products");
  return rows;
};

export const getProductById = async (id: number) => {
  const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
};
