import { Request, Response } from "express";
import pool from "../database/connection";
import * as Yup from 'yup';

const produtoSchema = Yup.object().shape({
  nome: Yup.string()
    .required('Nome é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome não pode ter mais de 100 caracteres'),
  preco: Yup.number()
    .required('Preço é obrigatório')
    .positive('Preço deve ser positivo') 
    .typeError('Preço deve ser um número válido'), 
  categoria: Yup.string()
    .required('Categoria é obrigatória'),
  descricao: Yup.string()
    .required('Descrição é obrigatória')
    .min(10, 'Descrição deve ter pelo menos 10 caracteres'),
});

export const createProduto = async (req: Request, res: Response) => {
  const { nome, preco, status = 'Disponível', categoria, descricao } = req.body;
  const arquivos = req.files as Express.Multer.File[] || [];

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result]: any = await connection.execute(
      `INSERT INTO produto (Nome, Preco, Status, Categoria, Descricao)
       VALUES (?, ?, ?, ?, ?)`,
      [nome, preco, status, categoria, descricao]
    );

    const produtoId = result.insertId;

    for (const file of arquivos) {
      const [imgResult]: any = await connection.execute(
        `INSERT INTO imagem_produto (ProdutoID, Caminho, Tipo, MimeType, Tamanho)
         VALUES (?, ?, 'upload', ?, ?)`,
        [produtoId, file.originalname, file.mimetype, file.size]
      );

      const imagemId = imgResult.insertId;

      await connection.execute(
        `INSERT INTO imagem_dados (ImagemID, Dados)
         VALUES (?, ?)`,
        [imagemId, file.buffer]
      );
    }

    await connection.commit();
    res.status(201).json({ message: "Produto criado com sucesso", id: produtoId });
  } catch (error) {
    await connection.rollback();
    console.error("Erro ao criar produto:", error);
    res.status(500).json({ message: "Erro ao criar produto" });
  } finally {
    connection.release();
  }
};

export const getAllProdutos = async (_req: Request, res: Response) => {
  try {
    const [produtos]: any = await pool.query(`
      SELECT 
        p.id,
        p.Nome AS nome,
        p.Preco AS preco,
        p.Status AS status,
        p.Categoria AS categoria,
        p.Descricao AS descricao,
        GROUP_CONCAT(i.ID) AS imagens
      FROM Produto p
      LEFT JOIN imagem_produto i ON p.id = i.ProdutoID
      GROUP BY p.id
      ORDER BY p.id DESC
    `);

    res.json(produtos.map((produto: any) => ({
      ...produto,
      imagens: produto.imagens ? produto.imagens.split(',').map((id: string) => id.trim()) : [],
      preco: parseFloat(produto.preco)
    })));
  } catch (error: any) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ message: "Erro ao buscar produtos", error: error.message });
  }
};

export const getProdutoById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.execute(
      "SELECT id, nome, preco, status, categoria, descricao FROM produto WHERE id = ?",
      [id]
    );

    if ((rows as any[]).length === 0) {
      return res.status(404).json({ message: "Produto não encontrado." });
    }

    const produto = (rows as any)[0];

    const [imagensResult] = await pool.execute(
      "SELECT id FROM imagem_produto WHERE produtoid = ?", 
      [id]
    );

    const imagens = (imagensResult as any[]).map((row) => String(row.id)); 

    res.status(200).json({ ...produto, imagens }); 
  } catch (error) {
    console.error("Erro ao buscar produto por ID:", error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
};

export const getImagemById = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.execute(
      `SELECT ip.Tipo, ip.MimeType, ip.Caminho, id.Dados 
       FROM imagem_produto ip
       LEFT JOIN imagem_dados id ON ip.ID = id.ImagemID
       WHERE ip.ID = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).send('Imagem não encontrada');
    }

    const imagem = rows[0];

    if (imagem.Tipo === 'url') {
      return res.redirect(imagem.Caminho);
    }

    const mimeType = imagem.MimeType && imagem.MimeType.includes('/') ? imagem.MimeType : 'application/octet-stream';
    const dadosImagem = Buffer.isBuffer(imagem.Dados) ? imagem.Dados : Buffer.from(imagem.Dados);

    res.setHeader('Content-Type', mimeType);
    res.send(dadosImagem);

  } catch (error) {
    console.error('Erro ao recuperar imagem:', error);
    res.status(500).send('Erro interno do servidor');
  }
};

export const updateProduto = async (req: Request, res: Response) => {
  const produtoId = req.params.id;
  const connection = await pool.getConnection();

  try {
    const {
      nome,
      preco, 
      status = "Disponível",
      categoria,
      descricao,
    } = req.body;

    console.log('DEBUG (Backend): Conteúdo completo de req.body:', req.body);
    console.log('DEBUG (Backend): Valor de preco recebido (string ANTES do Yup):', preco);

    const imagensExistentesIds: string[] = [];

    if (req.body.imagensExistentes) { 
      if (Array.isArray(req.body.imagensExistentes)) {
        imagensExistentesIds.push(...req.body.imagensExistentes as string[]);
      } else {
        imagensExistentesIds.push(req.body.imagensExistentes as string);
      }
    }

    const novasImagensFiles = req.files && 'imagensNovas' in req.files
      ? (req.files.imagensNovas as Express.Multer.File[])
      : [];

    const validatedData = await produtoSchema.validate({
      nome,
      preco, 
      categoria,
      descricao
    }, { abortEarly: false, stripUnknown: true });

    const precoNumerico = validatedData.preco; 
    console.log('DEBUG: Preço convertido para salvar no DB (APÓS Yup):', precoNumerico);

    const [existingProd]: any = await connection.query(
      "SELECT id FROM Produto WHERE id = ?",
      [produtoId]
    );
    if (existingProd.length === 0) {
      connection.release();
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    const [prodWithSameName]: any = await connection.query(
      "SELECT id FROM Produto WHERE Nome = ? AND id != ?",
      [nome, produtoId]
    );
    if (prodWithSameName.length > 0) {
      connection.release();
      return res.status(400).json({ message: "Já existe outro produto com este nome" });
    }

    await connection.beginTransaction();

    await connection.execute(
      `UPDATE Produto
       SET Nome = ?, Preco = ?, Status = ?, Categoria = ?, Descricao = ?
       WHERE id = ?`,
      [nome, precoNumerico, status, categoria, descricao, produtoId] 
    );

    const [currentImageIdsResult]: any = await connection.execute(
      "SELECT ID FROM imagem_produto WHERE ProdutoID = ?",
      [produtoId]
    );
    const currentImageIds = currentImageIdsResult.map((row: any) => String(row.ID)); 

    console.log("DEBUG (Backend - Update): currentImageIds (do BD):", currentImageIds);
    console.log("DEBUG (Backend - Update): imagensExistentesIds (do frontend):", imagensExistentesIds);

    const idsToRemove = currentImageIds.filter(
      (id: string) => !imagensExistentesIds.includes(id)
    );

    console.log("DEBUG (Backend - Update): IDs a remover:", idsToRemove); 

    if (idsToRemove.length > 0) {
      const placeholders = idsToRemove.map(() => '?').join(',');

      try {
        const [deleteDadosResult]: any = await connection.execute(
          `DELETE FROM imagem_dados WHERE ImagemID IN (${placeholders})`,
          idsToRemove 
        );
        console.log(`DEBUG (Backend): Deletados ${deleteDadosResult.affectedRows} registros de imagem_dados.`);

        const [deleteProdutoResult]: any = await connection.execute(
          `DELETE FROM imagem_produto WHERE ID IN (${placeholders})`,
          idsToRemove 
        );
        console.log(`DEBUG (Backend): Deletados ${deleteProdutoResult.affectedRows} registros de imagem_produto.`);

      } catch (deleteError: any) {
        console.error("ERRO ao deletar imagens:", deleteError);
        throw new Error("Falha ao deletar imagens antigas.");
      }
    }

    if (novasImagensFiles.length > 0) {
      for (const file of novasImagensFiles) {
        const [imgResult]: any = await connection.execute(
          `INSERT INTO imagem_produto (ProdutoID, Caminho, Tipo, MimeType, Tamanho)
           VALUES (?, ?, 'upload', ?, ?)`,
          [produtoId, file.originalname, file.mimetype, file.size]
        );
        const imagemId = imgResult.insertId;

        await connection.execute(
          `INSERT INTO imagem_dados (ImagemID, Dados)
           VALUES (?, ?)`,
          [imagemId, file.buffer]
        );
      }
    }

    const [updatedProd]: any = await connection.query(
      "SELECT id, Nome, Preco, Status, Categoria, Descricao FROM Produto WHERE id = ?",
      [produtoId]
    );

    const [updatedImagesResult]: any = await connection.query(
      "SELECT ID FROM imagem_produto WHERE ProdutoID = ?",
      [produtoId]
    );
    const updatedImages = updatedImagesResult.map((row: any) => String(row.ID));

    res.status(200).json({
      message: "Produto atualizado com sucesso!",
      produto: {
        id: updatedProd[0].id,
        nome: updatedProd[0].Nome,
        preco: parseFloat(updatedProd[0].Preco), 
        status: updatedProd[0].Status,
        categoria: updatedProd[0].Categoria,
        descricao: updatedProd[0].Descricao,
        imagens: updatedImages,
      },
    });

  } catch (error: any) {
    await connection.rollback();
    if (error instanceof Yup.ValidationError) {
      const errors: Record<string, string> = {};
      error.inner.forEach(err => {
        if (err.path) errors[err.path] = err.message;
      });
      res.status(400).json({ message: "Erro de validação", errors });
    } else {
      console.error("Erro ao atualizar produto:", error);
      res.status(500).json({ message: "Erro ao atualizar produto", error: error.message });
    }
  } finally {
    connection.release();
  }
};

export const deleteProduto = async (req: Request, res: Response) => {
  try {
    const produtoId = req.params.id;

    const [existingProd]: any = await pool.query(
      "SELECT id FROM Produto WHERE id = ?",
      [produtoId]
    );

    if (existingProd.length === 0) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    await pool.query("DELETE FROM Produto WHERE id = ?", [produtoId]);

    res.status(200).json({ message: "Produto deletado com sucesso", produtoId });
  } catch (error: any) {
    console.error("Erro ao deletar produto:", error);
    res.status(500).json({ message: "Erro ao deletar produto", error: error.message });
  }
};