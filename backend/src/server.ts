import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import path from 'path';

import cupomRoutes from "./routes/cupom.routes";
import produtoRoutes from "./routes/produto.routes"; 
import usuarioRoutes from "./routes/usuario.routes";
import authRoutes from "./routes/authRoutes";
import { loginAdmin } from "./controllers/admin.controller";
import { getImagemById } from "./controllers/produto.controller";
import carrinhoRoutes from "./routes/carrinho.routes";
import { verifyToken } from "./authMiddleware";
import pedidoRoutes from "./routes/pedido.routes";
import chamadoRoutes from "./routes/chamado.routes";
import { iniciarAgendadorCupons } from "./services/scheduleService";
import { enviarCuponsAniversarioMensal } from "./controllers/cupom.controller";

dotenv.config();

const app = express();
const uploadPath = path.join(__dirname, '..', 'uploads');

app.use(cors({
  origin: "http://localhost:3000",  
}));
app.use(express.json());  

app.get("/", (req, res) => {
  res.send("Servidor rodando!");
});
app.use(chamadoRoutes);
app.use(pedidoRoutes);
app.use('/carrinho', verifyToken, carrinhoRoutes);
app.use('/uploads', express.static(uploadPath));
app.use("/usuarios", usuarioRoutes); 
app.use("/auth", authRoutes);
app.use("/alterar-senha", authRoutes);
app.use("/produtos", produtoRoutes);
app.use("/aniversario", cupomRoutes);
app.get('/imagens/:id', getImagemById);
app.post("/admin/login", loginAdmin); 
app.get("/minha-conta", (req, res) => {
  const authHeader = req.headers.authorization;

  if (authHeader === "Bearer fake-jwt-token") {
    return res.json({
      nome: "Maria Oliveira",
      cpfOuCnpj: "987.654.321-00",
      dataNascimento: "1988-09-25",
    });
  }

  res.status(401).json({ error: "Token inválido" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  iniciarAgendadorCupons();
    console.log('Agendador de cupons iniciado.');
  (async () => {
    console.log('Executando envio de cupons de aniversário IMEDIATAMENTE (uma única vez na inicialização)...');
    try {
      const resultado = await enviarCuponsAniversarioMensal();
      console.log("Resultado da execução imediata:", resultado);
    } catch (error) {
      console.error("Erro na execução imediata do job de cupons:", error);
    }
  })();
});
