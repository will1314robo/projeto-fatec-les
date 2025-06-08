import cron from "node-cron";
import { enviarCuponsAniversarioMensal } from "../controllers/cupom.controller";

export const iniciarAgendadorCupons = () => {
  cron.schedule('0 3 * * *', async () => {
    const hoje = new Date();
    
    if (hoje.getDate() === 6) {
      try {
        console.log(`Iniciando envio de cupons mensais em ${hoje.toISOString()}`);
        const resultado = await enviarCuponsAniversarioMensal();
        console.log("Resultado do envio:", resultado);
      } catch (error) {
        console.error("Erro no agendador de cupons:", error);
      }
    }
  }, {
    timezone: "America/Sao_Paulo"
  });
};