import { Request, Response } from "express";
import pool from "../database/connection";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const loginAdmin = async (req: Request, res: Response) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: "Email e senha são obrigatórios." });
  }

  try {
    const [rows]: any = await pool.query(
      "SELECT * FROM Usuario WHERE Email = ? AND Perfil = 'Admin'",
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Administrador não encontrado ou não autorizado." });
    }

    const admin = rows[0];
    const senhaValida = bcrypt.compareSync(senha, admin.Senha);

    if (!senhaValida) {
      return res.status(401).json({ message: "Senha incorreta." });
    }

    const token = jwt.sign(
      { id: admin.ID, perfil: admin.Perfil },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    res.status(200).json({ token, admin: { id: admin.ID, nome: admin.Nome, email: admin.Email } });
  } catch (error: any) {
    res.status(500).json({ message: "Erro ao autenticar administrador", error: error.message });
  }
};
