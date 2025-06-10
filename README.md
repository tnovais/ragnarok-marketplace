# 🏰 Ragnarok Marketplace

Marketplace completo para compra e venda de itens do MMORPG Ragnarok Online com sistema de custódia, disputas e pagamentos via Pix.

## 🚀 Funcionalidades

### ✅ **Sistema de Usuários**
- Cadastro e login padrão ou via Google
- Perfil com carteira virtual e reputação
- Sistema de avaliações pós-transação

### ✅ **Marketplace**
- Anúncios da comunidade com filtros avançados
- Produtos oficiais do site com entrega garantida
- Sistema de destaque para anúncios (R$20/mês)
- Busca por servidor (Freya, Nidhogg, Yggdrasil)

### ✅ **Transações Seguras**
- Sistema de custódia de pagamentos
- Confirmação de entrega por ambas as partes
- Período de 7 dias para abertura de disputas
- Taxas dinâmicas: 15% (<R$200) / 10% (≥R$200) / 6% (destacados)

### ✅ **Sistema de Disputas**
- Abertura de disputas até 7 dias após transação
- Envio de evidências (capturas de tela, vídeos)
- Moderação humana com resolução em 72h
- Reembolso automático ou liberação de pagamento

### ✅ **Dashboard Completo**
- Estatísticas de vendas e compras
- Saldo disponível vs em custódia
- Taxa de conversão de anúncios
- Histórico detalhado de transações

### ✅ **Painel de Moderação**
- Gestão de disputas e usuários
- Controle de produtos do site
- Relatórios e estatísticas
- Sistema de fornecedores

## 🛠️ Tecnologias

### **Backend**
- **Bun** - Runtime JavaScript ultra-rápido
- **Elysia** - Framework web moderno para Bun
- **Prisma** - ORM type-safe
- **PostgreSQL** - Banco de dados para produção
- **SQLite** - Banco de dados para desenvolvimento

### **Frontend**
- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool moderna
- **Tailwind CSS** - Framework CSS utility-first
- **Shadcn/UI** - Componentes UI modernos
- **React Router** - Roteamento SPA

### **Infraestrutura**
- **Docker** - Containerização
- **Nginx** - Servidor web e proxy reverso
- **Redis** - Cache (opcional)

## 📋 Pré-requisitos

- **Node.js** 18+ 
- **Bun** 1.0+
- **PNPM** (para frontend)
- **Docker** e **Docker Compose**
- **PostgreSQL** (para produção)

## 🚀 Instalação e Configuração

### 1. **Clone o Repositório**
```bash
git clone https://github.com/tnovais/ragnarok-marketplace.git
cd ragnarok-marketplace
```

### 2. **Setup Inicial**
```bash
# Instalar dependências e configurar ambiente
npm run setup
```

### 3. **Desenvolvimento**
```bash
# Iniciar backend e frontend simultaneamente
npm run dev

# Ou separadamente:
npm run dev:backend  # Backend na porta 3001
npm run dev:frontend # Frontend na porta 5173
```

## 🧪 Teste Local em Produção

Para testar o projeto em modo produção localmente:

```bash
# Iniciar teste em modo produção
npm run test:prod
```

Isso irá:
1. Configurar PostgreSQL em container Docker
2. Aplicar migrações de produção
3. Iniciar backend em modo produção (porta 3001)
4. Fazer build e servir frontend (porta 4173)

**URLs de Teste:**
- Frontend: http://localhost:4173
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/swagger

## 🚀 Deploy para Produção

### **Opção 1: Deploy com Docker (Recomendado)**

1. **Configure as variáveis de ambiente:**
```bash
# Edite o arquivo backend/.env.production
cp backend/.env.production backend/.env.production.local
nano backend/.env.production.local
```

2. **Execute o deploy:**
```bash
npm run deploy
```

### **Opção 2: Deploy Manual**

1. **Servidor com PostgreSQL:**
```bash
# Instalar PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Criar banco de dados
sudo -u postgres createdb ragnarok_marketplace
```

2. **Configurar Backend:**
```bash
cd backend
cp .env.production .env
# Editar .env com suas configurações
nano .env

# Instalar dependências e migrar
bun install
bun run setup:prod
bun run start:prod
```

3. **Configurar Frontend:**
```bash
cd frontend
pnpm install
pnpm run build:prod

# Servir com Nginx
sudo cp dist/* /var/www/html/
```

## 🔧 Configuração de Produção

### **Variáveis de Ambiente Importantes**

**Backend (.env.production):**
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@localhost:5432/ragnarok_marketplace
JWT_SECRET=sua-chave-super-secreta-aqui
CORS_ORIGIN=https://seudominio.com
PAGSEGURO_EMAIL=seu@email.com
PAGSEGURO_TOKEN=seu_token_producao
```

### **Configuração de Domínio**

1. **Nginx para Frontend:**
```nginx
server {
    listen 80;
    server_name seudominio.com;
    root /var/www/ragnarok-marketplace;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

2. **SSL com Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com
```

## 📊 Monitoramento

### **Logs**
```bash
# Ver logs dos containers
npm run logs

# Logs específicos
docker-compose logs backend
docker-compose logs frontend
```

### **Banco de Dados**
```bash
# Acessar Prisma Studio
npm run db:studio

# Backup do banco
docker exec ragnarok-postgres pg_dump -U postgres ragnarok_marketplace > backup.sql
```

## 🔒 Segurança

### **Checklist de Produção:**
- [ ] Alterar JWT_SECRET para valor único e seguro
- [ ] Configurar CORS_ORIGIN para seu domínio
- [ ] Configurar SSL/HTTPS
- [ ] Configurar firewall (portas 80, 443, 22)
- [ ] Configurar backup automático do banco
- [ ] Configurar monitoramento de logs
- [ ] Configurar rate limiting
- [ ] Validar configurações do PagSeguro

## 📱 Integração com Gateway de Pagamento

### **PagSeguro/Pagar.me**
1. Criar conta no PagSeguro
2. Obter credenciais de produção
3. Configurar webhook para confirmação de pagamentos
4. Testar em ambiente sandbox primeiro

## 🛠️ Scripts Disponíveis

```bash
npm run setup          # Setup inicial do projeto
npm run dev            # Desenvolvimento (backend + frontend)
npm run build          # Build para produção
npm run test:prod      # Teste local em produção
npm run deploy         # Deploy com Docker
npm run db:studio      # Interface do banco de dados
npm run logs           # Ver logs dos containers
npm run stop           # Parar containers
npm run restart        # Reiniciar containers
```

## 🐛 Troubleshooting

### **Problemas Comuns:**

1. **Erro de conexão com banco:**
   - Verificar se PostgreSQL está rodando
   - Validar DATABASE_URL no .env

2. **Erro de CORS:**
   - Verificar CORS_ORIGIN no backend
   - Confirmar URLs do frontend

3. **Erro de build:**
   - Limpar node_modules e reinstalar
   - Verificar versões do Node/Bun

4. **Erro de migração:**
   - Verificar permissões do banco
   - Executar `npm run db:reset` se necessário

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs: `npm run logs`
2. Consultar documentação da API: http://localhost:3001/swagger
3. Abrir issue no GitHub

## 📄 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido com ❤️ para a comunidade Ragnarok Online**
