const Planta = require("../models/plantas");

// GET /api/plantas (com suporte opcional a ?search=X)
function getAll(query) {
  let filter = {};
  if (query.search) {
    filter.$or = [
      { nome: new RegExp(query.search, "i") },
      { especie: new RegExp(query.search, "i") }
    ];
  }
  return Planta.find(filter).exec();
}

// POST /api/plantas
function create(plantaData) {
  const novoObjeto = {
    nome: plantaData.nome,
    especie: plantaData.especie,
    diasRega: plantaData.diasRega ? parseInt(plantaData.diasRega, 10) : 0,
    necessidadeLuz: plantaData.necessidadeLuz,
    regadaRecentemente: plantaData.regadaRecentemente !== undefined ? plantaData.regadaRecentemente : false
  };
  return Planta.create(novoObjeto);
}

// PUT /api/plantas/:id — altera o estado booleano regadaRecentemente
function updateStatus(id, regadaStatus) {
  return Planta.findByIdAndUpdate(
    id,
    { regadaRecentemente: regadaStatus },
    { new: true }
  ).exec();
}

// DELETE /api/plantas/:id
function remove(id) {
  return Planta.findByIdAndDelete(id).exec();
}

module.exports = {
  getAll,
  create,
  updateStatus,
  remove
};