# SentiTrade: AI-Powered Sentiment Trading Dashboard
### 🚀 Hackathon Submission - Unified System

## 1. Project Overview
SentiTrade is a real-time trading dashboard that combines **Financial Sentiment Analysis (FinBERT)** with **Live Market Data** to generate trading signals. It features a "Glassmorphic" UI, simulated Whale Alerts, and an explainable AI console.

**Key Capabilities:**
- **Real-Time Sentiment Analysis**: Uses local `FinBERT` model to score news headlines.
- **Live Market Data**: Pulls live prices for Crypto (BTC, ETH) and Stocks (AAPL) via Yahoo Finance.
- **XAI Console**: "Brain View" showing the AI's step-by-step decision making.
- **Guardian AI**: background service protecting portfolios from sentiment crashes.
- **Whale Tracker**: Monitors and alerts on large (simulated) wallet movements.
- **Unified Deployment**: Frontend is built and served directly by the Backend (Single URL).

---

## 2. Architecture
The project is a **Monorepo** containing:

### 🖥️ Frontend (`/sentitrade-frontend`)
- **Tech**: React 18, TypeScript, Vite, TailwindCSS
- **Components**:
  - `SentiQuantConsole`: Explainable AI stream.
  - `PatternRadar`: Visualizes chart patterns.
  - `BacktestResults`: Monte Carlo simulation results.
  - `WhaleTracker`: Live feed of large transactions.

### ⚙️ Backend (`/sentitrade-backend`)
- **Tech**: FastAPI (Python), SQLAlchemy, SQLite (Async), FinBERT (HuggingFace)
- **Services**:
  - `SentimentStreamer`: Runs the AI model loop.
  - `SignalGenerator`: Combines price + sentiment for Buy/Sell signals.
  - `GuardianService`: Risk management and stop-loss monitoring.

---

## 3. How to Run (Zero-Config)

We have unified the build. You only need Python installed.

### Prerequisites
- Python 3.10+
- Node.js 18+ (Only if you want to modify frontend code)

### Step 1: Install Backend Dependencies
```bash
cd sentitrade-backend
pip install -r requirements.txt
```

### Step 2: Run the Unified Server
```bash
# From sentitrade-backend directory
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
*Note: The first run will take ~30s to download the FinBERT model.*

### Step 3: Access
Open your browser to: **`http://localhost:8000`**

---

## 4. Development Workflow

If you want to edit the Frontend:
1. Open a new terminal in `/sentitrade-frontend`
2. Run `npm run dev`
3. Edit files -> See changes at `http://localhost:5173`
4. When finished, run `npm run build` to update the main server.

---

## 5. Deployment
The project is ready for deployment on platforms like Railway or Render.
- **Docker**: A `Dockerfile` is included in `sentitrade-backend` that builds the whole app.
