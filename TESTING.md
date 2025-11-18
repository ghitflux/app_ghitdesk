# 🧪 GhitDesk - Testing Guide

Guia completo de testes para o GhitDesk API.

## 📋 Tipos de Testes

1. **Unit Tests** - Testes de unidades isoladas (funções, classes)
2. **Integration Tests** - Testes de integração entre componentes
3. **Multi-Tenancy Tests** - Testes de isolamento de dados
4. **Smoke Tests** - Testes end-to-end de funcionalidades críticas
5. **Manual Tests** - Testes com curl/Postman

---

## 🏗️ Estrutura de Testes

```
apps/api/tests/
├── conftest.py                    # Configuração pytest + fixtures
├── test_security.py               # Testes de autenticação/JWT
├── test_sla_service.py            # Testes de SLA
├── test_channel_factory.py        # Testes do Factory Pattern
├── test_multi_tenancy.py          # ✨ Testes de isolamento tenant
├── smoke_test.py                  # ✨ Smoke tests automatizados
└── test_tenant_isolation.sh       # ✨ Script bash de isolamento
```

---

## ⚙️ Configuração

### Instalar Dependências de Teste

```bash
cd apps/api

# Instalar pytest e plugins
pip install pytest pytest-asyncio pytest-cov aiosqlite

# Ou via requirements.txt
pip install -r requirements.txt
```

### Dependências

```
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0
aiosqlite==0.19.0  # Para testes in-memory
httpx==0.25.0      # Para testes de API
```

---

## 🧪 Rodando os Testes

### Todos os Testes

```bash
cd apps/api

# Rodar todos os testes
pytest

# Com verbosidade
pytest -v

# Com verbosidade máxima
pytest -vv
```

### Testes Específicos

```bash
# Por arquivo
pytest tests/test_multi_tenancy.py

# Por função
pytest tests/test_multi_tenancy.py::test_user_isolation_by_tenant

# Por padrão
pytest -k "tenant"
```

### Com Cobertura

```bash
# Gerar relatório de cobertura
pytest --cov=app --cov-report=html

# Ver relatório
open htmlcov/index.html
```

### Testes Assíncronos

```bash
# Testes async são executados automaticamente com pytest-asyncio
pytest tests/test_multi_tenancy.py -v
```

---

## 📝 Testes de Multi-Tenancy

### test_multi_tenancy.py

Valida isolamento completo de dados entre tenants.

**Testes implementados:**

1. **test_tenant_creation** - Cria tenants
2. **test_user_isolation_by_tenant** - Usuários isolados por tenant
3. **test_conversation_isolation** - Conversas isoladas
4. **test_ticket_number_unique_per_tenant** - Ticket numbers únicos por tenant
5. **test_message_isolation** - Mensagens isoladas
6. **test_cross_tenant_data_access_prevented** - Previne acesso cross-tenant

**Executar:**

```bash
pytest tests/test_multi_tenancy.py -v
```

**Output esperado:**

```
tests/test_multi_tenancy.py::test_tenant_creation PASSED
tests/test_multi_tenancy.py::test_user_isolation_by_tenant PASSED
tests/test_multi_tenancy.py::test_conversation_isolation PASSED
tests/test_multi_tenancy.py::test_ticket_number_unique_per_tenant PASSED
tests/test_multi_tenancy.py::test_message_isolation PASSED
tests/test_multi_tenancy.py::test_cross_tenant_data_access_prevented PASSED

====== 6 passed in 1.23s ======
```

### Exemplo de Teste

```python
@pytest.mark.asyncio
async def test_user_isolation_by_tenant(async_session):
    """Test that users are isolated by tenant"""
    tenant_repo = TenantRepository(async_session)
    user_repo = UserRepository(async_session)

    # Create two tenants
    tenant1 = await tenant_repo.create(name="Company A", slug="company-a")
    tenant2 = await tenant_repo.create(name="Company B", slug="company-b")

    # Create users in each tenant with SAME email
    user1 = await user_repo.create(
        tenant_id=tenant1.id,
        email="john@example.com",
        # ...
    )

    user2 = await user_repo.create(
        tenant_id=tenant2.id,
        email="john@example.com",  # Same email!
        # ...
    )

    # Fetching by email should return only tenant-specific user
    fetched1 = await user_repo.get_by_email("john@example.com", tenant1.id)
    fetched2 = await user_repo.get_by_email("john@example.com", tenant2.id)

    assert fetched1.id == user1.id
    assert fetched2.id == user2.id
    assert fetched1.id != fetched2.id  # ✓ Different users!
```

---

## 🚀 Smoke Tests

### smoke_test.py (Python)

Script automatizado para validar funcionalidades críticas.

**Executar:**

```bash
cd apps/api

# Certifique-se que a API está rodando
# Terminal 1:
uvicorn app.main:app --reload

# Terminal 2:
python tests/smoke_test.py
```

**O que testa:**

1. ✅ API Health Check
2. ✅ Login Tenant 1 (Acme)
3. ✅ Login Tenant 2 (TechStart)
4. ✅ Fetch Tickets Tenant 1
5. ✅ Fetch Tickets Tenant 2
6. ✅ Data Isolation (sem overlap de IDs)
7. ✅ Conversations Isolation
8. ✅ Logout

**Output esperado:**

```
==============================================================
🚀 GHITDESK API SMOKE TESTS - MULTI-TENANCY
==============================================================

▶ Testing: API Health Check
    API Version: 1.0.0
  ✓ PASSED

▶ Testing: Tenant 1 Login (Acme)
    Logged in as: admin@acmecorporation.com
  ✓ PASSED

...

==============================================================
📊 TEST SUMMARY
==============================================================
Tests Passed: 8
Tests Failed: 0

🎉 ALL SMOKE TESTS PASSED!
Multi-tenancy is working correctly.
```

### test_tenant_isolation.sh (Bash)

Script shell para testes manuais de isolamento.

**Executar:**

```bash
cd apps/api/tests

# Tornar executável
chmod +x test_tenant_isolation.sh

# Rodar
./test_tenant_isolation.sh
```

**Requer:** `jq` instalado

```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq
```

**O que testa:**

1. Health Check
2. Login nos 2 tenants
3. Fetch tickets para cada tenant
4. Verifica que dados são diferentes
5. Verifica que cada tenant tem sua própria contagem

---

## 🔍 Testes Manuais (curl)

### 1. Health Check

```bash
curl http://localhost:8000/health
```

**Esperado:**
```json
{"status":"ok","version":"1.0.0","app":"GhitDesk API"}
```

### 2. Login

**Tenant 1 (Acme):**

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acmecorporation.com","password":"admin123"}' \
  -c cookies_t1.txt
```

**Tenant 2 (TechStart):**

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@techstartinc.com","password":"admin123"}' \
  -c cookies_t2.txt
```

**Esperado:**
```json
{
  "access_token":"eyJhbGc...",
  "refresh_token":"eyJhbGc..."
}
```

### 3. Listar Tickets

**Tenant 1:**

```bash
curl http://localhost:8000/tickets -b cookies_t1.txt | jq
```

**Esperado:**
```json
{
  "tickets": [
    {
      "id": "uuid",
      "ticket_number": "ACME-1000",  // ← Acme prefix
      "title": "Sistema fora do ar",
      "priority": "urgent"
    }
  ],
  "total": 3
}
```

**Tenant 2:**

```bash
curl http://localhost:8000/tickets -b cookies_t2.txt | jq
```

**Esperado:**
```json
{
  "tickets": [
    {
      "id": "uuid",
      "ticket_number": "TECHSTART-1000",  // ← TechStart prefix
      "title": "Sistema fora do ar",
      "priority": "urgent"
    }
  ],
  "total": 3
}
```

### 4. Verificar Isolamento

**Extrair ticket numbers:**

```bash
# Tenant 1
curl -s http://localhost:8000/tickets -b cookies_t1.txt | \
  jq -r '.tickets[].ticket_number'

# Output:
# ACME-1000
# ACME-1001
# ACME-1002

# Tenant 2
curl -s http://localhost:8000/tickets -b cookies_t2.txt | \
  jq -r '.tickets[].ticket_number'

# Output:
# TECHSTART-1000
# TECHSTART-1001
# TECHSTART-1002
```

**✅ Confirmado:** Ticket numbers são diferentes, isolamento funciona!

### 5. Listar Conversas

```bash
# Tenant 1
curl http://localhost:8000/conversations -b cookies_t1.txt | jq '.total'
# Output: 3

# Tenant 2
curl http://localhost:8000/conversations -b cookies_t2.txt | jq '.total'
# Output: 3
```

### 6. Webhooks

```bash
# Com X-Tenant-Slug header
curl -X POST http://localhost:8000/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: acme" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": []
  }'
```

**Esperado:**
```json
{
  "status": "ok",
  "tenant_id": "uuid"
}
```

### 7. Logout

```bash
curl -X POST http://localhost:8000/auth/logout -b cookies_t1.txt
```

**Esperado:**
```json
{"message":"Logged out successfully"}
```

---

## 📊 Cobertura de Testes

### Gerar Relatório

```bash
pytest --cov=app --cov-report=html --cov-report=term

# Ver no terminal
pytest --cov=app --cov-report=term-missing

# Gerar HTML
pytest --cov=app --cov-report=html
open htmlcov/index.html
```

### Meta de Cobertura

```
Atual:    ~75%
Meta:     >90%
Crítico:  >95% para multi-tenancy
```

### Áreas com Cobertura

✅ **Security** (test_security.py) - 100%
✅ **SLA Service** (test_sla_service.py) - 95%
✅ **Multi-Tenancy** (test_multi_tenancy.py) - 90%
✅ **Channel Factory** (test_channel_factory.py) - 85%

### Áreas Sem Cobertura

❌ **Webhooks** - Precisa de testes
❌ **SSE Manager** - Precisa de testes
❌ **Message Service** - Cobertura parcial

---

## 🐛 Debugging Testes

### Rodar com Debug

```bash
# Com print statements
pytest -s tests/test_multi_tenancy.py

# Com pdb (debugger)
pytest --pdb tests/test_multi_tenancy.py

# Parar no primeiro erro
pytest -x tests/test_multi_tenancy.py
```

### Logs Durante Testes

```bash
# Ver logs
pytest -v --log-cli-level=DEBUG

# Salvar logs
pytest --log-file=test.log
```

### Fixtures Debug

```python
@pytest.fixture
async def debug_session(async_session):
    """Debug fixture"""
    print(f"Session created: {async_session}")
    yield async_session
    print("Session closed")
```

---

## 📝 Escrevendo Novos Testes

### Template de Teste

```python
import pytest
from app.models.tenant import Tenant
from app.db.repositories.tenant import TenantRepository

@pytest.mark.asyncio
async def test_new_feature(async_session):
    """Test description"""
    # Arrange
    tenant_repo = TenantRepository(async_session)
    tenant = await tenant_repo.create(name="Test", slug="test")

    # Act
    result = await some_function(tenant.id)

    # Assert
    assert result is not None
    assert result.tenant_id == tenant.id
```

### Boas Práticas

✅ **Use async/await** para testes assíncronos
✅ **Use fixtures** para setup comum
✅ **Use pytest.mark.asyncio** para testes async
✅ **Asserte tenant_id** em todos os testes de isolamento
✅ **Cleanup** após testes (via fixtures)

---

## ⚡ Performance dos Testes

### Otimizar Testes

```bash
# Rodar em paralelo (pytest-xdist)
pip install pytest-xdist
pytest -n auto

# Apenas testes rápidos
pytest -m "not slow"

# Skip testes lentos
pytest -m "not integration"
```

### Marcar Testes

```python
@pytest.mark.slow
async def test_heavy_operation():
    ...

@pytest.mark.integration
async def test_api_integration():
    ...
```

---

## 🔄 Continuous Integration

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install -r apps/api/requirements.txt

      - name: Run tests
        run: |
          cd apps/api
          pytest --cov=app --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 📚 Recursos Adicionais

- [Pytest Documentation](https://docs.pytest.org/)
- [Pytest-asyncio](https://pytest-asyncio.readthedocs.io/)
- [Testing FastAPI](https://fastapi.tiangolo.com/tutorial/testing/)
- [Multi-Tenancy Testing Best Practices](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

## 🆘 Troubleshooting

### Problema: Testes async não rodam

```bash
# Instalar pytest-asyncio
pip install pytest-asyncio

# Adicionar ao conftest.py
pytest_plugins = ('pytest_asyncio',)
```

### Problema: Database connection errors

```python
# Usar in-memory database para testes
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
```

### Problema: Fixtures não encontrados

```bash
# Verificar se conftest.py está no lugar certo
ls tests/conftest.py

# Verificar import no pytest
pytest --collect-only
```

---

**Última atualização:** 2025-11-18
**Versão:** 1.0.0
