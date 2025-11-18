# 🚀 GhitDesk - Setup Guide

Guia completo para setup, configuração e deploy do GhitDesk com Multi-Tenancy.

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Setup Local](#setup-local)
- [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
- [Migrations](#migrations)
- [Seed Data](#seed-data)
- [Rodando a Aplicação](#rodando-a-aplicação)
- [Testes](#testes)
- [Deploy em Produção](#deploy-em-produção)

---

## 📦 Pré-requisitos

### Backend (FastAPI)
- Python 3.11+
- PostgreSQL 16+
- Redis 7+
- pip ou poetry

### Frontend (Next.js)
- Node.js 18+
- pnpm 8+

### Ferramentas Opcionais
- Docker & Docker Compose (recomendado)
- jq (para scripts de teste)
- curl (para testes manuais)

---

## 🔧 Setup Local

### 1. Clone o Repositório

```bash
git clone https://github.com/your-org/ghitdesk.git
cd ghitdesk
```

### 2. Setup do Backend (FastAPI)

```bash
cd apps/api

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt
```

### 3. Setup do Frontend (Next.js)

```bash
# Na raiz do projeto
pnpm install

# Ou apenas no frontend
cd apps/web
pnpm install
```

---

## 🗄️ Configuração do Banco de Dados

### Opção 1: Docker Compose (Recomendado)

```bash
# Na raiz do projeto
docker compose up -d

# Verificar se os containers estão rodando
docker compose ps

# Verificar logs
docker compose logs -f postgres redis
```

Isso irá subir:
- **PostgreSQL 16** na porta 5432
- **Redis 7** na porta 6379

### Opção 2: Instalação Manual

#### PostgreSQL

```bash
# Ubuntu/Debian
sudo apt-get install postgresql-16

# macOS (Homebrew)
brew install postgresql@16

# Criar banco de dados
createdb ghitdesk_db

# Criar usuário
psql -c "CREATE USER ghitdesk_user WITH PASSWORD 'ghitdesk_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE ghitdesk_db TO ghitdesk_user;"
```

#### Redis

```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS (Homebrew)
brew install redis

# Iniciar Redis
redis-server
```

---

## 📝 Variáveis de Ambiente

### Backend (.env)

Copie o arquivo de exemplo:

```bash
cd apps/api
cp .env.example .env
```

Edite `.env` com suas configurações:

```bash
# Database
DATABASE_URL=postgresql+asyncpg://ghitdesk_user:ghitdesk_password@localhost:5432/ghitdesk_db

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
JWT_REFRESH_EXPIRATION_DAYS=7

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:6006

# WhatsApp (opcional)
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_ID=your-phone-id
WHATSAPP_API_TOKEN=your-api-token

# App
DEBUG=True
APP_NAME=GhitDesk API
APP_VERSION=1.0.0
```

---

## 🔄 Migrations

### Aplicar Migrations

```bash
cd apps/api

# Ver status das migrations
alembic current

# Aplicar todas as migrations
alembic upgrade head

# Ver histórico
alembic history

# Reverter última migration (se necessário)
alembic downgrade -1
```

**Migrations disponíveis:**
1. `001_initial_tables` - Cria tabelas básicas (users, contacts, conversations, messages, tickets)
2. `002_add_multi_tenancy` - Adiciona suporte a multi-tenancy (tenants table + tenant_id em todas as tabelas)

### Verificar se Migrations Foram Aplicadas

```bash
# Verificar tabelas no PostgreSQL
psql ghitdesk_db -c "\dt"

# Deve mostrar:
# - tenants
# - users
# - contacts
# - conversations
# - messages
# - tickets
# - alembic_version
```

---

## 🌱 Seed Data

Popula o banco com dados de teste para 2 tenants:

```bash
cd apps/api
python seed_data.py
```

**Output esperado:**

```
🌱 Iniciando seed do banco de dados com Multi-Tenancy...

📝 Criando tenants...
  ✅ Tenant criado: Acme Corporation (acme)
  ✅ Tenant criado: TechStart Inc (techstart)

============================================================
🏢 Populando dados para tenant: Acme Corporation
============================================================

📝 Criando usuários para Acme Corporation...
  ✅ User criado: admin@acmecorporation.com
  ✅ User criado: joao@acmecorporation.com
  ✅ User criado: maria@acmecorporation.com
...

✅ Seed completo para todos os tenants!
🏢 Total de tenants: 2
  - Acme Corporation (slug: acme)
  - TechStart Inc (slug: techstart)
```

### Credenciais de Teste

**Tenant 1 - Acme Corporation:**
- Admin: `admin@acmecorporation.com` / `admin123`
- Agente: `joao@acmecorporation.com` / `agent123`
- Agente: `maria@acmecorporation.com` / `agent123`

**Tenant 2 - TechStart Inc:**
- Admin: `admin@techstartinc.com` / `admin123`
- Agente: `joao@techstartinc.com` / `agent123`
- Agente: `maria@techstartinc.com` / `agent123`

---

## 🚀 Rodando a Aplicação

### Backend (FastAPI)

```bash
cd apps/api

# Desenvolvimento (com hot-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Produção
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

API estará disponível em: `http://localhost:8000`

**Docs automáticas:**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Frontend (Next.js)

```bash
# Na raiz do projeto
pnpm dev

# Ou apenas o frontend
cd apps/web
pnpm dev
```

Frontend estará disponível em: `http://localhost:3000`

### Storybook

```bash
cd apps/web
pnpm storybook
```

Storybook estará disponível em: `http://localhost:6006`

---

## 🧪 Testes

### Testes Backend (pytest)

```bash
cd apps/api

# Rodar todos os testes
pytest

# Testes com cobertura
pytest --cov=app --cov-report=html

# Testes específicos
pytest tests/test_multi_tenancy.py -v

# Testes assíncronos
pytest tests/test_multi_tenancy.py::test_user_isolation_by_tenant -v
```

**Testes disponíveis:**
- `test_security.py` - Testes de autenticação e JWT
- `test_sla_service.py` - Testes de SLA
- `test_channel_factory.py` - Testes do Factory Pattern
- `test_multi_tenancy.py` - **NOVO** - Testes de isolamento de tenant

### Smoke Tests (Python)

Script automatizado para validar multi-tenancy:

```bash
cd apps/api

# Certifique-se que a API está rodando
# Em outro terminal: uvicorn app.main:app --reload

# Rodar smoke tests
python tests/smoke_test.py
```

### Testes de Isolamento (Bash)

Script shell para testar isolamento entre tenants:

```bash
cd apps/api/tests

# Tornar executável
chmod +x test_tenant_isolation.sh

# Rodar testes
./test_tenant_isolation.sh
```

**Requer:** API rodando + `jq` instalado

### Testes Manuais (curl)

#### 1. Health Check

```bash
curl http://localhost:8000/health
```

#### 2. Login Tenant 1

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acmecorporation.com","password":"admin123"}' \
  -c cookies_t1.txt
```

#### 3. Login Tenant 2

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@techstartinc.com","password":"admin123"}' \
  -c cookies_t2.txt
```

#### 4. Listar Tickets (Tenant 1)

```bash
curl http://localhost:8000/tickets -b cookies_t1.txt | jq
```

#### 5. Listar Tickets (Tenant 2)

```bash
curl http://localhost:8000/tickets -b cookies_t2.txt | jq
```

#### 6. Verificar Isolamento

Os tickets devem ser diferentes! Tenant 1 verá `ACME-1000`, Tenant 2 verá `TECHSTART-1000`.

---

## 🏗️ Deploy em Produção

### 1. Preparação

```bash
# Atualizar dependências
cd apps/api
pip freeze > requirements.txt

cd apps/web
pnpm install --frozen-lockfile
```

### 2. Variáveis de Ambiente (Produção)

**IMPORTANTE:** Altere os valores de produção:

```bash
# .env (produção)
DATABASE_URL=postgresql+asyncpg://user:pass@prod-db-host:5432/ghitdesk
REDIS_URL=redis://prod-redis-host:6379/0
JWT_SECRET=<generate-secure-key>
DEBUG=False
CORS_ORIGINS=https://ghitdesk.com
```

### 3. Migrations em Produção

```bash
# Sempre faça backup antes!
pg_dump ghitdesk_db > backup_$(date +%Y%m%d).sql

# Aplicar migrations
alembic upgrade head
```

### 4. Deploy com Docker

```bash
# Build images
docker build -t ghitdesk-api:latest ./apps/api
docker build -t ghitdesk-web:latest ./apps/web

# Run with docker-compose
docker compose -f docker-compose.prod.yml up -d
```

### 5. Deploy em Cloud (exemplo AWS)

#### Backend (ECS + RDS + ElastiCache)

```bash
# Configure AWS CLI
aws configure

# Push image to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin xxx.dkr.ecr.us-east-1.amazonaws.com

docker tag ghitdesk-api:latest xxx.dkr.ecr.us-east-1.amazonaws.com/ghitdesk-api:latest
docker push xxx.dkr.ecr.us-east-1.amazonaws.com/ghitdesk-api:latest

# Deploy ECS task
aws ecs update-service --cluster ghitdesk --service api --force-new-deployment
```

#### Frontend (Vercel)

```bash
# Conectar repositório ao Vercel
vercel

# Deploy
vercel --prod
```

---

## 🔐 Segurança em Produção

### Checklist de Segurança

- [ ] Trocar `JWT_SECRET` para valor aleatório e seguro
- [ ] Configurar HTTPS/TLS (certificado SSL)
- [ ] Habilitar `secure=True` nos cookies (requires HTTPS)
- [ ] Configurar CORS apenas para domínios autorizados
- [ ] Usar conexão SSL para PostgreSQL
- [ ] Habilitar Redis AUTH (senha)
- [ ] Configurar firewall (apenas portas necessárias)
- [ ] Habilitar rate limiting
- [ ] Configurar logging e monitoring
- [ ] Backups automáticos do banco
- [ ] Secrets management (AWS Secrets Manager, Vault, etc.)

---

## 📊 Monitoring

### Logs

```bash
# Backend logs
tail -f apps/api/logs/app.log

# Docker logs
docker compose logs -f api

# Logs de acesso
tail -f /var/log/nginx/access.log
```

### Métricas

Recomendado usar:
- **Prometheus** - métricas
- **Grafana** - dashboards
- **Sentry** - error tracking

---

## 🆘 Troubleshooting

### Problema: Migration falha

```bash
# Ver estado atual
alembic current

# Ver histórico
alembic history

# Reverter e reaplicar
alembic downgrade -1
alembic upgrade head
```

### Problema: Banco de dados não conecta

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar se usuário existe
psql -U ghitdesk_user -d ghitdesk_db -c "SELECT 1;"

# Testar conexão
psql postgresql://ghitdesk_user:ghitdesk_password@localhost:5432/ghitdesk_db
```

### Problema: Testes falham

```bash
# Verificar ambiente de teste
pytest --collect-only

# Rodar com mais verbosidade
pytest -vv

# Rodar um teste específico
pytest tests/test_multi_tenancy.py::test_tenant_creation -v
```

---

## 📚 Próximos Passos

1. Configure o ambiente local
2. Aplique as migrations
3. Rode o seed data
4. Teste a aplicação
5. Execute os smoke tests
6. Deploy em staging/produção

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs
2. Consulte a documentação
3. Abra uma issue no GitHub
4. Entre em contato com o time

---

**Última atualização:** 2025-11-18
