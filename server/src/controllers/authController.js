const authService = require('../services/authService');

class AuthController {
    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
            }

            const result = await authService.login(email, password);
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
}

module.exports = new AuthController();