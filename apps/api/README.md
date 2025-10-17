# GhitDesk API

FastAPI backend será implementado na ETAPA 3.

## Stack
- FastAPI
- SQLAlchemy 2.0 async
- Postgres 16
- Redis 7
- Alembic migrations

## Setup

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload
```
