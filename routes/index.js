var express = require('express');
var router = express.Router();
const Message = require('../models/messages');
const { checkBody } = require('../modules/checkBody');
const { 
  sendContactNotification, 
  sendConfirmationEmail, 
  sendTestEmail, 
  testConnection 
} = require('../services/emailService');
const { messageRateLimit } = require('../modules/rateLimitConfig');


/* GET home page */
router.get('/', function(req, res, next) {
  res.json({ 
    message: 'Portfolio Backend API', 
    endpoints: {
      'GET /all': 'Récupérer tous les messages',
      'POST /message': 'Envoyer un nouveau message',
      'GET /test-email': 'Tester l\'envoi d\'email',
      'GET /test-email-config': 'Tester la configuration email'
    }
  });
});

/* GET all messages*/
router.get('/all', async (req, res) => {
  try {
    const allMessages = await Message.find().sort({ createdAt: -1 }); //Trie du plus récent au plus ancien
    if (!allMessages || allMessages.length === 0) {
      console.log('Aucun message récupéré');
      return res.json({ result: true, allMessages: []});
    }
    console.log(`${allMessages.length} messages récupérés`);
    res.json({result: true, allMessages});
  } catch(error) {
    console.error('Erreur récupération message', error);
    res.status(500).json({ result: false, message: 'Erreur serveur' });
  }
});

/* POST message */
router.post('/message', messageRateLimit, async (req, res) =>{
  try {
    // Validation des champs
    if (!checkBody(req.body, ['lastname', 'firstname', 'email', 'messages'])) {
      console.log('Requete reçu avec body => : ', req.body);
      return res.status(400).json({ 
        result: false, 
        message: 'Tous les champs sont obligatoires' 
      });
    };

    // Validation format email
    const emailRegex =/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({ 
        result: false, 
        message: 'Format d\'email invalide' 
      });
    }

    // Validation longueur message
    if (req.body.messages.lenght > 200) {
      return res.status(400).json({
        result: false,
        message: 'Message trop long (max 200 caractères)'
      });
    }

    // Nettoyage des données
    const cleanData = {
      lastname: req.body.lastname.trim(),
      firstname: req.body.firstname.trim(),
      email: req.body.email.trim().toLowerCase(),
      messages: req.body.messages.trim()
    };

    //Recherche contact existant
    const existContact = await Message.findOne({email: { $regex: new RegExp(req.body.email, 'i') }});

    let savedMessage;
    let isNewContact = false;

    if (!existContact) {
      console.log('🆕 Création d\'un nouveau contact');
      isNewContact = true;
      
      const newMessage = new Message({
        lastname: cleanData.lastname,
        firstname: cleanData.firstname,
        email: cleanData.email,
        messages: [{ content: cleanData.messages }]
      })
    
      // Sauvegare en base de données
      savedMessage = await newMessage.save();
      console.log('Nouveau message sauvegardé');
    } else {
      console.log('Ajout message à un contact existant');
       existContact.messages.push({ 
        content: cleanData.messages,
        date: new Date() 
      });

      savedMessage = await existContact.save();
      console.log('Message ajouté au contact existant');
    }

     // Envoi des emails (asynchrone - ne bloque pas la réponse)
    sendContactNotification(cleanData, isNewContact);
    sendConfirmationEmail(cleanData);

    // Réponse succès
    res.json({ 
      result: true, 
      response: isNewContact ? 'Nouveau contact créé' : 'Message ajouté',
      messageId: savedMessage._id
    });

  } catch(error) {
    console.error('Erreur MongoDb : ', error);
      res.status(500).json({ result: false, message: 'Erreur serveur lors de la sauvegarde'});
  }
     
});

/* Routes de test email */
router.get('/test-email', async (req, res) => {
  try {
    const success = await sendTestEmail();
    res.json({ 
      result: success, 
      message: success ? 'Email de test envoyé' : 'Erreur envoi email' 
    });
  } catch (error) {
    res.json({ result: false, error: error.message });
  }
});

router.get('/test-email-config', async (req, res) => {
  try {
    const isValid = await testConnection();
    res.json({ 
      result: isValid, 
      message: isValid ? 'Configuration email valide' : 'Configuration email invalide' 
    });
  } catch (error) {
    res.json({ result: false, error: error.message });
  }
});

module.exports = router;
