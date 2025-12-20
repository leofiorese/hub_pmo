const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' }); // Aponta para o .env na raiz do server

const app = express();

app.use(cors());
app.use(express.json());

// Rota de Teste (Health Check)
app.get('/', (req, res) => {
    res.json({ message: '🚀 PMO Hub Backend está online!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🔥 Servidor rodando na porta ${PORT}`);
});