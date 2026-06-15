const mongoose = require('mongoose');

const compositorSchema = new mongoose.Schema({
  id: String,
  name: String
}, { _id: false });

const teatroSchema = new mongoose.Schema({
  id: String,
  name: String,
  country: String
}, { _id: false });

const ariaSchema = new mongoose.Schema({
  id: String,
  name: String,
  voiceType: String
}, { _id: false });

const operaSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  id: String,
  title: { type: String, required: true },
  genre: String,
  premiereYear: Number,
  runtimeMinutes: Number,
  descriptionEN: String,
  compositor: compositorSchema,
  teatro: teatroSchema,
  arias: [ariaSchema],
  cantores: [String] // Array de strings com os nomes dos cantores baseado no exemplo do PDF
}, { versionKey: false });

module.exports = mongoose.model('opera', operaSchema, 'operas'); // Força a coleção 'operas'