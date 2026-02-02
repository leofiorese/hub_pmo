# Hub PMO - Docker Setup

## 🚀 Início Rápido

### Pré-requisitos
- Docker 20.10+
- Docker Compose 1.29+
- MySQL acessível em 192.168.16.48

### Configuração (primeira vez)

1. **Configure as variáveis de ambiente:**
   ```bash
   cp server/.env.example server/.env
   nano server/.env  # Edite com suas credenciais
   ```

2. **Valide o ambiente:**
   ```bash
   ./validate-docker.sh
   ```

3. **Inicie os containers:**
   ```bash
   ./docker-start.sh start
   ```

4. **Acesse a aplicação:**
   - Frontend: http://localhost:7001/pmohub
   - Backend: http://localhost:7000/api

---

## 📁 Arquivos Criados

```
/
├── docker-compose.yml           # Orquestração dos serviços
├── .dockerignore                # Arquivos ignorados no build raiz
├── docker-start.sh              # Script helper para gerenciar containers
├── validate-docker.sh           # Validação do ambiente
├── DOCKER.md                    # Documentação completa
├── DOCKER-QUICKSTART.md         # Guia rápido
├── README-DOCKER.md             # Este arquivo
├── server/
│   ├── Dockerfile               # Container Node.js (porta 7000)
│   ├── .dockerignore            # Arquivos ignorados no build
│   ├── .env                     # Variáveis de ambiente (NÃO COMMITAR!)
│   └── .env.example             # Template de variáveis
└── client/
    ├── Dockerfile               # Multi-stage: Build React + Nginx
    ├── nginx.conf               # Config Nginx para /pmohub
    └── .dockerignore            # Arquivos ignorados no build
```

---

## 🎯 Arquitetura Docker

### Serviços

| Serviço | Container | Porta Host | Porta Container | Descrição |
|---------|-----------|------------|-----------------|-----------|
| Backend | hub-pmo-backend | 7000 | 7000 | API Node.js + Express |
| Frontend | hub-pmo-frontend | 7001 | 7001 | React SPA + Nginx |

### Network
- **Nome:** hub-pmo-network
- **Driver:** bridge
- **Isolamento:** Containers comunicam internamente via rede Docker

### Volumes
- Nenhum volume persistente (stateless)
- MySQL externo em 192.168.16.48

### Restart Policy
- **unless-stopped:** Containers reiniciam automaticamente exceto quando parados manualmente

---

## 🛠️ Comandos Principais

### Script Helper (Recomendado)

```bash
./docker-start.sh start          # Build e inicia
./docker-start.sh stop           # Para containers
./docker-start.sh restart        # Reinicia
./docker-start.sh status         # Ver status e URLs
./docker-start.sh logs           # Ver logs (todos)
./docker-start.sh logs backend   # Ver logs do backend
./docker-start.sh logs frontend  # Ver logs do frontend
./docker-start.sh rebuild        # Rebuild completo
./docker-start.sh rebuild backend    # Rebuild só backend
./docker-start.sh rebuild frontend   # Rebuild só frontend
./docker-start.sh health         # Testar saúde dos serviços
./docker-start.sh shell backend  # Acessar shell do backend
./docker-start.sh shell frontend # Acessar shell do frontend
```

### Docker Compose Direto

```bash
# Iniciar
docker-compose up -d --build

# Parar
docker-compose down

# Ver logs
docker-compose logs -f

# Status
docker-compose ps

# Rebuild específico
docker-compose up -d --no-deps --build backend
```

---

## 🔍 Validação e Troubleshooting

### Validar Ambiente
```bash
./validate-docker.sh
```

Verifica:
- Docker e Docker Compose instalados
- Arquivos de configuração presentes
- Variáveis .env configuradas
- Conectividade com MySQL
- Portas 7000 e 7001 disponíveis

### Verificar Saúde
```bash
./docker-start.sh health

# OU manualmente
curl http://localhost:7000/          # Backend health
curl http://localhost:7001/pmohub    # Frontend
```

### Ver Logs
```bash
# Todos os logs
docker-compose logs -f

# Logs específicos
docker-compose logs -f backend
docker-compose logs -f frontend

# Últimas 50 linhas
docker-compose logs --tail=50 backend
```

### Problemas Comuns

**Backend não conecta ao MySQL:**
```bash
# Ver logs
docker-compose logs backend

# Testar conexão
nc -zv 192.168.16.48 3306

# Verificar .env
cat server/.env | grep DB_
```

**Frontend retorna 404:**
```bash
# Acessar container
docker-compose exec frontend sh
ls -la /usr/share/nginx/html

# Verificar config Nginx
cat /etc/nginx/conf.d/default.conf
```

**Rebuild após mudanças:**
```bash
# Rebuild completo
./docker-start.sh rebuild

# Rebuild específico (mais rápido)
./docker-start.sh rebuild backend
```

---

## 📝 Variáveis de Ambiente

### server/.env (Obrigatório)

```env
# Database
DB_HOST=192.168.16.48
DB_USER=root
DB_PASS=sua_senha_aqui
DB_NAME=pso_hub_db

# JWT
JWT_SECRET=sua_chave_secreta_muito_longa_e_aleatoria

# Server
PORT=7000
```

### Build Args (Frontend)

Passados automaticamente no build:
- `VITE_API_URL=http://localhost:7000/api`

---

## 🚢 Deploy em Produção

### Atualização Completa
```bash
git pull origin main
docker-compose down
docker-compose up -d --build
```

### Atualização Incremental (Zero Downtime)
```bash
# Atualizar backend
git pull origin main
docker-compose up -d --no-deps --build backend

# Atualizar frontend
git pull origin main
docker-compose up -d --no-deps --build frontend
```

---

## 📊 Monitoramento

### Ver Recursos
```bash
# Stats em tempo real
docker stats

# Específico
docker stats hub-pmo-backend hub-pmo-frontend
```

### Inspecionar Containers
```bash
# Ver detalhes
docker inspect hub-pmo-backend
docker inspect hub-pmo-frontend

# Ver redes
docker network inspect hub_pmo_hub-pmo-network
```

---

## 🔒 Segurança

### Checklist
- [ ] Arquivo `.env` nunca commitado (verificar .gitignore)
- [ ] JWT_SECRET forte e aleatório
- [ ] Senhas do MySQL fortes
- [ ] Containers rodando como usuário não-root (Node Alpine)
- [ ] Nginx com headers de segurança
- [ ] Network isolada para comunicação entre containers

### Boas Práticas
1. Use `.env.example` como template
2. Rotacione JWT_SECRET periodicamente
3. Mantenha Docker atualizado
4. Monitore logs regularmente
5. Backup do .env em local seguro

---

## 📚 Documentação Adicional

- **DOCKER.md** - Documentação completa e detalhada
- **DOCKER-QUICKSTART.md** - Guia de referência rápida
- **DEPLOY.md** - Workflow de deploy original (PM2)
- **CLAUDE.md** - Instruções para Claude Code

---

## 🆘 Suporte

### Verificar Status
```bash
./docker-start.sh status
```

### Logs Completos
```bash
docker-compose logs --tail=200 > logs-debug.txt
```

### Restart Completo
```bash
docker-compose down
docker-compose up -d --build
./docker-start.sh health
```

---

## 🎯 URLs de Acesso

Após o deploy bem-sucedido:

- **Frontend:** http://localhost:7001/pmohub
- **Backend API:** http://localhost:7000/api
- **Health Check:** http://localhost:7000/
- **MySQL:** 192.168.16.48:3306 (externo)

---

## 📝 Notas Importantes

1. **Subdomínio /pmohub:** O frontend é servido exclusivamente em `/pmohub`, não na raiz
2. **MySQL Externo:** Banco de dados não está no Docker, apenas backend e frontend
3. **Porta 7000:** Backend (diferente da porta 3000 usada em desenvolvimento local)
4. **Porta 7001:** Frontend servido pelo Nginx
5. **Build Args:** VITE_API_URL é injetado em build-time no frontend

---

**Última atualização:** 2026-01-30
