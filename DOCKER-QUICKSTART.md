# Docker Quick Start - Hub PMO

## Início Rápido (3 passos)

### 1. Configure o .env

```bash
cp server/.env.example server/.env
nano server/.env  # Edite com suas credenciais
```

### 2. Inicie os containers

```bash
# Usando o script helper
./docker-start.sh start

# OU diretamente com docker-compose
docker-compose up -d --build
```

### 3. Acesse a aplicação

- Frontend: http://localhost:7001/pmohub
- Backend: http://localhost:7000/api

---

## Comandos Mais Usados

### Script Helper (Recomendado)

```bash
./docker-start.sh start      # Inicia tudo
./docker-start.sh stop       # Para tudo
./docker-start.sh status     # Ver status
./docker-start.sh logs       # Ver logs
./docker-start.sh health     # Testar saúde
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
```

---

## Troubleshooting Rápido

### Backend não conecta

```bash
# Ver logs
docker-compose logs backend

# Verificar .env
cat server/.env | grep DB_HOST

# Testar MySQL
mysql -h 192.168.16.48 -u root -p pso_hub_db
```

### Frontend dá 404

```bash
# Acessar container
docker-compose exec frontend sh

# Verificar arquivos
ls -la /usr/share/nginx/html

# Ver config nginx
cat /etc/nginx/conf.d/default.conf
```

### Rebuild após mudanças

```bash
# Rebuild específico (mais rápido)
docker-compose up -d --no-deps --build backend

# Rebuild completo
docker-compose down
docker-compose up -d --build
```

---

## URLs de Acesso

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Frontend | http://localhost:7001/pmohub | Aplicação React |
| Backend | http://localhost:7000/api | API REST |
| Health | http://localhost:7000/ | Health check |

---

## Portas

| Serviço | Container | Host |
|---------|-----------|------|
| Backend | 7000 | 7000 |
| Frontend | 7001 | 7001 |
| MySQL | - | 192.168.16.48:3306 |

---

## Estrutura de Arquivos

```
/
├── docker-compose.yml       # Orquestração
├── docker-start.sh          # Script helper
├── DOCKER.md                # Documentação completa
├── server/
│   ├── Dockerfile           # Backend container
│   ├── .dockerignore
│   └── .env                 # Credenciais (não commitar!)
└── client/
    ├── Dockerfile           # Frontend container
    ├── nginx.conf           # Config Nginx
    └── .dockerignore
```

---

## Checklist de Deploy

- [ ] Arquivo `server/.env` configurado
- [ ] MySQL acessível em 192.168.16.48
- [ ] Docker e Docker Compose instalados
- [ ] Portas 7000 e 7001 livres
- [ ] `docker-compose up -d --build` executado
- [ ] Health check funcionando: `curl http://localhost:7000/`
- [ ] Frontend acessível: `curl http://localhost:7001/pmohub`

---

## Documentação Completa

Ver `DOCKER.md` para documentação detalhada incluindo:
- Troubleshooting avançado
- Monitoramento
- Backup e restore
- Comandos de atualização
- Configurações de rede
