const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Planta = require('../models/plantas');

// Usa MONGODB_URI (igual à API) — definida no docker-compose
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/plantas_db';

async function importar() {
  try {
    await mongoose.connect(mongoURI);
    console.log("✅ [Importador] Ligado ao MongoDB com sucesso.");

    const jsonPath = path.join(__dirname, 'plantas.json');

    if (!fs.existsSync(jsonPath)) {
      console.log("⚠️ Ficheiro plantas.json não encontrado. Ignorando importação.");
      process.exit(0);
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    await Planta.deleteMany({});
    console.log("🧹 Coleção limpa.");

    await Planta.insertMany(data);
    console.log(`🚀 ${data.length} plantas importadas com sucesso!`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Erro na importação:", err);
    process.exit(1);
  }
}

importar();