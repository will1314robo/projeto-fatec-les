import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: number;
        email: string;
        perfil: string;
      };
    }
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: "Erro interno no servidor" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: number; email: string; perfil: string };
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token inválido ou expirado" });
  }
};