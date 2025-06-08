import pool from "../database/connection";
import { gerarCupomAniversario } from "../services/cupomService";
import { enviarEmailAniversario } from "../services/emailService";

export const enviarCuponsAniversarioMensal = async () => {
  const hoje = new Date();
  const mes = hoje.getMonth() + 1; 
  const ano = hoje.getFullYear();
  const mesAno = `${ano}-${String(mes).padStart(2, '0')}`;

  console.log(`[${new Date().toISOString()}] - Iniciando job de envio de cupons de aniversário para o mês ${mesAno}.`);

  try {
    const [processado]: any = await pool.query(
      "SELECT 1 FROM envioaniversariantes WHERE mes_ano = ? LIMIT 1",
      [mesAno]
    );

    if (processado.length > 0) {
      console.log(`[${new Date().toISOString()}] - Job abortado: Cupons para ${mesAno} já foram enviados (registrado em 'envioaniversariantes').`);
      return { success: false, message: "Cupons deste mês já foram enviados" };
    }

    const [usuarios]: any = await pool.query(
      `SELECT ID, Nome, Email 
       FROM Usuario 
       WHERE MONTH(DataNasc) = ? 
       AND Email IS NOT NULL
       AND Perfil = 'Cliente'`, 
      [mes]
    );

    console.log(`[${new Date().toISOString()}] - Encontrados ${usuarios.length} aniversariantes para o mês.`);

    let sucessos = 0;
    for (const usuario of usuarios) {
      try {
        const cupom = await gerarCupomAniversario(usuario.ID); 
        await enviarEmailAniversario(usuario, cupom);
        sucessos++;
        console.log(`[${new Date().toISOString()}] - Cupom gerado e e-mail enviado para ${usuario.Email} (ID: ${usuario.ID}).`);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] - ERRO ao processar usuário ${usuario.ID} (${usuario.Email}):`, error);
      }
    }

    await pool.query(
      "INSERT INTO envioaniversariantes (mes_ano, data_envio) VALUES (?, NOW())",
      [mesAno]
    );
    
    console.log(`[${new Date().toISOString()}] - Job de cupons de aniversário concluído para ${mesAno}. Total de aniversariantes: ${usuarios.length}, Sucessos: ${sucessos}.`);

    return {
      success: true,
      enviados: sucessos,
      total: usuarios.length,
      mesAno
    };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] - ERRO CRÍTICO no job de cupons de aniversário para o mês ${mesAno}:`, error);
    return { success: false, message: "Erro interno no job de envio de cupons." };
  }
};

export const enviarCupomAniversarioManualmente = async (req: any, res: any) => {
  const { usuarioId } = req.body; 

  if (!usuarioId) {
    return res.status(400).json({ success: false, message: "ID do usuário é necessário." });
  }

  try {
    const [usuarios]: any = await pool.query(
      `SELECT ID, Nome, Email FROM Usuario WHERE ID = ? AND Perfil = 'Cliente' AND Email IS NOT NULL`,
      [usuarioId]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado ou não elegível para cupom (verifique perfil/e-mail)." });
    }

    const usuario = usuarios[0];

    const [existingCouponToday]: any = await pool.query(
      `SELECT 1 FROM Cupons WHERE Usuario_ID = ? AND Tipo = 'Aniversario' AND DATE(DataCriacao) = CURDATE()`,
      [usuario.ID]
    );

    if (existingCouponToday.length > 0) {
      return res.status(409).json({ success: false, message: `Cupom de aniversário já gerado para o usuário ${usuario.Nome} hoje.` });
    }

    const cupom = await gerarCupomAniversario(usuario.ID); 
    await enviarEmailAniversario(usuario, cupom);

    console.log(`[${new Date().toISOString()}] - Cupom de aniversário enviado manualmente para ${usuario.Email} (ID: ${usuario.ID}).`);
    return res.status(200).json({ success: true, message: `Cupom enviado com sucesso para ${usuario.Nome}.` });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] - ERRO ao enviar cupom manualmente para o usuário ${usuarioId}:`, error);
    return res.status(500).json({ success: false, message: "Erro interno do servidor ao enviar cupom manualmente." });
  }
};