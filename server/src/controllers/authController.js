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
            // 1. Erro de Credenciais (401)
            if (error.message === 'Usuário não encontrado.' || error.message === 'Usuário ou senha inválidos.') {
                return res.status(401).json({ error: 'Credenciais inválidas.' });
            }
            
            // 2. NOVO: Erro de Aprovação Pendente (403 Forbidden)
            // Deixa passar a mensagem exata que definimos no Service
            if (error.message === 'Cadastro pendente de aprovação pelo Administrador.') {
                return res.status(403).json({ error: error.message });
            }

            // 3. Outros erros (500)
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

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const result = await authService.sendRecoveryEmail(email);
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao processar solicitação.' });
        }
    }

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