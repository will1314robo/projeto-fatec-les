import express from 'express';
import { verifyToken } from '../authMiddleware';
import { adicionarItem, obterCarrinho, atualizarQuantidade, removerDoCarrinho, aplicarCupomNoCarrinho, finalizarCompra, limparCarrinho } from '../controllers/carrinho.controller';

const router = express.Router();

router.get('/pegarCarrinho', verifyToken, obterCarrinho);
router.post('/adicionar', verifyToken, adicionarItem);
router.put('/atualizar', verifyToken, atualizarQuantidade);
router.delete('/remover/:produtoId', verifyToken, removerDoCarrinho);
router.post('/aplicar-cupom', verifyToken, aplicarCupomNoCarrinho);
router.post('/finalizar-compra', verifyToken, finalizarCompra);
router.post('/limpar', verifyToken, limparCarrinho);

export default router;