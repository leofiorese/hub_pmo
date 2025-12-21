const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // Nativo do Node.js para gerar tokens aleatórios
const jwt = require('jsonwebtoken');

class AuthService {
    // --- LÓGICA DE LOGIN (ADICIONADA E AJUSTADA) ---
    async authenticate(email, password) {
        const user = await userRepository.findByEmail(email);

        if (!user) {
            throw new Error('Usuário ou senha inválidos.');
        }

        // AJUSTE CRÍTICO: Comparamos a senha digitada com 'password_hash' do banco
        // (Se usássemos user.password aqui, daria erro pois essa coluna não existe no select)
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            throw new Error('Usuário ou senha inválidos.');
        }

        // Gera o token JWT
        const token = jwt.sign(
            { 
            id: user.id,      // <--- CERTIFIQUE-SE QUE ESTA LINHA EXISTE
            role: user.role,  // <--- CERTIFIQUE-SE QUE ESTA LINHA EXISTE
            name: user.name 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        // Remove o hash do objeto antes de retornar para o frontend (Segurança)
        const { password_hash, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            token
        };
    }

    // --- LÓGICA DE CADASTRO (MANTIDA) ---
    async registerUser(data) {
        const userExists = await userRepository.findByEmail(data.email);

        if (!data.email.toLowerCase().endsWith('@sandech.com.br')) {
            throw new Error('Acesso negado: Domínio de e-mail não autorizado.');
        }
        
        if (userExists) {
            throw new Error('Este e-mail já está cadastrado.');
        }

        // Criptografa a senha antes de salvar
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // O repositório vai pegar esse 'password' e inserir na coluna 'password_hash'
        const newId = await userRepository.create({
            ...data,
            password: hashedPassword
        });

        return { id: newId, name: data.name, email: data.email };
    }

    // --- LÓGICA DE ESQUECEU A SENHA (MANTIDA) ---
    async sendRecoveryEmail(email) {
        const user = await userRepository.findByEmail(email);
        
        // Segurança: Se o usuário não existe, não retorne erro para não vazar quem tem conta.
        if (!user) {
            return { message: 'Se o e-mail existir, o link foi enviado.' };
        }

        // 1. Gera um token aleatório e seguro
        const token = crypto.randomBytes(20).toString('hex');

        // 2. Define expiração (1 hora a partir de agora)
        const now = new Date();
        now.setHours(now.getHours() + 1);

        // 3. Salva no banco
        await userRepository.saveResetToken(email, token, now);

        // 4. ENVIO DE E-MAIL (SIMULADO)
        const resetLink = `http://localhost:5173/reset-password?token=${token}`;
        
        console.log('==================================================');
        console.log('📧 [EMAIL MOCK] Para:', email);
        console.log('🔗 Link de Recuperação:', resetLink);
        console.log('==================================================');

        return { message: 'Link de recuperação enviado (verifique o console).' };
    }

    // --- LÓGICA DE REDEFINIR A SENHA (MANTIDA) ---
    async resetPassword(token, newPassword) {
        const user = await userRepository.findByToken(token);
        if (!user) {
            throw new Error('Token inválido ou expirado.');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await userRepository.updatePassword(user.id, hashedPassword);
        
        return { message: 'Senha alterada com sucesso.' };
    }
}

module.exports = new AuthService();