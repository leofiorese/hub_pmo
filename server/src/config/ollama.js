const axios = require('axios');
const path = require('path');
// Garante o carregamento do .env com caminho absoluto, assim como fizemos no app.js
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';

console.log(`[Ollama Config] Conectando em: ${ollamaUrl}`);

const ollamaClient = axios.create({
    baseURL: ollamaUrl
});

module.exports = ollamaClient;
