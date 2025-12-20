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
}

module.exports = new UserRepository();