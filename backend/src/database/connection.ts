import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "charada", 
  port: 3308,
});

pool.getConnection()
  .then(() => {
    console.log("Conexão com o banco de dados estabelecida!");
  })
  .catch((err) => {
    console.error("Erro de conexão com o banco de dados:", err);
  });

export default pool;
