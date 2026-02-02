# Docker Deployment - Hub PMO

## Visão Geral

Este projeto utiliza Docker Compose para orquestrar os serviços:

- **Backend (Node.js):** Porta 7000
- **Frontend (React + Nginx):** Porta 7001 servindo em `/pmohub`
- **Banco de Dados:** MySQL externo em 192.168.16.48

## Pré-requisitos

1. Docker e Docker Compose instalados
2. Arquivo `.env` configurado em `/server/.env` (ver seção abaixo)
3. Acesso ao MySQL em 192.168.16.48

## Configuração Inicial

### 1. Arquivo .env do Backend

Crie o arquivo `/server/.env` com as seguintes variáveis:

```env
# Database
DB_HOST=192.168.16.48
DB_USER=root
DB_PASS=sua_senha_aqui
DB_NAME=pso_hub_db

# JWT
JWT_SECRET=sua_chave_secreta_aqui

# Server
PORT=7000
```

**Nota:** A porta 7000 será usada dentro do container, mas o backend será acessível em `http://localhost:7000` na máquina host.

### 2. Verificar Conexão com MySQL

Teste a conexão antes de subir os containers:

```bash
mysql -h 192.168.16.48 -u root -p pso_hub_db
```

## Comandos de Deploy

### Build e Iniciar (Primeira Vez)

```bash
# Build das imagens e start dos containers
docker-compose up --build

# Em modo background (daemon)
docker-compose up -d --build
```

### Gerenciamento de Containers

```bash
# Ver status dos containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Parar todos os containers
docker-compose down

# Parar e remover volumes (cuidado!)
docker-compose down -v

# Reiniciar um serviço específico
docker-compose restart backend
docker-compose restart frontend

# Rebuild de um serviço específico sem afetar outros
docker-compose up -d --no-deps --build backend
docker-compose up -d --no-deps --build frontend
```

### Acessar Shell dos Containers

```bash
# Backend (Node.js)
docker-compose exec backend sh

# Frontend (Nginx)
docker-compose exec frontend sh
```

## URLs de Acesso

- **Frontend:** http://localhost:7001/pmohub
- **Backend API:** http://localhost:7000/api
- **Health Check Backend:** http://localhost:7000/

## Verificação de Deploy

### 1. Testar Backend

```bash
# Health check
curl http://localhost:7000/

# Deve retornar: {"message":"🚀 PMO Hub Backend está online!"}
```

### 2. Testar Frontend

```bash
# Acessar a aplicação
curl http://localhost:7001/pmohub

# Deve retornar o HTML do index.html
```

### 3. Verificar Logs

```bash
# Backend deve mostrar
docker-compose logs backend | grep "Servidor rodando"
# Output: 🔥 Servidor rodando na porta 7000

# Frontend deve mostrar que Nginx iniciou
docker-compose logs frontend | grep "nginx"
```

## Estrutura dos Arquivos Docker

```
/
├── docker-compose.yml          # Orquestração dos serviços
├── server/
│   ├── Dockerfile              # Imagem Node.js para backend
│   ├── .dockerignore           # Arquivos ignorados no build
│   └── .env                    # Variáveis de ambiente (NÃO COMITAR)
└── client/
    ├── Dockerfile              # Multi-stage: Build React + Nginx
    ├── nginx.conf              # Configuração Nginx para /pmohub
    └── .dockerignore           # Arquivos ignorados no build
```

## Troubleshooting

### Backend não conecta ao MySQL

1. Verifique se o MySQL está acessível do host:
   ```bash
   telnet 192.168.16.48 3306
   ```

2. Verifique as credenciais no `/server/.env`

3. Verifique os logs do backend:
   ```bash
   docker-compose logs backend
   ```

### Frontend retorna 404 em /pmohub

1. Verifique se o Nginx está rodando:
   ```bash
   docker-compose ps frontend
   ```

2. Acesse o shell do container e verifique os arquivos:
   ```bash
   docker-compose exec frontend sh
   ls -la /usr/share/nginx/html
   cat /etc/nginx/conf.d/default.conf
   ```

### Mudanças no código não aparecem

1. Rebuild da imagem:
   ```bash
   docker-compose up -d --build
   ```

2. Para garantir build limpo:
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

### Erro de porta já em uso

Se as portas 7000 ou 7001 estiverem em uso:

```bash
# Verificar processos usando as portas
lsof -i :7000
lsof -i :7001

# Matar processo específico
kill -9 <PID>

# Ou mudar as portas no docker-compose.yml:
ports:
  - "7002:7000"  # Mapeia porta 7002 do host para 7000 do container
```

## Atualização em Produção

### 1. Backend (após mudanças no código)

```bash
cd /caminho/para/projeto
git pull origin main
docker-compose up -d --no-deps --build backend
```

### 2. Frontend (após mudanças no código)

```bash
cd /caminho/para/projeto
git pull origin main
docker-compose up -d --no-deps --build frontend
```

### 3. Atualização Completa

```bash
git pull origin main
docker-compose down
docker-compose up -d --build
```

## Monitoramento

### Ver uso de recursos

```bash
# Stats em tempo real
docker stats

# Específico dos containers
docker stats hub-pmo-backend hub-pmo-frontend
```

### Ver logs históricos

```bash
# Últimas 100 linhas
docker-compose logs --tail=100

# Desde um horário específico
docker-compose logs --since="2026-01-30T10:00:00"
```

## Backup e Restore

### Backup das Imagens

```bash
# Salvar imagens
docker save -o hub-pmo-backend.tar hub_pmo-backend
docker save -o hub-pmo-frontend.tar hub_pmo-frontend

# Restaurar imagens
docker load -i hub-pmo-backend.tar
docker load -i hub-pmo-frontend.tar
```

## Notas Importantes

1. **Nunca commitar o arquivo `/server/.env`** - Contém credenciais sensíveis
2. **MySQL Externo:** O banco não está no Docker, apenas o backend e frontend
3. **Subdomínio /pmohub:** O frontend é servido exclusivamente neste path
4. **VITE_API_URL:** Configurado em build-time no Dockerfile do frontend
5. **Networking:** Containers comunicam via rede `hub-pmo-network`
6. **Restart Policy:** Containers reiniciam automaticamente (`unless-stopped`)

## Referências

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
