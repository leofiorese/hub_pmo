# Implementação Hub PMO em /pmohub - Status Final

## ✅ Etapas Concluídas

### Fase 1: Preparação
- ✅ Containers Docker verificados e rodando
  - Backend: `hub-pmo-backend` na porta 7000
  - Frontend: `hub-pmo-frontend` na porta 7001

### Fase 2: Ajustes no Código
- ✅ `client/vite.config.js` - Adicionado `base: '/pmohub/'`
- ✅ `client/src/App.jsx` - Adicionado `basename="/pmohub"` no BrowserRouter
- ✅ `client/src/services/api.js` - Alterado baseURL para `/pmohub/api`
- ✅ `docker-compose.yml` - Corrigido VITE_API_URL para `/pmohub/api`

### Fase 3: Rebuild Docker
- ✅ `docker compose build` - Concluído com sucesso
- ✅ `docker compose up -d` - Containers recriados e rodando
- ✅ Logs verificados - Backend e frontend operacionais

## ⚠️ Etapa Pendente: Configuração do Nginx

Para completar a implementação, você precisa aplicar a configuração do Nginx com permissões de administrador.

### Opção 1: Usar o Script Automatizado (RECOMENDADO)

Execute o script que criei:

```bash
sudo bash /home/vmteste02/dev/hub_pmo/apply-nginx-config.sh
```

Este script irá:
1. Fazer backup automático da configuração atual
2. Inserir os location blocks do Hub PMO
3. Atualizar a página raiz
4. Validar a sintaxe do Nginx
5. Recarregar o Nginx

### Opção 2: Configuração Manual

Se preferir fazer manualmente, siga as instruções em:
```
/home/vmteste02/dev/hub_pmo/nginx-pmohub-config.txt
```

**Resumo da configuração manual:**

1. Backup:
```bash
sudo cp /etc/nginx/sites-available/interno-sandech /etc/nginx/sites-available/interno-sandech.backup
```

2. Editar arquivo:
```bash
sudo nano /etc/nginx/sites-available/interno-sandech
```

3. Adicionar após linha 115 (após `/api/reports`):
```nginx
    # ========================================
    # Location: /pmohub/api → Hub PMO API (porta 7000)
    # ========================================
    location /pmohub/api/ {
        rewrite ^/pmohub/api/(.*) /api/$1 break;
        proxy_pass http://localhost:7000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # ========================================
    # Location: /pmohub → Hub PMO Frontend (porta 7001)
    # ========================================
    location /pmohub {
        return 301 https://$server_name/pmohub/;
    }

    location /pmohub/ {
        proxy_pass http://localhost:7001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        proxy_read_timeout 300;
    }
```

4. Atualizar linha 164 (página raiz):
```nginx
# DE:
return 200 "Servidor interno.sandech.local ativo\nServiços disponíveis:\n- /database (pgAdmin)\n- /worklocation (Worklocation Frontend)\n- /sandechhub (SinHub)\n";

# PARA:
return 200 "Servidor interno.sandech.local ativo\nServiços disponíveis:\n- /database (pgAdmin)\n- /pmohub (Hub PMO)\n- /worklocation (Worklocation Frontend)\n- /sandechhub (SinHub)\n";
```

5. Validar e recarregar:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 🧪 Fase 5: Testes

Após aplicar a configuração do Nginx, execute os testes:

### 1. Teste de Acesso ao Frontend
```bash
curl -k https://interno.sandech.local/pmohub/
```
**Esperado:** HTML do React (index.html)

### 2. Teste de Acesso à API
```bash
curl -k https://interno.sandech.local/pmohub/api/
```
**Esperado:** Resposta da API ou 404

### 3. Teste no Navegador
1. Acesse: `https://interno.sandech.local/pmohub/`
2. Verifique se o frontend carrega
3. Tente fazer login
4. Abra DevTools → Network
5. Verifique se as chamadas API usam `/pmohub/api/*`

### 4. Verificar Logs

**Nginx:**
```bash
sudo tail -f /var/log/nginx/interno-sandech-access.log
sudo tail -f /var/log/nginx/interno-sandech-error.log
```

**Docker:**
```bash
docker logs hub-pmo-backend -f
docker logs hub-pmo-frontend -f
```

### 5. Testar Outros Serviços
Garantir que nada quebrou:
- https://interno.sandech.local/database/
- https://interno.sandech.local/worklocation/
- https://interno.sandech.local/sandechhub/

## 📊 Resumo da Configuração

### Arquitetura de Roteamento

```
HTTPS Request → interno.sandech.local/pmohub/
                ↓
         Nginx (porta 443)
                ↓
      ┌─────────┴─────────┐
      ↓                   ↓
/pmohub/api/*      /pmohub/*
      ↓                   ↓
localhost:7000    localhost:7001
      ↓                   ↓
Backend Docker    Frontend Docker
(Express API)     (React SPA)
```

### Pontos Críticos

1. **Ordem das Locations:** API (`/pmohub/api/`) ANTES do frontend (`/pmohub/`)
2. **Rewrite na API:** Remove `/pmohub` do path antes de passar para o backend
3. **Base Path no Frontend:** Configurado em `vite.config.js` e `App.jsx`
4. **CORS:** Backend já configurado para aceitar qualquer origem
5. **Assets:** Build do Vite cria assets com prefixo `/pmohub/`

## 🔄 Rollback

Se algo der errado, restaure o backup:

```bash
# Listar backups disponíveis
ls -lh /etc/nginx/sites-available/interno-sandech.backup*

# Restaurar backup específico
sudo cp /etc/nginx/sites-available/interno-sandech.backup.YYYYMMDD_HHMMSS /etc/nginx/sites-available/interno-sandech

# Validar e recarregar
sudo nginx -t && sudo systemctl reload nginx
```

## 📝 Arquivos Criados/Modificados

### Modificados no Repositório
- `client/vite.config.js`
- `client/src/App.jsx`
- `client/src/services/api.js`
- `docker-compose.yml`

### Criados para Implementação
- `nginx-pmohub-config.txt` - Instruções de configuração
- `apply-nginx-config.sh` - Script automatizado de instalação
- `IMPLEMENTACAO-COMPLETA.md` - Este arquivo

### A Modificar no Sistema (com sudo)
- `/etc/nginx/sites-available/interno-sandech` - Adicionar location blocks

## 🎯 Próximos Passos

1. Execute o script de configuração do Nginx:
   ```bash
   sudo bash /home/vmteste02/dev/hub_pmo/apply-nginx-config.sh
   ```

2. Execute os testes descritos acima

3. Se tudo funcionar, faça commit das mudanças:
   ```bash
   cd /home/vmteste02/dev/hub_pmo
   git add -A
   git commit -m "feat: configurar Hub PMO para servir em /pmohub

   - Adicionar base path no Vite config
   - Configurar basename no React Router
   - Ajustar API baseURL para /pmohub/api
   - Atualizar VITE_API_URL no docker-compose
   - Criar script de configuração do Nginx

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
   ```

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do Nginx e Docker
2. Confirme que as portas 7000 e 7001 estão acessíveis
3. Teste acesso direto: `curl http://localhost:7000/api/` e `curl http://localhost:7001/pmohub/`
4. Verifique se o Nginx do container está servindo em `/pmohub/` (arquivo `client/nginx.conf`)

---

**Status:** 85% completo - Aguardando aplicação da configuração do Nginx
