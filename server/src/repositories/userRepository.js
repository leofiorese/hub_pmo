const db = require('../config/db');

class UserRepository {
    async findByEmail(email) {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE email = ? AND active = true', 
            [email]
        );
        return rows[0];
    }

    async findById(id) {
        const [rows] = await db.execute(
            'SELECT id, name, email, role FROM users WHERE id = ?', 
            [id]
        );
        return rows[0];
    }
}

module.exports = new UserRepository();