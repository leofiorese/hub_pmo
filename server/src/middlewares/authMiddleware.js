const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Busca o token no cabeçalho Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    // O formato geralmente é "Bearer TOKEN_AQUI"
    // Vamos dividir e pegar a segunda parte
    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        return res.status(401).json({ error: 'Erro no token' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({ error: 'Token malformatado' });
    }

    // 2. Verifica se o token é válido usando a chave secreta
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido' });
        }

        // 3. Salva os dados do usuário (id, role) na requisição
        // Isso permite que o próximo passo (checkRole) saiba quem é o usuário
        req.user = decoded;
        
        return next();
    });
};