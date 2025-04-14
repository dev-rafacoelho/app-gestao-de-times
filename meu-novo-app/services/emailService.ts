import formData from 'form-data';
import Mailgun from 'mailgun.js';
import 'dotenv/config';

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
  url: 'https://api.mailgun.net/v3/',
});

export const enviarCodigoRecuperacao = async (email: string, codigo: string) => {
  try {
    const data = {
      from: `Recuperação de Senha <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to: email,
      subject: 'Código de Recuperação de Senha',
      text: `Seu código de recuperação de senha é: ${codigo}\n\nEste código é válido por 10 minutos.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4c669f;">Recuperação de Senha</h2>
          <p>Olá,</p>
          <p>Recebemos uma solicitação para recuperar sua senha. Use o código abaixo para continuar:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #4c669f; margin: 0; font-size: 32px;">${codigo}</h1>
          </div>
          <p>Este código é válido por 10 minutos.</p>
          <p>Se você não solicitou esta recuperação, por favor ignore este e-mail.</p>
          <p>Atenciosamente,<br>Equipe de Suporte</p>
        </div>
      `
    };

    await mg.messages.create(process.env.MAILGUN_DOMAIN || '', data);
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw new Error('Não foi possível enviar o e-mail de recuperação');
  }
}; 