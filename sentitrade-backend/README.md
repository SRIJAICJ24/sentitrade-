# SentiTrade Backend

Real-time cryptocurrency sentiment and trading signal API.

## Quick Start

### Local Development (with Docker)

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- FastAPI backend on port 8000

### Local Development (without Docker)

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up PostgreSQL and create `.env` file:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Run the server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Health
- `GET /health` - Health check

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Sentiment
- `GET /api/v1/sentiment/overall` - Current sentiment
- `GET /api/v1/sentiment/history` - Sentiment history

### Signals
- `GET /api/v1/signal/latest` - Latest trading signal
- `GET /api/v1/signal/history` - Signal history

### Whales
- `GET /api/v1/whale/recent` - Recent whale activity
- `GET /api/v1/whale/smart-money` - Smart money score

### Price
- `GET /api/v1/price/chart` - Price chart data
- `GET /api/v1/price/divergence` - Divergence data

### Alerts
- `GET /api/v1/alert/preferences` - Alert preferences
- `PUT /api/v1/alert/preferences/{id}` - Update preference
- `GET /api/v1/alert/history` - Alert history

### WebSocket
- `WS /ws?token=<jwt>` - Real-time updates

## Tech Stack
- FastAPI
- PostgreSQL + SQLAlchemy (async)
- JWT Authentication
- WebSocket for real-time data
