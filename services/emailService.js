const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})
//Protection anti-spam
const messageRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, //15 minutes
    max: 3, // Max 3 messages par IP toutes les 15 minutes
    message: { result: false, message: 'Trop de message envoyés. Réessayez dans 15 minutes.'},
    standardHeaders: true,
    legacyHeaders: false,
});

const sendContactNotification = async (messageData, isNewContact) => {
     try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER,
            subject: `Nouveau message portfolio - ${messageData.firstname} ${messageData.lastname}`,
            html: `...` // Template HTML
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