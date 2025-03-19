const mongoose = require('mongoose');

const messagesSchema = mongoose.Schema({
    lastname: String,
    firstname: String,
    email: String,
    message: String,
    date: { type: Date, default: Date.now}, // Date de création du message, default: Date.now signifie que la date actuelle sera utilisée si aucune date n'est fournie
    read: { type: Boolean, default: false } // Permet de savoir si le message a été lu ou non
});

const Message = mongoose.model('messages', messagesSchema);

module.exports = Message;