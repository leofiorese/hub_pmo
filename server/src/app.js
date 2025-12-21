const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' }); // Ajuste o caminho se necessário

const authRoutes = require('./routes/authRoutes'); // <--- Importe aqui
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes); // <--- Use aqui
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.json({ message: '🚀 PMO Hub Backend está online!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🔥 Servidor rodando na porta ${PORT}`);
});