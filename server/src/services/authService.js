const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

class AuthService {
    // --- LÓGICA DE LOGIN ---
    async authenticate(email, password) {
        const user = await userRepository.findByEmail(email);

        if (!user) {
            throw new Error('Usuário ou senha inválidos.');
        }

        // --- NOVO: VERIFICA SE O USUÁRIO ESTÁ APROVADO ---
        // Se a coluna 'approved' for 0 (false), bloqueia o acesso.
        // Nota: O banco retorna 0 ou 1, que o JS trata como false/true.
        if (!user.approved) {
            throw new Error('Cadastro pendente de aprovação pelo Administrador.');
        }
        // -------------------------------------------------

        // Compara senha com o hash do banco
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            throw new Error('Usuário ou senha inválidos.');
        }

        // Gera o token JWT
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
                name: user.name
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const { password_hash, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            token
        };
    }

    // --- LÓGICA DE CADASTRO ---
    async registerUser(data) {
        const userExists = await userRepository.findByEmail(data.email);

        if (!data.email.toLowerCase().endsWith('@sandech.com.br')) {
            throw new Error('Acesso negado: Domínio de e-mail não autorizado.');
        }

        if (userExists) {
            throw new Error('Este e-mail já está cadastrado.');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Ao criar, o banco de dados usará o DEFAULT FALSE na coluna approved
        // Então o usuário nasce "pendente" automaticamente.
        const newId = await userRepository.create({
            ...data,
            password: hashedPassword
        });

        return { id: newId, name: data.name, email: data.email };
    }

    // --- LÓGICA DE ESQUECEU A SENHA ---
    async sendRecoveryEmail(email) {
        const user = await userRepository.findByEmail(email);

        if (!user) {
            return { message: 'Se o e-mail existir, o link foi enviado.' };
        }

        const token = crypto.randomBytes(20).toString('hex');
        const now = new Date();
        now.setHours(now.getHours() + 1);

        await userRepository.saveResetToken(email, token, now);

        const resetLink = `http://localhost:5173/reset-password?token=${token}`;

        console.log('==================================================');
        console.log('📧 [EMAIL MOCK] Para:', email);
        console.log('🔗 Link de Recuperação:', resetLink);
        console.log('==================================================');

        return { message: 'Link de recuperação enviado (verifique o console).' };
    }

    // --- LÓGICA DE REDEFINIR A SENHA ---
    async resetPassword(token, newPassword) {
        const user = await userRepository.findByToken(token);
        if (!user) {
            throw new Error('Token inválido ou expirado.');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await userRepository.updatePassword(user.id, hashedPassword);

        return { message: 'Senha alterada com sucesso.' };
    }

    // --- NOVO: BUSCAR USUÁRIO POR ID (Chamado pelo getMe) ---
    async getUserById(id) {
        const user = await userRepository.findById(id);
        if (!user) return null;

        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

module.exports = new AuthService();