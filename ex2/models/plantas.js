const mongoose = require("mongoose");
 
const plantaSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  especie: {
    type: String,
    required: true
  },
  diasRega: {
    type: Number,
    required: true
  },
  necessidadeLuz: {
    type: String,
    enum: ["Sombra", "Luz Indireta", "Sol Direto"],
    required: true
  },
  regadaRecentemente: {
    type: Boolean,
    default: false
  }
}, {
  versionKey: false
});
 
module.exports = mongoose.model("plantas", plantaSchema);