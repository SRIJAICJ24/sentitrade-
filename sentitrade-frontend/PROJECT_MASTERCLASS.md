# SentiTrade Pro: The Masterclass Guide 🎓

Welcome to the complete documentation of **SentiTrade Pro**. This guide is designed to take you from a **Beginner** (understanding concepts) to **Advanced** (understanding code architecture).

---

## 🏗️ 5. Architecture & Workflow (The "Big Picture")

Before looking at code, let's understand how the system works. It follows a **Client-Server Architecture**.

### The Workflow
1.  **Data Ingestion**: The system reads Market Data (Prices) and News (Text).
2.  **The "Brain" (Backend)**: Python analyzes this data using AI.
3.  **The API**: The Backend sends results to the Frontend.
4.  **The Interface (Frontend)**: React displays charts and alerts to the user.

### System Diagram
```mermaid
graph TD
    User[👤 User] -->|Interacts| UI[💻 Algo-Terminal (React)]
    
    subgraph Frontend [React + Vite]
        UI -->|HTTP Requests| API_Client
        UI -->|Listen Events| WebSocket_Client
    end
    
    subgraph Backend [FastAPI + Python]
        API_Client -->|REST API| Server[FastAPI Server]
        WebSocket_Client -->|Real-time| SocketManagerP[WebSocket Manager]
        
        Server -->|Queries| DB[(Database)]
        
        subgraph "AI Core / The Brain"
            Server -->|Trigger| SignalGen[Signal Generator]
            SignalGen -->|Uses| FinBERT[Sentiment Engine]
            SignalGen -->|Uses| WhaleTracker[Whale Watcher]
        end
    end
    
    WhaleTracker -->|Scans| Blockchain[Block Explorer Mock]
    FinBERT -->|Reads| NewsFeed[News Source Mock]
```

---

## 📚 1. Important Terms (The Vocabulary)

### Basic Level
-   **Frontend**: The visual part you see (Charts, Buttons, Neon UI). Built with **React**.
-   **Backend**: The hidden logic server. It calculates math and AI. Built with **Python**.
-   **API (Application Programming Interface)**: The messenger. The Frontend asks "Give me price", the API brings it from the Backend.
-   **Bullish**: Expecting price to go **UP** 📈 (Green/Neon).
-   **Bearish**: Expecting price to go **DOWN** 📉 (Red).

### Advanced Level
-   **WebSocket**: A permanent 2-way phone line between Server and Client. Unlike normal web pages that "refresh" to get new data, WebSockets push data *instantly* (milliseconds latency). Used for our **Live Price/Sentiment updates**.
-   **Divergence**: A powerful signal where **Price** goes one way, but **Sentiment** goes the other.
    *   *Example*: Price is dropping (Bearish), but Sentiment is rising (Bullish). This often predicts a reversal (Price will likely go up soon).
-   **JWT (JSON Web Token)**: The digital "ID Card". When you log in, you get a token. Every time you ask for private data (Portfolio), you show this token.

---

## 🧠 2. Important Algorithms (The Logic)

### 1. Sentiment Analysis (The "Feeling" Engine)
*   **Concept**: Computers reading news and deciding if it's "Good" or "Bad".
*   **Our Implementation**: We simulate **FinBERT**, a specific AI model trained on Financial Text.
*   **Code Location**: `app/models/sentiment.py`
*   **Logic**: Input Text ("Profit doubled") -> AI Model -> Output Score (0 to 100).
    *   `> 75`: Very Bullish
    *   `< 25`: Very Bearish

### 2. The Kelly Criterion (Risk Management)
*   **Concept**: A mathematical formula to decide **how much money** to invest based on your confidence.
*   **Why use it?**: To avoid "Going All In" and losing everything.
*   **Formula**: $f^* = \frac{bp - q}{b}$ (simplified in our code).
*   **Our Implementation**:
    *   Higher Confidence + Lower Volatility = **Larger Position Size**.
    *   Lower Confidence + High Volatility = **Smaller Position Size**.
*   **Code Location**: `app/services/signal_generator.py` -> `_calculate_kelly_position`

### 3. Divergence Detection
*   **Algorithm**:
    1.  Compare Price Change % over last hour.
    2.  Compare Sentiment Change % over last hour.
    3.  If `Price < -2%` AND `Sentiment > +5%` => **BULLISH DIVERGENCE**.

---

## 🛠️ 3. Important Functions (The Code Heroes)

These are the specific functions that run the show.

### Backend (Python)
1.  **`generate_signal(SignalContext)`**
    *   **Role**: The Master Decision Maker.
    *   **Input**: Price, Volatility, Sentiment Score, Whale Activity.
    *   **Process**:
        1. Checks if Sentiment is extreme (>75 or <25).
        2. Checks logic (Trend alignment).
        3. Calculates Risk (Stop Loss, Take Profit).
        4. Calculates Size (Kelly Criterion).
        5. Generates Explanation (XAI Code).
    *   **Output**: A concise `Signal` object ("BUY BTC, Entry $50k").

2.  **`authenticate_user()`**
    *   **Role**: The Bouncer.
    *   **Process**: Takes password -> Hashes it (encrypts it) -> Compares with Database -> Issues JWT Token.

### Frontend (React)
1.  **`useSignal()` (Custom Hook)**
    *   **Location**: `src/hooks/useSignal.ts`
    *   **Role**: The Listener.
    *   **Logic**: It connects to the WebSocket. When a message `signal:new` arrives, it automatically updates the React State, causing the UI to flash the new Trading Signal card instantly.

2.  **`PriceChart.tsx` (Component)**
    *   **Role**: The Visualizer.
    *   **Logic**: Uses `lightweight-charts` library. It draws 3 layers:
        *   Layer 1: Candlesticks (Price)
        *   Layer 2: Volume (Bars)
        *   Layer 3: Sentiment Overlay (Dashed Line)

---

## 🧰 4. Important Tools (The Tech Stack)

### Frontend (The Paint)
1.  **React 18**: The library for building the UI.
2.  **Vite**: The build tool (runs the server fast).
3.  **Tailwind CSS**: The styling engine (Classes like `bg-black`, `text-neon`).
4.  **Framer Motion**: The animation library (Smooth slides, fades).
5.  **Lightweight Charts**: The professional finance chart library (by TradingView).

### Backend (The Engine)
1.  **FastAPI**: The Python framework. It's *Fast* (updates real-time) and *Easy* (automatic documentation).
2.  **SQLAlchemy**: The Database translator. It lets us write Python code instead of SQL queries.
3.  **Uvicorn**: The server that runs the Python code.

---

## 🚀 Beginner to Pro: How to read this codebase?

1.  **Level 1 (Visuals)**:
    *   Go to `src/pages/`. This is where the screens are (`Dashboard.tsx`, `SentiQuantPage.tsx`).
    *   Change some text in `h1` tags and watch it update.

2.  **Level 2 (Data Flow)**:
    *   Look at `src/hooks/`. See how `useWebSocket` grabs data from the air.
    *   Look at `src/components/dashboard/`. See how `WealthVault` takes that data and loops through it (`.map()`) to make rows.

3.  **Level 3 (The Brain)**:
    *   Go to Backend `app/services/`.
    *   Read `signal_generator.py`. This is where the "Trading Strategy" lives. If you want to change *how* it trades, you change this file.

---
*Created by your AI Pair Programmer for SentiTrade Pro.*
