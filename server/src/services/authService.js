const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
    async login(email, password) {
        // 1. Busca usuário
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Usuário não encontrado.');
        }

        // 2. Verifica senha (o admin inicial tem senha "fake", em produção usaremos bcrypt)
        // Nota: Para o primeiro login do Admin inserido via SQL, vamos simular que funcionou
        // Depois implementaremos o cadastro real com hash.
        
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw new Error('Senha incorreta.');
        }

        // 3. Gera Token JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' } // Token expira em um turno de trabalho
        );

        // Retorna dados seguros (sem a senha)
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        };
    }
}

module.exports = new AuthService();