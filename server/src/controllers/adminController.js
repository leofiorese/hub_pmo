const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');

class AdminController {
    async listUsers(req, res) {
        try {
            const users = await userRepository.findAll();
            return res.json(users);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar usuários.' });
        }
    }

    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { name, email, role, password } = req.body;

            // Se o admin enviou uma senha nova, criptografa. Senão, manda null/undefined.
            let password_hash = undefined;
            if (password && password.trim() !== '') {
                password_hash = await bcrypt.hash(password, 10);
            }

            const updatedUser = await userRepository.adminUpdateUser(id, {
                name,
                email,
                role,
                password_hash
            });

            return res.json(updatedUser);
        } catch (error) {
            console.error(error);
            return res.status(400).json({ error: 'Erro ao atualizar usuário.' });
        }
    }

    async listPendingUsers(req, res) {
        try {
            const users = await userRepository.findPending();
            return res.json(users);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar solicitações.' });
        }
    }

    // Aprova usuário
    async approveUser(req, res) {
        try {
            const { id } = req.params;
            await userRepository.approveUser(id);
            return res.json({ message: 'Usuário aprovado com sucesso!' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao aprovar usuário.' });
        }
    }

    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            await userRepository.deleteUser(id);
            return res.json({ message: 'Usuário excluído com sucesso.' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao excluir usuário.' });
        }
    }
}

module.exports = new AdminController();