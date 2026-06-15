var express = require('express');
var path = require('path');
var logger = require('morgan');
var cors = require('cors');
var mongoose = require('mongoose');

var indexRouter = require('./routes/index');

var mongoDB = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/plantas_db";
mongoose.connect(mongoDB);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erro de ligação ao MongoDB...'));
db.once('open', () => console.log('Ligação ao MongoDB (Exercício 2) efetuada com sucesso!'));

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);

module.exports = app;