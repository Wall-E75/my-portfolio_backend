require("dotenv").config();
require("./models/connection"); // Fichier de connection à la BDD très important

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const cors = require('cors');

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        "http://localhost:3001", 
        "http://localhost:3000", 
        "http://127.0.0.1:3000", 
        "http://0.0.0.0:3001", 
        "https://my-portfolio-backend-sage.vercel.app", 
        "https://sylladev.vercel.app"
    ];

const corsOptions = {
    origin: function (origin, callback) {
        console.log('Requête reçue depuis :', origin);
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            console.log('Origine refusée par CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
}

app.use(cors(corsOptions)); // On ajoute cors à notre application
app.options("*", cors(corsOptions)); // Gère explixitement les requêtes OPTIONS (important sur Vercel)

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
