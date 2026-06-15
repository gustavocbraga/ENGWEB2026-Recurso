var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

var swaggerUi = require('swagger-ui-express');
var YAML = require('yamljs');
var swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

// Conexão ao MongoDB (BD: operas_db)
var mongoURI = process.env.MONGO_URI || 'mongodb://mongodb:27017/operas_db';
mongoose.connect(mongoURI)
  .then(() => console.log('✅ Conectado ao MongoDB com sucesso (operas_db)!'))
  .catch(err => console.error('❌ Erro na conexão ao MongoDB:', err));

var operasRouter = require('./routes/operas');

var app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Acoplado na raiz como pedido
app.use('/', operasRouter);

app.get('/', function(req, res) {
  res.redirect('/api-docs');
});

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({ 
    erro: err.message,
    detalhes: req.app.get('env') === 'development' ? err : {} 
  });
});

module.exports = app;