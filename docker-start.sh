#!/bin/bash

# Script de inicialização rápida do Docker Compose
# Uso: ./docker-start.sh [comando]

set -e

echo "🐳 Hub PMO - Docker Manager"
echo "======================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar se .env existe
check_env() {
    if [ ! -f "./server/.env" ]; then
        echo -e "${RED}❌ Erro: Arquivo ./server/.env não encontrado!${NC}"
        echo -e "${YELLOW}📝 Crie o arquivo usando o exemplo:${NC}"
        echo "   cp server/.env.example server/.env"
        echo "   # Edite server/.env com suas credenciais"
        exit 1
    fi
    echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"
}

# Função para build e start
start() {
    echo -e "${YELLOW}🚀 Iniciando containers...${NC}"
    check_env
    docker-compose up -d --build
    echo -e "${GREEN}✅ Containers iniciados!${NC}"
    status
}

# Função para parar
stop() {
    echo -e "${YELLOW}🛑 Parando containers...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ Containers parados${NC}"
}

# Função para restart
restart() {
    echo -e "${YELLOW}🔄 Reiniciando containers...${NC}"
    docker-compose restart
    echo -e "${GREEN}✅ Containers reiniciados${NC}"
    status
}

# Função para ver status
status() {
    echo -e "${YELLOW}📊 Status dos containers:${NC}"
    docker-compose ps
    echo ""
    echo -e "${GREEN}🌐 URLs de Acesso:${NC}"
    echo "   Frontend: http://localhost:7001/pmohub"
    echo "   Backend:  http://localhost:7000/api"
    echo "   Health:   http://localhost:7000/"
}

# Função para ver logs
logs() {
    if [ -z "$2" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$2"
    fi
}

# Função para rebuild
rebuild() {
    service=$2
    if [ -z "$service" ]; then
        echo -e "${YELLOW}🔨 Rebuild completo...${NC}"
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d
    else
        echo -e "${YELLOW}🔨 Rebuild de ${service}...${NC}"
        docker-compose up -d --no-deps --build "$service"
    fi
    echo -e "${GREEN}✅ Rebuild concluído${NC}"
    status
}

# Função para verificar saúde
health() {
    echo -e "${YELLOW}🏥 Verificando saúde dos serviços...${NC}"
    echo ""

    echo -n "Backend: "
    if curl -s http://localhost:7000/ | grep -q "PMO Hub"; then
        echo -e "${GREEN}✅ Online${NC}"
    else
        echo -e "${RED}❌ Offline${NC}"
    fi

    echo -n "Frontend: "
    if curl -s http://localhost:7001/pmohub | grep -q "html"; then
        echo -e "${GREEN}✅ Online${NC}"
    else
        echo -e "${RED}❌ Offline${NC}"
    fi
}

# Função para shell
shell() {
    service=$2
    if [ -z "$service" ]; then
        echo -e "${RED}❌ Especifique o serviço: backend ou frontend${NC}"
        echo "   Exemplo: ./docker-start.sh shell backend"
        exit 1
    fi
    echo -e "${YELLOW}🐚 Acessando shell do ${service}...${NC}"
    docker-compose exec "$service" sh
}

# Menu principal
case "${1:-help}" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    logs)
        logs "$@"
        ;;
    rebuild)
        rebuild "$@"
        ;;
    health)
        health
        ;;
    shell)
        shell "$@"
        ;;
    help|*)
        echo "Comandos disponíveis:"
        echo ""
        echo "  start        - Build e inicia os containers"
        echo "  stop         - Para os containers"
        echo "  restart      - Reinicia os containers"
        echo "  status       - Mostra status e URLs"
        echo "  logs [srv]   - Mostra logs (opcional: backend/frontend)"
        echo "  rebuild [srv]- Rebuild completo (opcional: backend/frontend)"
        echo "  health       - Verifica saúde dos serviços"
        echo "  shell <srv>  - Acessa shell do container (backend/frontend)"
        echo "  help         - Mostra esta ajuda"
        echo ""
        echo "Exemplos:"
        echo "  ./docker-start.sh start"
        echo "  ./docker-start.sh logs backend"
        echo "  ./docker-start.sh rebuild frontend"
        echo "  ./docker-start.sh shell backend"
        ;;
esac
