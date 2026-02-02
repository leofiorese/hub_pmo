#!/bin/bash

# Script de validação do ambiente Docker
# Uso: ./validate-docker.sh

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Hub PMO - Validação de Ambiente Docker${NC}"
echo "=============================================="
echo ""

ERRORS=0
WARNINGS=0

# Função para sucesso
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Função para erro
error() {
    echo -e "${RED}❌ $1${NC}"
    ((ERRORS++))
}

# Função para warning
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

# Função para info
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo -e "${YELLOW}1. Verificando Docker...${NC}"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    success "Docker instalado: $DOCKER_VERSION"
else
    error "Docker não encontrado! Instale: https://docs.docker.com/engine/install/"
fi

if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    success "Docker Compose instalado: $COMPOSE_VERSION"
else
    error "Docker Compose não encontrado!"
fi

echo ""
echo -e "${YELLOW}2. Verificando arquivos de configuração...${NC}"

# Verificar arquivos Docker
for file in "docker-compose.yml" "server/Dockerfile" "client/Dockerfile" "client/nginx.conf"; do
    if [ -f "$file" ]; then
        success "Arquivo encontrado: $file"
    else
        error "Arquivo não encontrado: $file"
    fi
done

# Verificar .dockerignore
for file in ".dockerignore" "server/.dockerignore" "client/.dockerignore"; do
    if [ -f "$file" ]; then
        success "Arquivo encontrado: $file"
    else
        warning "Arquivo não encontrado: $file (opcional)"
    fi
done

echo ""
echo -e "${YELLOW}3. Verificando arquivo .env...${NC}"

if [ -f "server/.env" ]; then
    success "Arquivo server/.env encontrado"

    # Verificar variáveis obrigatórias
    required_vars=("DB_HOST" "DB_USER" "DB_PASS" "DB_NAME" "JWT_SECRET" "PORT")
    for var in "${required_vars[@]}"; do
        if grep -q "^${var}=" server/.env; then
            value=$(grep "^${var}=" server/.env | cut -d'=' -f2)
            if [ -z "$value" ] || [ "$value" = "sua_senha_aqui" ] || [ "$value" = "sua_chave_secreta_aqui" ]; then
                warning "Variável $var precisa ser configurada"
            else
                success "Variável $var configurada"
            fi
        else
            error "Variável $var não encontrada no .env"
        fi
    done
else
    error "Arquivo server/.env não encontrado!"
    info "Execute: cp server/.env.example server/.env"
fi

echo ""
echo -e "${YELLOW}4. Verificando conectividade com MySQL...${NC}"

if [ -f "server/.env" ]; then
    DB_HOST=$(grep "^DB_HOST=" server/.env | cut -d'=' -f2)
    DB_PORT=3306

    if [ -n "$DB_HOST" ]; then
        info "Testando conexão com $DB_HOST:$DB_PORT..."

        if command -v nc &> /dev/null; then
            if nc -zv -w 5 "$DB_HOST" "$DB_PORT" 2>&1 | grep -q succeeded; then
                success "MySQL acessível em $DB_HOST:$DB_PORT"
            else
                warning "Não foi possível conectar ao MySQL em $DB_HOST:$DB_PORT"
                info "Verifique se o MySQL está rodando e acessível"
            fi
        elif command -v telnet &> /dev/null; then
            if timeout 5 telnet "$DB_HOST" "$DB_PORT" 2>&1 | grep -q Connected; then
                success "MySQL acessível em $DB_HOST:$DB_PORT"
            else
                warning "Não foi possível conectar ao MySQL em $DB_HOST:$DB_PORT"
            fi
        else
            warning "Comandos nc/telnet não encontrados, pulando teste de conexão"
        fi
    fi
fi

echo ""
echo -e "${YELLOW}5. Verificando portas...${NC}"

check_port() {
    PORT=$1
    if lsof -i :$PORT &> /dev/null 2>&1; then
        PROCESS=$(lsof -ti :$PORT)
        warning "Porta $PORT já está em uso (PID: $PROCESS)"
        info "Execute: lsof -i :$PORT para ver detalhes"
    else
        success "Porta $PORT está livre"
    fi
}

if command -v lsof &> /dev/null; then
    check_port 7000
    check_port 7001
else
    warning "Comando lsof não encontrado, pulando verificação de portas"
fi

echo ""
echo -e "${YELLOW}6. Verificando estrutura de diretórios...${NC}"

for dir in "server/src" "client/src"; do
    if [ -d "$dir" ]; then
        success "Diretório encontrado: $dir"
    else
        error "Diretório não encontrado: $dir"
    fi
done

echo ""
echo -e "${YELLOW}7. Verificando dependências Node.js...${NC}"

if [ -f "server/package.json" ]; then
    success "server/package.json encontrado"
    if [ -d "server/node_modules" ]; then
        info "server/node_modules existe (será ignorado no Docker)"
    fi
else
    error "server/package.json não encontrado"
fi

if [ -f "client/package.json" ]; then
    success "client/package.json encontrado"
    if [ -d "client/node_modules" ]; then
        info "client/node_modules existe (será ignorado no Docker)"
    fi
else
    error "client/package.json não encontrado"
fi

echo ""
echo "=============================================="
echo -e "${BLUE}📊 Resumo da Validação${NC}"
echo "=============================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Tudo OK! Ambiente pronto para deploy.${NC}"
    echo ""
    echo "Próximos passos:"
    echo "  1. ./docker-start.sh start"
    echo "  2. Acesse http://localhost:7001/pmohub"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS avisos encontrados${NC}"
    echo "Revise os avisos acima antes de fazer o deploy."
    echo ""
    echo "Para continuar mesmo assim:"
    echo "  ./docker-start.sh start"
else
    echo -e "${RED}❌ $ERRORS erros encontrados${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNINGS avisos encontrados${NC}"
    fi
    echo ""
    echo "Corrija os erros antes de fazer o deploy."
    exit 1
fi

echo ""
