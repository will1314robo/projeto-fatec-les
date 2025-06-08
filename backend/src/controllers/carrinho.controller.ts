import { Request, Response } from 'express';
import db from '../database/connection';
import pool from '../database/connection';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface CarrinhoItem extends RowDataPacket {
  id: number;
  quantidade: number;
}

interface Carrinho extends RowDataPacket {
  id: number;
}

export const obterCarrinho = async (req: Request, res: Response) => {
  if (!req.usuario) {
    return res.status(401).json({ message: 'Usuário não autenticado' });
  }

  const userId = req.usuario.id;

  try {
    const [carrinhoRows]: any = await pool.query(
      'SELECT id FROM carrinhos WHERE usuario_id = ?',
      [userId]
    );

    if (carrinhoRows.length === 0) {
      return res.json({ itens: [] });
    }

    const carrinhoId = carrinhoRows[0].id;

    const [itens]: any = await pool.query(
      `SELECT ci.produto_id AS id, ci.quantidade, p.nome, p.preco
       FROM carrinho_itens ci
       JOIN produto p ON ci.produto_id = p.id
       WHERE ci.carrinho_id = ?`,
      [carrinhoId]
    );

    for (const item of itens) {
      const [imagens]: any = await pool.query(
        'SELECT ID, Tipo, Caminho FROM imagem_produto WHERE ProdutoID = ?',
        [item.id]
      );

      item.imagens = imagens.map((img: any) => {
        if (img.Tipo === 'url') {
          return img.Caminho;
        } else {
          return `http://localhost:5000/imagens/${img.ID}`;
        }
      });
    }

    return res.json({ itens });
  } catch (error) {
    console.error('Erro ao obter carrinho:', error);
    return res.status(500).json({ message: 'Erro interno no servidor' });
  }
};

export const atualizarQuantidade = async (req: Request, res: Response) => {
  if (!req.usuario) {
    return res.status(401).json({ message: 'Usuário não autenticado' });
  }

  const userId = req.usuario.id;
  const { produtoId, quantidade } = req.body;

  try {
    const [carrinhoRows] = await db.query<Carrinho[]>(
      'SELECT id FROM carrinhos WHERE usuario_id = ?',
      [userId]
    );

    if (carrinhoRows.length === 0) {
      return res.status(404).json({ message: 'Carrinho não encontrado' });
    }

    const carrinhoId = carrinhoRows[0].id;

    const [result] = await db.query<ResultSetHeader>(
      'UPDATE carrinho_itens SET quantidade = ? WHERE carrinho_id = ? AND produto_id = ?',
      [quantidade, carrinhoId, produtoId]
    );

    return res.status(200).json({ message: 'Quantidade atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar quantidade:', error);
    return res.status(500).json({ message: 'Erro interno no servidor' });
  }
};

export const adicionarItem = async (req: Request, res: Response) => {
  if (!req.usuario) {
    return res.status(401).json({ message: 'Usuário não autenticado' });
  }

  const userId = req.usuario.id;
  const { produtoId, quantidade } = req.body;

  try {
    const [carrinhoRows] = await db.query<Carrinho[]>(
      'SELECT id FROM carrinhos WHERE usuario_id = ?',
      [userId]
    );

    let carrinhoId: number;

    if (carrinhoRows.length === 0) {
      const [result] = await db.query<ResultSetHeader>(
        'INSERT INTO carrinhos (usuario_id) VALUES (?)',
        [userId]
      );
      carrinhoId = result.insertId;
    } else {
      carrinhoId = carrinhoRows[0].id;
    }

    const [itemExistenteRows] = await db.query<CarrinhoItem[]>(
      'SELECT id, quantidade FROM carrinho_itens WHERE carrinho_id = ? AND produto_id = ?',
      [carrinhoId, produtoId]
    );

    if (itemExistenteRows.length > 0) {
      await db.query<ResultSetHeader>(
        'UPDATE carrinho_itens SET quantidade = ? WHERE id = ?',
        [itemExistenteRows[0].quantidade + Number(quantidade), itemExistenteRows[0].id]
      );
    } else {
      await db.query<ResultSetHeader>(
        'INSERT INTO carrinho_itens (carrinho_id, produto_id, quantidade) VALUES (?, ?, ?)',
        [carrinhoId, produtoId, quantidade]
      );
    }

    return res.status(200).json({ message: 'Item adicionado ao carrinho com sucesso' });
  } catch (error) {
    console.error('Erro ao adicionar item ao carrinho:', error);
    return res.status(500).json({ message: 'Erro interno no servidor' });
  }
};

export const removerDoCarrinho = async (req: Request, res: Response) => {
  const { produtoId } = req.params;
  const usuarioId = req.usuario?.id;

  if (!usuarioId) {
    return res.status(401).json({ mensagem: 'Usuário não autenticado.' });
  }

  try {

    const [carrinhoRows]: any = await pool.query(
      'SELECT id FROM carrinhos WHERE usuario_id = ?',
      [usuarioId]
    );

    if (carrinhoRows.length === 0) {
      return res.status(404).json({ mensagem: 'Carrinho não encontrado para o usuário.' });
    }
    const carrinhoId = carrinhoRows[0].id;

    const [resultado] = await pool.query<ResultSetHeader>(
      'DELETE FROM carrinho_itens WHERE carrinho_id = ? AND produto_id = ?',
      [carrinhoId, produtoId]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Produto não encontrado no carrinho.' });
    }

    res.json({ mensagem: 'Produto removido do carrinho com sucesso.' });
  } catch (error) {
    console.error('Erro ao remover produto do carrinho:', error);
    res.status(500).json({ mensagem: 'Erro interno ao remover produto do carrinho.' });
  }
};

export const aplicarCupomNoCarrinho = async (req: Request, res: Response) => {
  if (!req.usuario) {
    return res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
  }

  const userId = req.usuario.id;
  const { codigoCupom } = req.body;

  if (!codigoCupom) {
    return res.status(400).json({ success: false, message: "Código do cupom é obrigatório." });
  }

  try {
    const [cupons]: any = await pool.query(
      `SELECT ID, Codigo, Usuario_ID, ValorDesconto, Utilizado, DataUtilizacao, Tipo
       FROM Cupons
       WHERE Codigo = ?`,
      [codigoCupom]
    );

    const cupom = cupons[0];

    if (!cupom) {
      return res.status(404).json({ success: false, message: "Cupom inválido ou não encontrado." });
    }

    const [pedidosComCupom]: any = await pool.query(
      `SELECT ID FROM pedido WHERE ID_Cupom = ?`,
      [cupom.ID]
    );

    if (pedidosComCupom.length > 0) {
      return res.status(409).json({ success: false, message: "Este cupom já está vinculado a um pedido existente e não pode ser aplicado novamente." });
    }

    if (cupom.Usuario_ID !== userId) {
      return res.status(403).json({ success: false, message: "Este cupom não pertence a este usuário." });
    }

    if (cupom.Utilizado) {
      return res.status(409).json({ success: false, message: "Este cupom já foi utilizado." });
    }

    const [carrinhoRows]: any = await pool.query(
      'SELECT id FROM carrinhos WHERE usuario_id = ?',
      [userId]
    );

    if (carrinhoRows.length === 0) {
      return res.status(400).json({ success: false, message: 'Não há itens no carrinho para aplicar o cupom.' });
    }
    const carrinhoId = carrinhoRows[0].id;

    const [itensCarrinho]: any = await pool.query(
      `SELECT ci.quantidade, p.preco
       FROM carrinho_itens ci
       JOIN produto p ON ci.produto_id = p.id
       WHERE ci.carrinho_id = ?`,
      [carrinhoId]
    );

    const subtotalCarrinho = itensCarrinho.reduce((total: number, item: any) => total + (item.preco * item.quantidade), 0);

    let valorDescontoCalculado = 0;
    const valorCupom = parseFloat(cupom.ValorDesconto);

    if (isNaN(valorCupom)) {
      return res.status(500).json({ success: false, message: "Erro: Valor de desconto inválido no banco de dados." });
    }

    if (cupom.Tipo === 'Aniversario') {
      valorDescontoCalculado = subtotalCarrinho * (valorCupom / 100);
    } else {
      valorDescontoCalculado = valorCupom;
    }

    return res.status(200).json({
      success: true,
      message: "Cupom aplicado com sucesso!",
      valorDesconto: valorDescontoCalculado.toFixed(2),
      cupomId: cupom.ID,
      valorTotalCarrinho: subtotalCarrinho.toFixed(2)
    });

  } catch (error) {
    console.error("Erro ao aplicar cupom:", error);
    return res.status(500).json({ success: false, message: "Erro interno do servidor ao aplicar cupom." });
  }
};

export const finalizarCompra = async (req: Request, res: Response) => {
  if (!req.usuario) {
    return res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
  }

  const userId = req.usuario.id;

  const { cupomId, enderecoEntrega, valorTotal, itensPedido } = req.body;

  if (!enderecoEntrega) {
    return res.status(400).json({ success: false, message: "Endereço de entrega faltando." });
  }
  if (!valorTotal || isNaN(parseFloat(valorTotal))) {
    return res.status(400).json({ success: false, message: "Valor total do pedido inválido ou faltando." });
  }
  if (!itensPedido || !Array.isArray(itensPedido) || itensPedido.length === 0) {
    return res.status(400).json({ success: false, message: "Itens do pedido faltando." });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    if (cupomId) {
      const [cupons]: any = await connection.query(
        `SELECT ID FROM cupons WHERE ID = ? AND Usuario_ID = ? AND Utilizado = FALSE`,
        [cupomId, userId]
      );
      if (cupons.length === 0) {
        await connection.rollback();
        return res.status(409).json({ success: false, message: "Cupom inválido, já utilizado ou não pertence a este usuário." });
      }
    }

    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);

    console.log(`[criarPedido] Data a ser inserida: ${formattedDate}`);

    const [resultPedido] = await connection.query<ResultSetHeader>(
      `INSERT INTO pedido (ID_Usuario, Status, Data, Valor, Posicao, ID_Cupom) VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, 'Pendente', formattedDate, parseFloat(valorTotal), 'Pendente', cupomId || null]
    );
    const pedidoId = resultPedido.insertId;

    for (const item of itensPedido) {
      await connection.query<ResultSetHeader>(
        `INSERT INTO pedido_itens (ID_Pedido, ID_Produto, Quantidade, PrecoUnitario) VALUES (?, ?, ?, ?)`,
        [pedidoId, item.produtoId, item.quantidade, item.precoUnitario]
      );
    }

    const [carrinhoRows]: any = await connection.query(
      'SELECT id FROM carrinhos WHERE usuario_id = ?',
      [userId]
    );
    if (carrinhoRows.length > 0) {
      await connection.query('DELETE FROM carrinho_itens WHERE carrinho_id = ?', [carrinhoRows[0].id]);
    }

    await connection.commit();

    console.log(`[${new Date().toISOString()}] - Pedido ${pedidoId} finalizado para o usuário ${userId}. Cupom ID: ${cupomId || 'N/A'}`);
    return res.status(200).json({ success: true, message: "Pedido finalizado com sucesso!", pedidoId: pedidoId });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Erro ao finalizar compra:", error);
    return res.status(500).json({ success: false, message: "Erro interno do servidor ao finalizar compra." });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

export const limparCarrinho = async (req: Request, res: Response) => {
  if (!req.usuario) {
    return res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
  }

  const userId = req.usuario.id;

  try {
    const [carrinhoRows]: any = await pool.query(
      'SELECT id FROM carrinhos WHERE usuario_id = ?',
      [userId]
    );

    if (carrinhoRows.length === 0) {

      return res.status(200).json({ success: true, message: 'Carrinho já está vazio.' });
    }

    const carrinhoId = carrinhoRows[0].id;

    const [resultDelete] = await pool.query<ResultSetHeader>(
      'DELETE FROM carrinho_itens WHERE carrinho_id = ?',
      [carrinhoId]
    );

    console.log(`[${new Date().toISOString()}] - Carrinho do usuário ${userId} (ID do carrinho: ${carrinhoId}) limpo. ${resultDelete.affectedRows} itens removidos.`);
    return res.status(200).json({ success: true, message: 'Carrinho limpo com sucesso.' });

  } catch (error) {
    console.error('Erro ao limpar carrinho no backend:', error);
    return res.status(500).json({ success: false, message: 'Erro interno do servidor ao limpar carrinho.' });
  }
};