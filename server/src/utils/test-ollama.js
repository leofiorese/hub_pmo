require('dotenv').config();
const axios = require('axios');

const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';

console.log(`\n🔍 Testando conexão com Ollama...`);
console.log(`📍 URL Alvo: ${ollamaUrl}`);

(async () => {
    try {
        console.log(`⏳ Tentando conectar...`);
        const start = Date.now();
        const response = await axios.get(`${ollamaUrl}/api/tags`, { timeout: 5000 });
        const duration = Date.now() - start;

        console.log(`✅ Sucesso! Conectado em ${duration}ms`);
        console.log(`📦 Modelos encontrados:`);

        if (response.data.models) {
            response.data.models.forEach(m => {
                console.log(`   - ${m.name}`);
            });
        } else {
            console.log('   (Nenhum modelo listado ou formato de resposta diferente)');
            console.log(response.data);
        }

    } catch (error) {
        console.error(`\n❌ Falha na conexão:`);
        console.error(`   Mensagem: ${error.message}`);
        if (error.code) console.error(`   Código: ${error.code}`);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Data:`, error.response.data);
        }

        console.log(`\n💡 Dicas de Solução:`);
        console.log(`   1. Verifique se o IP '${ollamaUrl}' é acessível desta máquina (ping ${ollamaUrl.split('://')[1].split(':')[0]}).`);
        console.log(`   2. Se estiver no Windows/Firewall, libere a porta 11434 para entrada.`);
        console.log(`   3. Garanta que o Ollama está rodando com OLLAMA_HOST=0.0.0.0 na máquina servidor.`);
    }
})();
