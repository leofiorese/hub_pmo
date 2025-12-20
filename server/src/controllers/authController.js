const authService = require('../services/authService');

class AuthController {
    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
            }

            const result = await authService.authenticate(email, password);
            return res.json(result);

        } catch (error) {
            // Se for erro de negócio (senha errada), retorna 401
            if (error.message === 'Usuário não encontrado.' || error.message === 'Senha incorreta.') {
                return res.status(401).json({ error: 'Credenciais inválidas.' });
            }
            console.error(error);
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    }
    async register(req, res) {
        try {
            const user = await authService.registerUser(req.body);
            return res.status(201).json(user);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    // NOVO: Esqueceu a senha
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const result = await authService.sendRecoveryEmail(email);
            return res.json(result);
        } catch (error) {
            // Em forgot password, evitamos dar muito detalhe de erro por segurança
            return res.status(500).json({ error: 'Erro ao processar solicitação.' });
        }
    }

    // NOVO: Resetar senha (usando o token)
    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            const result = await authService.resetPassword(token, newPassword);
            return res.json(result);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new AuthController();