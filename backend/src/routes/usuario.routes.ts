import { Router } from "express";
import { createUsuario, getUsuarioLogado, alterarSenha, atualizarUsuario, getTotalUsuarios, resetarSenhaComCredenciais } from "../controllers/usuario.controller";
import { verifyToken } from "../authMiddleware";
import { loginAdmin } from "../controllers/admin.controller";

const router = Router();

router.post("/usuario", createUsuario);
router.get("/usuario/me", verifyToken, getUsuarioLogado);
router.post("/admin/login", loginAdmin);
router.put("/usuario/senha", verifyToken, alterarSenha);
router.get("/perfil", verifyToken, getUsuarioLogado);
router.put("/perfil", verifyToken, atualizarUsuario);
router.get("/usuariototal", verifyToken, getTotalUsuarios);
router.post('/usuario/resetar-senha', resetarSenhaComCredenciais);
  
export default router;
