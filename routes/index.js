var express = require('express');
var router = express.Router();
const Message = require('../models/messages');
const { checkBody } = require('../modules/checkBody')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* POST message */
router.post('/message', (req, res) =>{
  if (!checkBody(req.body, ['lastname', 'firstname', 'email', 'messages'])) {
    console.log('Requete reçu avec body => : ', req.body);
    res.status(400).json({ result: false, message: 'Tous les champs sont obligatoires' });
    return;
  };
  Message.findOne({email: { $regex: new RegExp(req.body.email, 'i') }})
  .then(data => {
    if (!data) {
      console.log('Pas de correspondance')
      //Creation du message
      const newMessage = new Message({
        lastname: req.body.lastname,
        firstname: req.body.firstname,
        email: req.body.email,
        messages: [{content: req.body.messages}]
      });
     
      // Sauvegare en base de données
      newMessage.save()
        .then(() => {
          return Message.find(); // On retourne la promesse pour éviter un doublon de réponse
        })
        .then(messages => {
          res.json({ result: true, response: 'Nouveau contact', messages })
        })
    } else {
      console.log('Message =>', data.messages)
      data.messages.push({content: req.body.messages});

      return data.save()
      .then(updateMessage => {
      res.json({result: true, response: 'Message d\'un ancien contact', messages: updateMessage})

      })

    }

    // console.log('same lastname =>', data);
  })
  
    .catch(error => {
      console.error('Erreur MongoDb : ', error);
      res.status(500).json({ message: 'Erreur serveur'});
    })
});

module.exports = router;
