#!/bin/bash
# Script para aplicar configuração do Hub PMO no Nginx
# Execute com: sudo bash apply-nginx-config.sh

set -e  # Parar em caso de erro

echo "========================================"
echo "Aplicando configuração Hub PMO no Nginx"
echo "========================================"
echo ""

# 1. Fazer backup
echo "1. Fazendo backup da configuração atual..."
cp /etc/nginx/sites-available/interno-sandech /etc/nginx/sites-available/interno-sandech.backup.$(date +%Y%m%d_%H%M%S)
echo "   ✓ Backup criado"
echo ""

# 2. Criar arquivo temporário com as novas configurações
echo "2. Preparando novas configurações..."
cat > /tmp/pmohub-block.conf << 'EOF'

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
EOF

# 3. Inserir o bloco após a linha 115 (após /api/reports)
echo "3. Inserindo configurações no arquivo..."
sed -i '115 r /tmp/pmohub-block.conf' /etc/nginx/sites-available/interno-sandech
echo "   ✓ Configurações inseridas"
echo ""

# 4. Atualizar a página raiz para incluir Hub PMO
echo "4. Atualizando página raiz..."
sed -i 's|- /database (pgAdmin)\\n- /worklocation|- /database (pgAdmin)\\n- /pmohub (Hub PMO)\\n- /worklocation|' /etc/nginx/sites-available/interno-sandech
echo "   ✓ Página raiz atualizada"
echo ""

# 5. Validar sintaxe
echo "5. Validando sintaxe do Nginx..."
nginx -t
echo ""

# 6. Recarregar Nginx
echo "6. Recarregando Nginx..."
systemctl reload nginx
echo "   ✓ Nginx recarregado"
echo ""

echo "========================================"
echo "✓ Configuração aplicada com sucesso!"
echo "========================================"
echo ""
echo "Acesse: https://interno.sandech.local/pmohub/"
echo ""
echo "Para verificar logs:"
echo "  - sudo tail -f /var/log/nginx/interno-sandech-access.log"
echo "  - sudo tail -f /var/log/nginx/interno-sandech-error.log"
echo "  - docker logs hub-pmo-backend -f"
echo "  - docker logs hub-pmo-frontend -f"
echo ""
