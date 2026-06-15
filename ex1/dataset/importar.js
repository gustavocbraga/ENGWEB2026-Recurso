const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Opera = require('../models/operas');

const mongoURI = process.env.MONGO_URI || 'mongodb://mongodb:27017/operas_db';

async function importar() {
    try {
        await mongoose.connect(mongoURI);
        const jsonPath = path.join(__dirname, 'operas_normalized.json');
        
        if (!fs.existsSync(jsonPath)) {
            print("⚠️ Ficheiro operas_normalized.json não encontrado. Ignorando.");
            process.exit(0);
        }

        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        await Opera.deleteMany({});
        await Opera.insertMany(data);
        console.log(`🚀 ${data.length} óperas importadas com sucesso na BD 'operas_db'!`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Erro na importação:", err);
        process.exit(1);
    }
}

importar();