import { Router } from 'express';
import { getChamados, createChamado, getChamadoById, deleteChamado } from '../controllers/chamado.controller';
import { verifyToken } from '../authMiddleware';

const router = Router();

router.get('/chamados', verifyToken, getChamados);
router.post('/chamados', verifyToken, createChamado); 
router.get('/chamados/:id', verifyToken, getChamadoById); 
router.delete('/chamados/:id', verifyToken, deleteChamado);

export default router;