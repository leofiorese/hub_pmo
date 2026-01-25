const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });

// Imports das Rotas
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const linkRoutes = require('./routes/linkRoutes'); // <--- VERIFIQUE ESTA LINHA
const profileRoutes = require('./routes/profileRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes'); // [NEW] Analytics

const app = express();

app.use(cors());
app.use(express.json());

// Definição das Rotas (Mounting)
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); // Cria as rotas /api/admin/...
app.use('/api/links', linkRoutes);  // Cria as rotas /api/links/... <--- VERIFIQUE ESTA LINHA
app.use('/api/profile', profileRoutes);
app.use('/api/analytics', analyticsRoutes); // [NEW] Analytics Routes

app.get('/', (req, res) => {
    res.json({ message: '🚀 PMO Hub Backend está online!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🔥 Servidor rodando na porta ${PORT}`);
    console.log(`📡 Rotas de Links ativas em /api/links`);
    console.log(`🛡️ Rotas de Admin ativas em /api/admin`);
});