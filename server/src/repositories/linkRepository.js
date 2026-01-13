const db = require('../config/db');

class LinkRepository {
    // Busca um link específico pela chave (ex: 'pbi_faturamento')
    async findByKey(key) {
        const [rows] = await db.execute('SELECT * FROM app_links WHERE link_key = ?', [key]);
        return rows[0];
    }

    // Busca todos (para usar depois se precisar)
    async findAll() {
        const [rows] = await db.execute('SELECT * FROM app_links');
        return rows;
    }

    // Atualiza o link
    async updateLink(key, newUrl) {
        await db.execute('UPDATE app_links SET url = ? WHERE link_key = ?', [newUrl, key]);
        return this.findByKey(key);
    }

    // Cria um novo link
    async createLink(key, title, url) {
        await db.execute('INSERT INTO app_links (link_key, title, url, updated_at) VALUES (?, ?, ?, NOW())', [key, title, url]);
        return this.findByKey(key);
    }
}

module.exports = new LinkRepository(); 2