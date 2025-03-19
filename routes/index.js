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
  if (!checkBody(req.body, ['lastname', 'firstname', 'email', 'message'])) {
    console.log('Requete reçu avec body => : ', req.body);
    res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    return;
  };

  //Creation du message
  const newMessage = new Message({
    lastname: req.body.lastname,
    firstname: req.body.firstname,
    email: req.body.email,
    message: req.body.message,
  });
  // Sauvegare en base de données
  newMessage.save()
    .then(() => {
      return Message.find(); // On retourne la promesse pour éviter un doublon de réponse
    })
    .then(messages => {
      res.json({ result: true, messages })
    })
    .catch(error => {
      console.error('Erreur MongoDb : ', error);

      res.status(500).json({ message: 'Erreur serveur'});
    })
});

module.exports = router;
