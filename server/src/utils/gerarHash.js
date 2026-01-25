const bcrypt = require('bcryptjs');
// Gera o hash de 'admin123'
const hash = bcrypt.hashSync('admin12345', 10);
console.log(hash);