const mongoose = require('mongoose');

const messagesSchema = mongoose.Schema({
    content: { type: String, required: true}, // contenu du message
    date: { type: Date, default: Date.now}, // Date d'envoi du message
})

const UserSchema = mongoose.Schema({
    lastname: String,
    firstname: String,
    email: String,
    messages: [messagesSchema],
    createdAt: { type: Date, default: Date.now}, // Date de création du message, default: Date.now signifie que la date actuelle sera utilisée si aucune date n'est fournie
    read: { type: Boolean, default: false } // Permet de savoir si le message a été lu ou non
});

const Message = mongoose.model('messages', UserSchema);

module.exports = Message;