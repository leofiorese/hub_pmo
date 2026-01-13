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
            const { title, url, category } = req.body;

            // Validação básica
            if (!url || !title || !category) return res.status(400).json({ error: 'Dados incompletos: title, url e category são obrigatórios' });

            // Determinar novo prefixo baseado na categoria
            let prefix = '';
            if (category === 'pbi') prefix = 'pbi_';
            else if (category === 'excel') prefix = 'excel_';
            else if (category === 'custom') prefix = 'custom_';
            else return res.status(400).json({ error: 'Categoria inválida' });

            // Verificar se a categoria mudou para gerar nova chave
            // Se a chave atual NÃO começa com o prefixo da nova categoria, então mudou.
            let newKey = key;
            if (!key.startsWith(prefix)) {
                // Mudou de categoria, gera nova chave
                newKey = `${prefix}${Date.now()}`;
            }

            const updated = await linkRepository.updateLink(key, newKey, title, url);
            return res.json(updated);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao atualizar link' });
        }
    }

    // DELETE /api/admin/links/:key
    async deleteLink(req, res) {
        try {
            const { key } = req.params;
            await linkRepository.deleteLink(key);
            return res.status(204).send();
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao deletar link' });
        }
    }

    // GET /api/links
    async listAll(req, res) {
        try {
            const links = await linkRepository.findAll();
            // Retorna o array completo (breaking change para o frontend antigo, mas necessário para a nova sidebar)
            return res.json(links);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao listar links' });
        }
    }

    // POST /api/links (Admin/PMO)
    async addLink(req, res) {
        try {
            const { title, url, category } = req.body;

            if (!title || !url || !category) {
                return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
            }

            let prefix = '';
            if (category === 'pbi') prefix = 'pbi_';
            else if (category === 'excel') prefix = 'excel_';
            else if (category === 'custom') prefix = 'custom_';
            else return res.status(400).json({ error: 'Categoria inválida' });

            // Gera chave única: prefix + timestamp
            const link_key = `${prefix}${Date.now()}`;

            const newLink = await linkRepository.createLink(link_key, title, url);
            return res.status(201).json(newLink);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao criar link' });
        }
    }
}

module.exports = new LinkController();