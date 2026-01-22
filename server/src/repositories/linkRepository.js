const db = require('../config/db');

class LinkRepository {
    // Busca um link específico pela chave
    async findByKey(key) {
        const [rows] = await db.execute('SELECT * FROM app_links WHERE link_key = ?', [key]);
        if (rows[0]) {
            // Parse allowed_roles safely
            try {
                rows[0].allowed_roles = typeof rows[0].allowed_roles === 'string' ? JSON.parse(rows[0].allowed_roles) : rows[0].allowed_roles;
            } catch (e) {
                rows[0].allowed_roles = [];
            }
        }
        return rows[0];
    }

    // Busca todos
    async findAll() {
        const [rows] = await db.execute('SELECT * FROM app_links');
        return rows.map(row => {
            try {
                row.allowed_roles = typeof row.allowed_roles === 'string' ? JSON.parse(row.allowed_roles) : row.allowed_roles;
            } catch (e) {
                row.allowed_roles = [];
            }
            return row;
        });
    }

    // Atualiza o link
    async updateLink(oldKey, newKey, title, url, allowedRoles) {
        const rolesJson = JSON.stringify(allowedRoles);
        await db.execute(
            'UPDATE app_links SET link_key = ?, title = ?, url = ?, allowed_roles = ? WHERE link_key = ?',
            [newKey, title, url, rolesJson, oldKey]
        );
        return this.findByKey(newKey);
    }

    // Cria um novo link
    async createLink(key, title, url, allowedRoles) {
        const rolesJson = JSON.stringify(allowedRoles);
        await db.execute(
            'INSERT INTO app_links (link_key, title, url, allowed_roles, updated_at) VALUES (?, ?, ?, ?, NOW())',
            [key, title, url, rolesJson]
        );
        return this.findByKey(key);
    }

    // Deleta o link
    async deleteLink(key) {
        await db.execute('DELETE FROM app_links WHERE link_key = ?', [key]);
        return true;
    }
}

module.exports = new LinkRepository(); 2