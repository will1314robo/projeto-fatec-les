import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../database/connection';

dotenv.config();

const router = express.Router();

router.post('/login', async (req: Request, res: Response) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: "Email e senha são obrigatórios." });
  }

  try {
    const [rows]: any = await pool.query("SELECT * FROM Usuario WHERE Email = ?", [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Usuário não encontrado." });
    }

    const usuario = rows[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.Senha);

    if (!senhaCorreta) {
      return res.status(401).json({ message: "Senha incorreta." });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não está definida no arquivo .env!');
      return res.status(500).json({ message: "Erro interno no servidor. JWT_SECRET não definida." });
    }

    const token = jwt.sign(
      { id: usuario.ID, email: usuario.Email, nome: usuario.Nome, perfil: usuario.Perfil },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    return res.json({ message: "Login bem-sucedido!", token });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Erro ao fazer login:", error.message);
      return res.status(500).json({ message: "Erro interno no servidor.", error: error.message });
    }
    return res.status(500).json({ message: "Erro desconhecido no servidor." });
  }
});

export default router;
