# Indian Market Logic & Data Quality Protocol 🇮🇳

**Role**: Senior Data Scientist / Quant Analyst
**Scope**: NSE/BSE Equity & Derivatives
**Goal**: Production-Grade Reliability for SentiTrade Pro

---

## 1. Indian Market Data Rules (The "Physics" of the Market)

To be realistic, your system must obey the strict laws of Indian exchanges.

### 🕒 Time & Sessions
1.  **Timezone**: Standard is **IST (UTC+5:30)**.
    *   *Warning*: `yfinance` returns dates in UTC. You **MUST** convert: `timestamp_utc + 5h 30m`.
2.  **Market Hours (Equity)**:
    *   **Pre-Open**: 09:00 - 09:15 IST (Random order matching, price discovery).
    *   **Normal Trading**: **09:15 - 15:30 IST**. (This is where your algorithms run).
    *   **Post-Closing**: 15:30 - 15:40 IST (Closing price calculation).
3.  **Holidays**: NSE/BSE have unique holidays (Diwali, Holi, Gurunanak Jayanti). Your system must **not** expect data on these days.

### 📉 Price & Volume Behavior
1.  **Circuit Filters (LSRP/USRP)**: Indian stocks have upper/lower trade limits (2%, 5%, 10%, 20%) daily.
    *   *Realistic Rule*: Price for standard stocks **cannot** jump 50% in a day. If you see this, it's bad data (or a massive corporate action).
    *   *Indices (NIFTY 50)*: Do not have circuit limits, but have "Cooling Periods" on 10% drops.
2.  **Tick Size**: Minimum price movement is **₹0.05**.
    *   *Audit*: If you see `1500.123`, round it to `1500.10` or `1500.15`.
3.  **Volume**: Can be zero for illiquid stocks, but **never negative**.

### 🏷️ Symbology
*   **Yahoo Finance**:
    *   NSE: `RELIANCE.NS`, `TCS.NS`
    *   BSE: `RELIANCE.BO`, `500325.BO`
    *   Indices: `^NSEI` (Nifty 50), `^BSESN` (Sensex).

---

## 2. Data Quality Audit: Why your MVP feels "Fake"

If your dashboard looks weird, 99% of the time it is one of these `yfinance` specific issues:

1.  **Zero-Volume Bars**: `yfinance` often returns 0 volume for indices (Nifty). You need to fetch `^NSEI` price but maybe verify volume from a proxy like `NIFTYBEES.NS` ETF if critical.
2.  **The "Exchange Delayed" Flag**: Free data is often delayed by 15 mins. If you mix "Live Twitter Sentiment" with "15-min old Price", your divergence detection will be **wrong**.
3.  **Adjusted Close Confusion**:
    *   `yfinance` defaults to *Adjusted* Close (subtracting dividends).
    *   *Issue*: Intraday signals need *Unadjusted* (Raw) price because that's what people traded at.
    *   *Fix*: Use `auto_adjust=False` when fetching.
4.  **Look-Ahead Bias**: In backtesting, using the "Close" price of 10:00 AM while simulating a trade at 10:00 AM is risky. Use "Open" of 10:01 AM or "Close" of 10:00 only if executing at 10:01.

---

## 3. Validation Rules Checklist (Min 40 rules)

Before saving any data row, pass it through this `Validator` function.

### A. Timestamp Integrity (Critical)
1.  [ ] `timestamp` is not NULL.
2.  [ ] `timestamp` is convertible to IST.
3.  [ ] `timestamp` hour is between 09 and 15.
4.  [ ] `timestamp` minute is not > 59.
5.  [ ] `timestamp` is strictly increasing (Monotonic check).
6.  [ ] No duplicate timestamps for the same `asset_code`.
7.  [ ] Gap Check: If `time_diff` > 5 mins (during market hrs), flag "Data Gap".

### B. OHLC Logic (Sanity)
8.  [ ] `High` >= `Open`
9.  [ ] `High` >= `Close`
10. [ ] `High` >= `Low` (The "High" cannot be lower than "Low").
11. [ ] `Low` <= `Open`
12. [ ] `Low` <= `Close`
13. [ ] `Price` > 0 (No negative prices).
14. [ ] `Volume` >= 0.

### C. Statistical Outliers (Z-Score)
15. [ ] `(Close - Open) / Open` < 0.20 (20% max intraday move expectation).
16. [ ] `High` is not > 1.5x of `prev_close` (Flash spike check).
17. [ ] `Low` is not < 0.5x of `prev_close` (Flash crash check).
18. [ ] Volume Spike: If `current_vol > 50 * avg_vol_20d`, flag "Anomaly".

### D. Sentiment & Social
19. [ ] `sentiment_score` is between 0 and 100 (or -1 to 1).
20. [ ] `source_count` > 0 if score exists.
21. [ ] Text Language is 'en' or 'hi' (Hindi).
22. [ ] Blocklist check: Text must not contain crypto spam keywords on stock tickers (e.g., "Airdrop" on "RELIANCE").

### E. Corporate Actions
23. [ ] Sudden drop of > 30% without volume spike? Check for **Stock Split** (e.g. 1:10).
24. [ ] Sudden drop of ~2-5%? Check for **Dividend Ex-Date**.

---

## 4. The "Realism" Pipeline Plan

Here is the exact Python recipe to fix your data:

#### Step 1: The "Indian" Fetcher
```python
import yfinance as yf
import pandas as pd

def fetch_india_live(ticker):
    # .NS mandatory for NSE
    sym = f"{ticker}.NS" if not ticker.endswith(('.NS', '.BO')) else ticker
    
    # fetch 1d/1m or 5d/5m. 
    # IMPORTANT: auto_adjust=False keeps prices executing-realistic
    df = yf.download(sym, period="1d", interval="5m", auto_adjust=False)
    
    # Timezone Fix
    df.index = df.index.tz_convert('Asia/Kolkata')
    return df
```

#### Step 2: The Resampler (Normalization)
Raw yfinance data has gaps. You must **Forward Fill** prices, but **Zero Fill** volume.
*   *Why?* If no trade happens for 1 minute, Price is the same as last minute, but Volume is 0.

#### Step 3: Source Weighting (The "Senti" Part)
Don't treat random Twitter users same as "CNBC-TV18".
*   `CNBC-TV18` / `Reuters` / `MoneyControl`: **Weight 3.0**
*   `Verified Traders` (>10k followers): **Weight 1.5**
*   `Random User`: **Weight 0.5**
*   `Reddit (r/IndianStreetBets)`: **Weight 1.0** (High noise, but high alpha).

---

## 5. Final Output Schema

Store your data in these clean tables.

### Table: `market_data_cleaned`
| Column | Type | Description |
| :--- | :--- | :--- |
| `timestamp_ist` | DATETIME | Primary Index. Indian Standard Time. |
| `asset_code` | VARCHAR | E.g., RELIANCE.NS |
| `open` | FLOAT | Round to 2 decimals. |
| `high` | FLOAT | Round to 2 decimals. |
| `low` | FLOAT | Round to 2 decimals. |
| `close` | FLOAT | Round to 2 decimals. |
| `volume` | INT | No decimals. |
| `quality_flag` | INT | 0=Good, 1=Interpolated, 2=Outlier |

### Table: `sentiment_features`
| Column | Type | Description |
| :--- | :--- | :--- |
| `timestamp_ist` | DATETIME | Aligned to 5m candle. |
| `raw_score` | FLOAT | 0-100 FinBERT output. |
| `volume_weighted_score` | FLOAT | Score * (Social Volume / Avg Volume). |
| `divergence_status` | ENUM | 'NONE', 'BULL_DIV', 'BEAR_DIV'. |
| `primary_emotion` | VARCHAR | 'Fear', 'Greed', 'Neutral'. |

---

## 6. Synthetic Realistic Sample (RELIANCE.NS)

**Scenario**: 10:00 AM Bullish Divergence Setup.
**Context**: Price is choppy/flat, but Sentiment is exploding due to a leak about a "Jio IPO".

| timestamp_ist | open | high | low | close | volume | sent_score | div_flag | signal | confidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 2024-06-15 09:55:00 | 2950.00 | 2955.00 | 2948.00 | 2951.05 | 125000 | 55.0 | NONE | HOLD | 0 |
| 2024-06-15 10:00:00 | 2951.05 | 2952.00 | 2945.00 | 2946.00 | 145000 | 62.0 | NONE | HOLD | 0 |
| 2024-06-15 10:05:00 | 2946.00 | 2948.00 | 2942.00 | 2943.50 | 180000 | 78.5 | BULL | **BUY** | 82 |
| 2024-06-15 10:10:00 | 2943.50 | 2955.00 | 2943.00 | 2954.00 | 450000 | 88.0 | NONE | HOLD | 85 |
| 2024-06-15 10:15:00 | 2954.00 | 2962.00 | 2952.00 | 2960.00 | 320000 | 85.0 | NONE | HOLD | 84 |
| 2024-06-15 10:20:00 | 2960.00 | 2965.00 | 2958.00 | 2963.25 | 290000 | 81.0 | NONE | HOLD | 80 |
| 2024-06-15 10:25:00 | 2963.25 | 2964.00 | 2955.00 | 2958.00 | 150000 | 79.0 | NONE | HOLD | 78 |
| 2024-06-15 10:30:00 | 2958.00 | 2960.00 | 2956.00 | 2959.00 | 110000 | 77.0 | NONE | HOLD | 75 |
| 2024-06-15 10:35:00 | 2959.00 | 2961.00 | 2958.00 | 2960.50 | 95000 | 75.0 | NONE | HOLD | 72 |
| 2024-06-15 10:40:00 | 2960.50 | 2962.00 | 2959.00 | 2961.00 | 88000 | 74.0 | NONE | HOLD | 70 |

**Why Real?**:
1.  **Price**: Moves in ₹0.05 ticks.
2.  **Logic**: At 10:05, Price dropped (`2946` -> `2943`), but Sentiment spiked (`62` -> `78`). This is a **Bullish Divergence**.
3.  **Volume**: Spikes (`450k`) *after* the signal candle (10:10), validating the breakout.
