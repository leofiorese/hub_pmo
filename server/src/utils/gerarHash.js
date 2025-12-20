const bcrypt = require('bcryptjs');
// Gera o hash de 'admin123'
bcrypt.hashSync('admin123', 10);