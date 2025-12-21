const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');

class ProfileController {
    // 1. GET /me
    async getMe(req, res) {
        try {
            const user = await userRepository.findById(req.userId);
            if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
            
            // Retorna o objeto user limpo (sem senha)
            const { password_hash, ...userData } = user;
            return res.json(userData);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao buscar perfil' });
        }
    }

    // 2. PUT /me
    async updateMe(req, res) {
        try {
            const { name, email, password } = req.body;
            
            // CORREÇÃO DO ERRO "UNDEFINED":
            // Inicializa password_hash como null (não undefined)
            let password_hash = null; 

            if (password && password.trim() !== '') {
                password_hash = await bcrypt.hash(password, 8);
            }

            // Precisamos garantir que ROLE não seja undefined.
            // Como req.userRole vem do token, ele deve existir.
            // Se por algum motivo não vier, usamos 'viewer' como fallback seguro.
            const safeRole = req.userRole || 'viewer';

            // Chama o repositório
            const updated = await userRepository.adminUpdateUser(req.userId, { 
                name: name || null,  // Garante null se vazio
                email: email || null, 
                role: safeRole, 
                password_hash: password_hash // Agora é null ou string hash
            });

            return res.json(updated);
        } catch (error) {
            console.error("ERRO NO UPDATE ME:", error);
            return res.status(500).json({ error: 'Erro ao atualizar perfil' });
        }
    }

    // 3. DELETE /me
    async deleteMe(req, res) {
        try {
            await userRepository.deleteUser(req.userId);
            return res.json({ message: 'Conta excluída com sucesso.' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao excluir conta.' });
        }
    }
}

module.exports = new ProfileController();