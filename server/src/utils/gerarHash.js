const bcrypt = require('bcryptjs');
// Gera o hash de 'admin123'
const hash = bcrypt.hashSync('admin123', 10);
console.log(hash);