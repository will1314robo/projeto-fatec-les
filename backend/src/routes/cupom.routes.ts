import express from "express";
import { enviarCupomAniversarioManualmente, enviarCuponsAniversarioMensal } from "../controllers/cupom.controller";

const router = express.Router();

router.get("/cupom", enviarCuponsAniversarioMensal);
router.post('/admin/enviar-cupom-manual', enviarCupomAniversarioManualmente);

export default router;