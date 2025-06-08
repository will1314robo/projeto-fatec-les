import nodemailer from "nodemailer";
import pool from "../database/connection";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "sgwcraft777@gmail.com",
    pass: process.env.EMAIL_PASS || "nkzj cfmk cbtw xwhd",
  },
});

export const enviarEmailAniversario = async (usuario: any, cupom: string) => {
  const dataAtual = new Date();
  const ultimoDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);
  
  const formatoData = (date: Date) => 
    date.toLocaleDateString('pt-BR'); 

  const mailOptions = {
    to: usuario.Email,
    subject: `🎁 ${usuario.Nome}, seu presente de aniversário!`,
    html: `
      <h2>Parabéns, ${usuario.Nome}!</h2>
      <p>Como nosso presente especial, aqui está seu cupom exclusivo:</p>
      <div style="font-size: 24px; font-weight: bold; margin: 20px 0;">
        ${cupom}
      </div>
      <p>Valor: <strong>10% de desconto</strong></p>
      <p>Válido até: <strong>${formatoData(ultimoDiaMes)}</strong></p>
      <a href="https://seusite.com/resgatar?cupom=${cupom}" 
         style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none;">
        Resgatar Agora
      </a>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(`Falha no envio para ${usuario.Email}:`, error);
    return false;
  }
};

export const verificarEnvioMensal = async (mesAno: string): Promise<boolean> => {
  try {
    const [rows]: any = await pool.query(
      "SELECT 1 FROM EnvioAniversariantes WHERE mes_ano = ?",
      [mesAno]
    );
    return rows.length > 0;
  } catch (error) {
    console.error("Erro ao verificar envio mensal:", error);
    return true; 
  }
};

export const registrarEnvioMensal = async (mesAno: string, quantidade: number) => {
  try {
    await pool.query(
      "INSERT INTO EnvioAniversariantes (mes_ano, data_envio, quantidade) VALUES (?, NOW(), ?)",
      [mesAno, quantidade]
    );
  } catch (error) {
    console.error("Erro ao registrar envio mensal:", error);
  }
};