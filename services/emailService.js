const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true pour 465, false pour autres ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
})


const sendContactNotification = async (messageData, isNewContact) => {
     try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER,
            subject: `Nouveau message portfolio - ${messageData.firstname} ${messageData.lastname}`,
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                        ${isNewContact ? '🆕 Nouveau contact' : '💬 Nouveau message'}
                    </h2>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #495057;">Informations du contact :</h3>
                        <p><strong>Nom :</strong> ${messageData.lastname}</p>
                        <p><strong>Prénom :</strong> ${messageData.firstname}</p>
                        <p><strong>Email :</strong> <a href="mailto:${messageData.email}">${messageData.email}</a></p>
                        <p><strong>Type :</strong> ${isNewContact ? 'Premier contact' : 'Contact existant'}</p>
                    </div>
                    
                    <div style="background: #fff; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0; border-radius: 4px;">
                        <h3 style="margin-top: 0; color: #495057;">Message :</h3>
                        <p style="font-style: italic; line-height: 1.6; color: #6c757d;">"${messageData.messages}"</p>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px;">
                        <p>📅 Reçu le : ${new Date().toLocaleString('fr-FR')}</p>
                        <p>🌐 Depuis : Portfolio Wali Sylla</p>
                    </div>
                </div>` // Template HTML
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email de notification envoyé avec succès', result.messageId);
    return true;
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return false;
  }
};

// Mail de confirmation

const sendConfirmationEmail = async (messageData) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: messageData.email,
            subject: 'Message reçu - Portfolio Wali Sylla',
            html: `
                <div>
            <h2>Merci pour votre message !</h2>
            <p>Bonjour ${messageData.firstname},</p>
            <p>J'ai bien reçu votre message et je vous répondrai dans les plus brefs délais.</p>
            
            <div>
                <p><strong>Votre message :</strong></p>
                <p>"${messageData.messages}"</p>
            </div>
            
            <p>À bientôt !</p>
            <p><strong>Wali Sylla</strong><br>Développeur Web Full Stack</p>
            </div>
        `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Email de confirmation envoyé avec succès: ', result.messageId);
        return true;
    } catch (error) {
        console.error('Erreur envoi email de confirmation: ', error);
        return false;
    }
};

// Fonction de test
const sendTestEmail = async () => {
  try {
    const testData = {
      firstname: 'Test',
      lastname: 'User',
      email: 'test@example.com',
      messages: 'Ceci est un email de test'
    };

    return await sendContactNotification(testData, true);
  } catch (error) {
    console.error('❌ Erreur email de test:', error);
    return false;
  }
};

// Test de configuration
const testConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Configuration email valide');
    return true;
  } catch (error) {
    console.error('❌ Erreur configuration email:', error);
    return false;
  }
};

module.exports = {
  sendContactNotification,
  sendConfirmationEmail,
  sendTestEmail,
  testConnection
};