import { Router } from 'express';
import { verifyToken } from '../authMiddleware';
import { getPedidos, getPedidosMensais, getTotalPedidos, updatePedido } from '../controllers/pedido.controller'; 

const router = Router();

router.get('/pedidos', verifyToken, getPedidos);
router.get('/vendas/total', verifyToken, getTotalPedidos);
router.get('/pedidos/usuario/:id', verifyToken, getPedidos);
router.get('/vendas/mensais', verifyToken, getPedidosMensais);
router.put('/pedidos/:id', verifyToken, updatePedido);

export default router;