import { Request, Response } from 'express';
import pool from '../database/connection';
import { RowDataPacket } from 'mysql2';

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

export const getChamados = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.usuario?.id;
    const userPerfil = req.usuario?.perfil;

    console.log(`[getChamados] Usuário ID: ${userId}, Perfil (do token): '${userPerfil}'`);

    if (!userId || !userPerfil) {
      return res.status(401).json({ message: 'Informações de usuário não encontradas no token.' });
    }

    if (userPerfil !== 'Admin') {
      console.warn(`[getChamados] Tentativa de acesso não autorizado por usuário com perfil: '${userPerfil}'`);
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem visualizar chamados.' });
    }

    let query = `
      SELECT
        c.ID,
        c.PedidoID,
        c.Descricao,
        c.Whatsapp,
        c.Email,
        c.DataAbertura
      FROM
        chamados c
      ORDER BY
        c.DataAbertura DESC, c.ID DESC
    `;
    const params: (string | number)[] = []; 

    console.log(`[getChamados] Query SQL final a ser executada: ${query}`);
    console.log(`[getChamados] Parâmetros para a query: ${params}`);

    const [rows] = await connection.query<RowDataPacket[]>(query, params);

    console.log("[getChamados] Rows brutos do banco de dados:", rows);

    const chamados = rows.map(row => ({
      id: row.ID,
      pedidoId: row.PedidoID,
      descricao: row.Descricao,
      whatsapp: row.Whatsapp,
      email: row.Email,
      dataAbertura: row.DataAbertura.toISOString(),
    }));

    console.log("[getChamados] Chamados após mapeamento (pronto para enviar ao frontend):", chamados);

    res.json({ success: true, chamados });
  } catch (error) {
    console.error('Erro ao buscar chamados:', error);
    res.status(500).json({ message: 'Erro ao buscar chamados.', error: error instanceof Error ? error.message : 'Erro desconhecido' });
  } finally {
    connection.release();
  }
};

export const createChamado = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { pedidoId, descricao, whatsapp, email } = req.body;
    const userId = req.usuario?.id;
    const userPerfil = req.usuario?.perfil;

    if (!userId || !userPerfil) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    if (userPerfil !== 'admin') {
        return res.status(403).json({ message: 'Apenas administradores podem criar chamados via esta interface.' });
    }

    if (!pedidoId || !descricao || !whatsapp || !email) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios: PedidoID, Descricao, Whatsapp, Email.' });
    }

    const query = `
      INSERT INTO chamados (PedidoID, Descricao, Whatsapp, Email)
      VALUES (?, ?, ?, ?)
    `;
    const params = [pedidoId, descricao, whatsapp, email];

    const [result]: any = await connection.query(query, params);

    res.status(201).json({
      success: true,
      message: 'Chamado criado com sucesso!',
      chamadoId: result.insertId
    });

  } catch (error) {
    console.error('Erro ao criar chamado:', error);
    res.status(500).json({ message: 'Erro ao criar chamado.', error: error instanceof Error ? error.message : 'Erro desconhecido' });
  } finally {
    connection.release();
  }
};

export const getChamadoById = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const userId = req.usuario?.id;
    const userPerfil = req.usuario?.perfil;

    if (!userId || !userPerfil) {
      return res.status(401).json({ message: 'Informações de usuário não encontradas no token.' });
    }

    if (userPerfil !== 'Admin') {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem visualizar detalhes de chamados.' });
    }

    const query = `
      SELECT
        c.ID,
        c.PedidoID,
        c.Descricao,
        c.Whatsapp,
        c.Email,
        c.DataAbertura
      FROM
        chamados c
      WHERE
        c.ID = ?
    `;
    const params: (string | number)[] = [id];

    const [rows]: any = await connection.query<RowDataPacket[]>(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Chamado não encontrado.' });
    }

    const chamado = {
      id: rows[0].ID,
      pedidoId: rows[0].PedidoID,
      descricao: rows[0].Descricao,
      whatsapp: rows[0].Whatsapp,
      email: rows[0].Email,
      dataAbertura: rows[0].DataAbertura.toISOString(),
    };

    res.json({ success: true, chamado });
  } catch (error) {
    console.error('Erro ao buscar chamado por ID:', error);
    res.status(500).json({ message: 'Erro ao buscar chamado.', error: error instanceof Error ? error.message : 'Erro desconhecido' });
  } finally {
    connection.release();
  }
};

export const deleteChamado = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params; 
    const userPerfil = req.usuario?.perfil; 

    console.log(`[deleteChamado] Tentativa de deletar Chamado ID: ${id} por Perfil: '${userPerfil}'`);

    if (!userPerfil) {
      return res.status(401).json({ message: 'Informações de usuário não encontradas no token.' });
    }

    if (userPerfil !== 'Admin') {
      console.warn(`[deleteChamado] Tentativa de acesso não autorizado por usuário com perfil: '${userPerfil}' para deletar chamado ID: ${id}`);
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem deletar chamados.' });
    }

    const chamadoId = parseInt(id, 10);
    if (isNaN(chamadoId)) {
      return res.status(400).json({ message: 'ID de chamado inválido.' });
    }

    const query = `DELETE FROM chamados WHERE ID = ?`;
    const [result]: any = await connection.query(query, [chamadoId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Chamado não encontrado para deleção.' });
    }

    console.log(`[deleteChamado] Chamado ID ${chamadoId} deletado com sucesso.`);
    res.json({ success: true, message: 'Chamado deletado com sucesso.' });

  } catch (error) {
    console.error('Erro ao deletar chamado:', error);
    res.status(500).json({ message: 'Erro ao deletar chamado.', error: error instanceof Error ? error.message : 'Erro desconhecido' });
  } finally {
    connection.release();
  }
};