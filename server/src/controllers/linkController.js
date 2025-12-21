const linkRepository = require('../repositories/linkRepository');

class LinkController {
    // GET /api/links/:key
    async getLink(req, res) {
        try {
            const { key } = req.params;
            const link = await linkRepository.findByKey(key);
            if (!link) return res.status(404).json({ error: 'Link não encontrado' });
            return res.json(link);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar link' });
        }
    }

    // PUT /api/admin/links/:key (Só Admin usa isso)
    async updateLink(req, res) {
        try {
            const { key } = req.params;
            const { url } = req.body;
            
            if (!url) return res.status(400).json({ error: 'URL é obrigatória' });

            const updated = await linkRepository.updateLink(key, url);
            return res.json(updated);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar link' });
        }
    }

    async listAll(req, res) {
        try {
            const links = await linkRepository.findAll();
            const linksMap = {};
            links.forEach(link => {
                linksMap[link.link_key] = link.url;
            });
            return res.json(linksMap);
        } catch (error) {
            console.error(error); // Bom para debugar
            return res.status(500).json({ error: 'Erro ao listar links' });
        }
    }
}

module.exports = new LinkController();