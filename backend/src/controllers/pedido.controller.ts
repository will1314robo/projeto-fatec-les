import { Request, Response } from 'express';
import pool from '../database/connection';
import { RowDataPacket } from 'mysql2';

export const getPedidos = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.usuario?.id;
    const userPerfil = req.usuario?.perfil; 
    console.log(`[getPedidos] Usuário ID: ${userId}, Perfil (do token): '${userPerfil}' (Tipo: ${typeof userPerfil})`);

    if (!userId || !userPerfil) {
      return res.status(401).json({ message: 'Informações de usuário não encontradas no token.' });
    }

    let query = `
      SELECT
        p.ID,
        p.ID_Usuario,
        u.Nome AS nomeUsuario,
        p.Status,
        p.Data,
        p.Valor,
        p.Posicao,
        p.atualizado
      FROM
        pedido p
      JOIN
        usuario u ON p.ID_Usuario = u.ID
    `;
    const params: (string | number)[] = [];

    if (userPerfil !== 'Admin') {
      console.log(`[getPedidos] Perfil '${userPerfil}' é diferente de 'Admin' (após toLowerCase). Aplicando filtro.`);
      query += ` WHERE p.ID_Usuario = ?`;
      params.push(userId);
    } else {
      console.log(`[getPedidos] Perfil '${userPerfil}' é 'admin' (após toLowerCase). Não aplicando filtro.`);
    }

    query += ` ORDER BY p.Data DESC, p.ID DESC`;

    console.log(`[getPedidos] Query SQL final a ser executada: ${query}`);
    console.log(`[getPedidos] Parâmetros para a query: ${params}`);

    const [rows] = await connection.query(query, params);

    console.log("[getPedidos] Rows brutos do banco de dados (confirme o número de pedidos):", rows);

    const pedidos = (rows as any[]).map(row => ({
      id: row.ID,
      idUsuario: row.ID_Usuario,
      nomeUsuario: row.nomeUsuario,
      status: row.Status,
      data: row.Data,
      valor: parseFloat(row.Valor),
      posicao: row.Posicao,
      atualizado: row.atualizado === 1,
    }));

    console.log("[getPedidos] Pedidos após mapeamento (pronto para enviar ao frontend - CONFIRME AQUI O NÚMERO DE ITENS):", pedidos);

    res.json({ success: true, pedidos });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ message: 'Erro ao buscar pedidos.', error: error instanceof Error ? error.message : 'Erro desconhecido' });
  } finally {
    connection.release();
  }
};

export const getTotalPedidos = async (_req: Request, res: Response) => {
  try {
    const [result]: any = await pool.query(`
      SELECT SUM(Valor) AS totalPedidos FROM pedido WHERE Status IN ('Concluido')
    `);

    const totalPedidos = result[0]?.totalPedidos || 0;
    res.json({ total: parseFloat(totalPedidos) });
  } catch (error: any) {
    console.error("Erro ao buscar total de vendas:", error);
    res.status(500).json({ message: "Erro ao buscar total de vendas", error: error.message });
  }
};

export const getPedidosMensais = async (_req: Request, res: Response) => { 
  try {
    const anoAtual = new Date().getFullYear(); 
    console.log(`Buscando vendas mensais para o ano: ${anoAtual}`); 

    const [result]: any = await pool.query(`
      SELECT
        DATE_FORMAT(Data, '%b') AS mes,
        SUM(Valor) AS vendas
      FROM
        pedido
      WHERE
        Status = 'Concluído' AND YEAR(Data) = ?
      GROUP BY
        mes
      ORDER BY
        MONTH(Data);
    `, [anoAtual]); 

    console.log("Resultado da query de vendas mensais:", result); 

    const mesesOrdem = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Set", "Oct", "Nov", "Dec"];

    const graficoDados = mesesOrdem.map(mes => {

      const itemDoMes = result.find((dataItem: any) => dataItem.mes === mes);
      return {
        mes,
        vendas: itemDoMes ? parseFloat(itemDoMes.vendas) : 0, 
      };
    });

    console.log("Dados formatados para o gráfico:", graficoDados); 

    res.json(graficoDados);
  } catch (error: any) {
    console.error("Erro ao buscar vendas mensais:", error);
    res.status(500).json({ message: "Erro ao buscar vendas mensais", error: error.message });
  }
};

export const updatePedido = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params; 
    const { status, posicao } = req.body; 
    const userPerfil = req.usuario?.perfil; 

    console.log(`[updatePedido] Tentativa de atualizar Pedido ID: ${id}. Status: '${status}', Posição: '${posicao}' por Perfil: '${userPerfil}'`);

    if (!userPerfil) {
      return res.status(401).json({ message: 'Informações de usuário não encontradas no token.' });
    }

    if (userPerfil !== 'Admin') {
      console.warn(`[updatePedido] Tentativa de acesso não autorizado por usuário com perfil: '${userPerfil}' para atualizar pedido ID: ${id}`);
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem atualizar pedidos.' });
    }

    const pedidoId = parseInt(id, 10);
    if (isNaN(pedidoId)) {
      return res.status(400).json({ message: 'ID de pedido inválido.' });
    }

    await connection.beginTransaction(); 

    const [currentPedidoRows]: any = await connection.query(
      `SELECT Status, ID_Cupom, ID_Usuario FROM pedido WHERE ID = ?`,
      [pedidoId]
    );

    if (currentPedidoRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Pedido não encontrado para atualização.' });
    }

    const currentPedido = currentPedidoRows[0];
    const cupomIdAssociated = currentPedido.ID_Cupom;
    const userIdAssociated = currentPedido.ID_Usuario; 

    let updateFields: string[] = [];
    const updateValues: (string | number)[] = [];

    if (status !== undefined) {
      const validStatuses = ['Em andamento', 'Concluído', 'Cancelado']; 
      if (!validStatuses.includes(status)) {
        await connection.rollback();
        return res.status(400).json({ message: `Status inválido: ${status}. Opções permitidas: ${validStatuses.join(', ')}.` });
      }
      updateFields.push('Status = ?');
      updateValues.push(status);

      if (status === 'Cancelado') {
        updateFields.push('Posicao = ?');
        updateValues.push('Cancelado');
      } else if (status === 'Concluído') {
        updateFields.push('Posicao = ?');
        updateValues.push('Concluído');
      }
    }

    if (posicao !== undefined) {
      const validPosicoes = ['Em produção', 'Embalando', 'Com transportadora', 'Concluído', 'Cancelado', 'Pendente'];
      if (!validPosicoes.includes(posicao)) {
        await connection.rollback();
        return res.status(400).json({ message: `Posição inválida: ${posicao}. Opções permitidas: ${validPosicoes.join(', ')}.` });
      }
      if (!updateFields.some(field => field.includes('Posicao')) || (status !== 'Concluído' && status !== 'Cancelado')) {
        updateFields.push('Posicao = ?');
        updateValues.push(posicao);
      }
    }

    updateFields.push('atualizado = ?');
    updateValues.push(1);

    if (updateFields.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Nenhum campo válido fornecido para atualização.' });
    }

    const query = `UPDATE pedido SET ${updateFields.join(', ')} WHERE ID = ?`;
    updateValues.push(pedidoId);

    console.log(`[updatePedido] Query SQL final a ser executada: ${query}`);
    console.log(`[updatePedido] Parâmetros para a query: ${updateValues}`);

    const [result]: any = await connection.query(query, updateValues);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Pedido não encontrado para atualização.' });
    }

    if (cupomIdAssociated) {
      if (status === 'Em andamento' || status === 'Concluído') {
        const [updateCupomResult]: any = await connection.query(
          `UPDATE Cupons SET Utilizado = TRUE, DataUtilizacao = NOW() WHERE ID = ? AND Usuario_ID = ? AND Utilizado = FALSE`,
          [cupomIdAssociated, userIdAssociated]
        );
        if (updateCupomResult.affectedRows > 0) {
          console.log(`[updatePedido] Cupom ${cupomIdAssociated} marcado como utilizado para o pedido ${pedidoId}.`);
        } else {
          console.warn(`[updatePedido] Não foi possível marcar o cupom ${cupomIdAssociated} como utilizado. Pode já estar utilizado ou não pertencer ao usuário. Pedido ${pedidoId}.`);
        }
      } else if (status === 'Cancelado') {
        const [updateCupomResult]: any = await connection.query(
          `UPDATE Cupons SET Utilizado = FALSE, DataUtilizacao = NULL WHERE ID = ? AND Usuario_ID = ? AND Utilizado = TRUE`,
          [cupomIdAssociated, userIdAssociated]
        );
        if (updateCupomResult.affectedRows > 0) {
          console.log(`[updatePedido] Cupom ${cupomIdAssociated} desmarcado como utilizado para o pedido ${pedidoId} (cancelado).`);
        } else {
          console.warn(`[updatePedido] Não foi possível desmarcar o cupom ${cupomIdAssociated} como utilizado. Pode já estar disponível ou não pertencer ao usuário. Pedido ${pedidoId}.`);
        }
      }
    }

    await connection.commit(); 

    const [updatedRows]: any = await connection.query<RowDataPacket[]>(
      `SELECT Status, Posicao, atualizado FROM pedido WHERE ID = ?`,
      [pedidoId]
    );

    console.log(`[updatePedido] Pedido ID ${pedidoId} atualizado com sucesso.`);
    res.json({
      success: true, message: 'Pedido atualizado com sucesso.',
      status: updatedRows[0].Status,
      posicao: updatedRows[0].Posicao,
      atualizado: updatedRows[0].atualizado === 1
    });

  } catch (error) {
    if (connection) {
      await connection.rollback(); 
    }
    console.error('Erro ao atualizar pedido:', error);
    res.status(500).json({ message: 'Erro ao atualizar pedido.', error: error instanceof Error ? error.message : 'Erro desconhecido' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};