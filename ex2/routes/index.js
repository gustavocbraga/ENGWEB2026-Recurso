var express = require('express');
var router = express.Router();
var PlantasController = require('../controllers/plantas');

/* GET /api/plantas */
router.get('/api/plantas', async function(req, res) {
  try {
    const plantas = await PlantasController.getAll(req.query);
    res.json(plantas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* POST /api/plantas */
router.post('/api/plantas', async function(req, res) {
  try {
    const novaPlanta = await PlantasController.create(req.body);
    res.status(201).json(novaPlanta);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* PUT /api/plantas/:id */
router.put('/api/plantas/:id', async function(req, res) {
  try {
    const atualizada = await PlantasController.updateStatus(req.params.id, req.body.regadaRecentemente);
    if (!atualizada) return res.status(404).json({ message: "Planta não encontrada." });
    res.json(atualizada);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* DELETE /api/plantas/:id */
router.delete('/api/plantas/:id', async function(req, res) {
  try {
    const removida = await PlantasController.remove(req.params.id);
    if (!removida) return res.status(404).json({ message: "Planta não encontrada." });
    res.json({ message: "Removida com sucesso", planta: removida });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;