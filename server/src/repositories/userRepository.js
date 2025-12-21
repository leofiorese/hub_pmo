const db = require('../config/db');

class UserRepository {
    async findByEmail(email) {
        // SELECT * trará a coluna 'password_hash' agora
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    async create(userData) {
        // ATENÇÃO: Aqui recebemos o hash do service, mas salvamos na coluna 'password_hash'
        const { name, email, password, role } = userData;
        
        const [result] = await db.execute(
            `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
            [name, email, password, role || 'viewer'] // O 3º parametro é o hash que veio do service
        );
        return result.insertId;
    }

    async saveResetToken(email, token, expiry) {
        await db.execute(
            'UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?',
            [token, expiry, email]
        );
    }

    async findByToken(token) {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE reset_token = ? AND reset_expires > NOW()',
            [token]
        );
        return rows[0];
    }

    async updatePassword(id, newPasswordHash) {
        // Ajustado para atualizar a coluna correta
        await db.execute(
            'UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
            [newPasswordHash, id]
        );
    }

    // NOVO: Listar todos os usuários (para a tabela do Admin)
    async findAll() {
        try {
            // Trazendo apenas colunas que CERTEZA que existem
            const [rows] = await db.execute(
                'SELECT id, name, email, role FROM users ORDER BY name ASC'
            );
            return rows;
        } catch (error) {
            console.error("ERRO CRÍTICO NO FIND ALL:", error);
            throw new Error('Erro ao buscar usuários no banco.');
        }
    }

    // NOVO: Atualizar dados de um usuário (Role e/ou Senha)
    async adminUpdateUser(id, { name, email, role, password_hash }) {
        // Montamos a query dinamicamente dependendo se tem senha nova ou não
        let query = 'UPDATE users SET name = ?, email = ?, role = ?';
        let params = [name, email, role];

        if (password_hash) {
            query += ', password_hash = ?';
            params.push(password_hash);
        }

        query += ' WHERE id = ?';
        params.push(id);

        await db.execute(query, params);
        
        // Retorna o usuário atualizado
        const [rows] = await db.execute('SELECT id, name, email, role, is_verified FROM users WHERE id = ?', [id]);
        return rows[0];
    }
}

module.exports = new UserRepository();