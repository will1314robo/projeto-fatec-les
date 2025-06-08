import pool from "../database/connection";
import { v4 as uuidv4 } from 'uuid';

export const gerarCupomAniversario = async (usuarioID: number): Promise<string> => {
  const hoje = new Date();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const ano = String(hoje.getFullYear()).slice(2);
  const codigo = `ANIV-${mes}${ano}-${uuidv4().substring(0, 8).toUpperCase()}`;
  const [existe]: any = await pool.query(
    "SELECT 1 FROM Cupons WHERE Codigo = ?",
    [codigo]
  );

  if (existe.length > 0) {
    return await gerarCupomAniversario(usuarioID); 
  }

  await pool.query(
    "INSERT INTO Cupons (Codigo, Usuario_ID, MesAno, ValorDesconto, Tipo) VALUES (?, ?, ?, ?, ?)",
    [codigo, usuarioID, `${hoje.getFullYear()}-${mes}`, 10.00, 'Aniversario']
  );

  return codigo;
};

export const validarCupomUsuario = async (codigo: string, usuarioID: number) => {
  const [cupom]: any = await pool.query(
    `SELECT c.*, u.Nome, u.Email 
     FROM Cupons c
     JOIN Usuario u ON c.Usuario_ID = u.ID
     WHERE c.Codigo = ? AND c.Usuario_ID = ?`,
    [codigo, usuarioID]
  );

  return cupom[0];
};