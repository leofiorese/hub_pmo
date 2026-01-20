# Guia de Atualização (Deploy Contínuo)

Este guia descreve como atualizar sua aplicação na VM Windows após fazer alterações no seu PC de desenvolvimento.

## 1. Frontend (React)
Sempre que você alterar algo no visual (`client/src`):

1.  **Gere o Build (No seu PC):**
    ```powershell
    cd client
    npm run build
    ```
2.  **Copie:** Pegue a pasta `dist` gerada.
3.  **Cole na VM:** Substitua a pasta `dist` antiga na VM (ex: `C:\Users\leonardo.fiorese\Documents\hub_pmo\client\dist`).
    *   *Dica: Não precisa parar o Nginx. Apenas substitua os arquivos.*

## 2. Backend (Node.js)
Sempre que você alterar a lógica (`server/src`):

1.  **Copie:** Copie os arquivos alterados da pasta `server` do seu PC para a VM.
    *   *Geralmente basta copiar a pasta `src`. Se instalou novas bibliotecas, copie o `package.json` também.*
2.  **Instale Dependências (Se necessário, na VM):**
    *   Se mudou o `package.json`:
        ```powershell
        cd server
        npm install
        ```
3.  **Atualize o Processo (Zero Downtime):**
    *   Ao invés de parar e iniciar, use o comando `reload` para reiniciar suavemente:
        ```powershell
        pm2 reload backend-pmo-hub
        ```
    *   *Ou se preferir garantir:*
        ```powershell
        pm2 restart backend-pmo-hub
        ```

## 3. Nginx
Você **só** precisa mexer no Nginx se alterar configurações de rota ou nomes de domínio. Caso contrário, ele continua rodando quieto.

---

### Resumo Rápido
- **Frontend:** `npm run build` -> Copiar `dist` -> Substituir na VM.
- **Backend:** Copiar arquivos -> `pm2 reload backend-pmo-hub`.
