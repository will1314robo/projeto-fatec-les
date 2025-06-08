import { Request, Response } from "express";
import pool from "../database/connection";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import {
  createUsuarioSchema,
  updateUsuarioSchema,
  resetPasswordSchema,
  changePasswordSchema
} from '../schemas/usuarioSchema';

export const createUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    await createUsuarioSchema.validate(req.body, { abortEarly: false });

    const { nome, dataNasc, telefone, tipo, perfil, cnpj, cpf, email, senha } = req.body;
    const telefoneLimpo = telefone.replace(/\D/g, ''); 
    const cpfLimpo = tipo === "PF" && cpf ? cpf.replace(/\D/g, '') : null;
    const cnpjLimpo = tipo === "PJ" && cnpj ? cnpj.replace(/\D/g, '') : null;

    const salt = bcrypt.genSaltSync(10);
    const senhaCriptografada = bcrypt.hashSync(senha, salt);

    await pool.query(
      "INSERT INTO Usuario (Nome, DataNasc, Telefone, Tipo, Perfil, CNPJ, CPF, Email, Senha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [nome, dataNasc, telefoneLimpo, tipo, perfil, cnpjLimpo, cpfLimpo, email, senhaCriptografada]
    );

    res.status(201).json({ message: "Usuário criado com sucesso!" });
    return; 
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error);

    if (error.name === 'ValidationError') {
      res.status(400).json({ message: "Dados inválidos.", errors: error.errors });
      return; 
    }

    if (error.code === "ER_DUP_ENTRY") {
      if (error.sqlMessage.includes("Email")) {
        res.status(400).json({ message: "O e-mail informado já está cadastrado." });
        return; 
      }
      if (error.sqlMessage.includes("CPF")) {
        res.status(400).json({ message: "O CPF informado já está cadastrado." });
        return; 
      }
      if (error.sqlMessage.includes("CNPJ")) {
        res.status(400).json({ message: "O CNPJ informado já está cadastrado." });
        return; 
      }
    }

    res.status(500).json({ message: "Erro interno no servidor", error: error.sqlMessage || error.message });
    return; 
  }
};

export const getUsuarioLogado = async (req: Request, res: Response) => {
  try {
    const userId = req.usuario?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado ou token inválido.' });
    }

    const [rows]: any = await pool.query(
      'SELECT ID, Nome, Tipo, CNPJ, CPF, Email, DataNasc, Telefone FROM Usuario WHERE ID = ?',
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const usuario = rows[0];
    const cpfOuCnpj = usuario.Tipo === "PF" ? usuario.CPF : usuario.CNPJ;

    res.status(200).json({
      id: usuario.ID,
      nome: usuario.Nome,
      tipo: usuario.Tipo,
      cpfOuCnpj: cpfOuCnpj,
      email: usuario.Email,
      dataNascimento: usuario.DataNasc,
      telefone: usuario.Telefone,
    });
  } catch (err: any) {
    console.error("Erro em getUsuarioLogado:", err);
    res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};

export const alterarSenha = async (req: Request, res: Response) => {
  try {
    await changePasswordSchema.validate(req.body, { abortEarly: false });

    const token = req.headers['authorization']?.split(' ')[1];
    const decoded: any = jwt.verify(token!, process.env.JWT_SECRET!);
    const userId = decoded.id;

    const { senhaAntiga, novaSenha } = req.body;

    const [rows]: any = await pool.query('SELECT Senha FROM Usuario WHERE ID = ?', [userId]);

    if (!rows.length) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const senhaCorreta = await bcrypt.compare(senhaAntiga, rows[0].Senha);
    if (!senhaCorreta) {
      return res.status(401).json({ message: "Senha antiga incorreta." });
    }

    const novaSenhaCriptografada = await bcrypt.hash(novaSenha, 10);

    await pool.query('UPDATE Usuario SET Senha = ? WHERE ID = ?', [novaSenhaCriptografada, userId]);

    res.status(200).json({ message: "Senha alterada com sucesso." });
  } catch (err: any) {
    console.error("Erro ao alterar senha:", err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: "Dados inválidos para alteração de senha.", errors: err.errors });
    }
    res.status(500).json({ message: "Erro ao alterar senha.", error: err.message });
  }
};

export const atualizarUsuario = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.usuario?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }
    await updateUsuarioSchema.validate(req.body, { abortEarly: false });

    const { nome, email, telefone } = req.body;

    const [currentRows]: any = await connection.query(
      'SELECT Nome, Email, Telefone FROM Usuario WHERE ID = ?',
      [userId]
    );

    if (currentRows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    const currentUsuario = currentRows[0];

    const updateFields: string[] = [];
    const updateValues: (string | number | null)[] = [];

    if (nome !== undefined && nome !== null && nome.trim() !== '' && nome !== currentUsuario.Nome) {
      updateFields.push('Nome = ?');
      updateValues.push(nome.trim());
    }

    if (email !== undefined && email !== null && email.trim() !== '' && email !== currentUsuario.Email) {
      updateFields.push('Email = ?');
      updateValues.push(email.trim());
    }

    if (telefone !== undefined && telefone !== null && telefone !== currentUsuario.Telefone) {
      const telefoneToSave = telefone.trim() === '' ? null : telefone.trim();
      updateFields.push('Telefone = ?');
      updateValues.push(telefoneToSave);
    }

    if (updateFields.length === 0) {
      return res.status(200).json({ success: true, message: 'Nenhum dado para atualizar fornecido ou dados idênticos.' });
    }

    const query = `UPDATE Usuario SET ${updateFields.join(', ')} WHERE ID = ?`;
    updateValues.push(userId);

    const [result] = await connection.query(query, updateValues);

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado ou nenhum dado alterado (possível inconsistência).' });
    }

    res.json({ success: true, message: 'Informações do usuário atualizadas com sucesso!' });

  } catch (error: any) {
    console.error('Erro ao atualizar usuário:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Dados inválidos para atualização.", errors: error.errors });
    }
    if (error.code === "ER_DUP_ENTRY" && error.sqlMessage.includes("Email")) {
      return res.status(400).json({ message: "O e-mail informado já está cadastrado para outro usuário." });
    }
    res.status(500).json({ message: 'Erro ao atualizar usuário.', error: error instanceof Error ? error.message : 'Erro desconhecido' });
  } finally {
    connection.release();
  }
};

export const getTotalUsuarios = async (_req: Request, res: Response) => {
  try {
    const [result]: any = await pool.query(`SELECT COUNT(ID) AS totalUsuarios FROM Usuario`);
    const totalUsuarios = result[0]?.totalUsuarios || 0;
    res.json({ total: totalUsuarios });
  } catch (error: any) {
    console.error("Erro ao buscar total de usuários:", error);
    res.status(500).json({ message: "Erro ao buscar total de usuários", error: error.message });
  }
};

export const resetarSenhaComCredenciais = async (req: Request, res: Response): Promise<void> => {
  try {
    await resetPasswordSchema.validate(req.body, { abortEarly: false });

    const { cpfCnpj, dataNascimento, novaSenha } = req.body;

    const dataNascimentoFormatada = new Date(dataNascimento).toISOString().split('T')[0];
    const cleanedCpfCnpj = cpfCnpj.replace(/\D/g, ''); 

    let query = '';

    if (cleanedCpfCnpj.length === 11) {
      query = 'SELECT ID FROM Usuario WHERE CPF = ? AND DataNasc = ?';
    } else if (cleanedCpfCnpj.length === 14) {
      query = 'SELECT ID FROM Usuario WHERE CNPJ = ? AND DataNasc = ?';
    } else {
      res.status(400).json({ message: "Formato de CPF/CNPJ inválido." });
      return; 
    }
    const [rows]: any = await pool.query(query, [cleanedCpfCnpj, dataNascimentoFormatada]);

    if (rows.length === 0) {
      res.status(404).json({ message: "Dados de usuário não encontrados ou inválidos." });
      return; 
    }

    const userId = rows[0].ID;

    const salt = bcrypt.genSaltSync(10);
    const novaSenhaCriptografada = bcrypt.hashSync(novaSenha, salt);

    await pool.query('UPDATE Usuario SET Senha = ? WHERE ID = ?', [novaSenhaCriptografada, userId]);

    res.status(200).json({ message: "Senha redefinida com sucesso!" });
    return; 

  } catch (error: any) {
    console.error("Erro ao redefinir senha com credenciais:", error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: "Dados inválidos para redefinição de senha.", errors: error.errors });
      return; 
    }
    res.status(500).json({ message: "Erro interno do servidor ao redefinir senha.", error: error.message });
    return; 
  }
};