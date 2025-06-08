import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "charadadiversoes",
  port: 3306,
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Conexão bem-sucedida!");
    connection.release();
  } catch (err) {
    console.error("Erro ao conectar no banco:", err);
  }
}

testConnection();