// middleware para verificar se o usuário tem a role necessária
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        // req.user vem do authMiddleware que decodifica o JWT
        const userRole = req.user.role; 

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ error: 'Acesso negado: Você não tem permissão para realizar esta ação.' });
        }

        next();
    };
};

module.exports = checkRole;