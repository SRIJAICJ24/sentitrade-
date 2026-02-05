
import os
import json
import yfinance as yf
from datetime import datetime
import sys

print("--- DIAGNOSTIC START ---")

# 1. Test JSON Loading
print("\n[1] Testing NIFTY Database Loading...")
base_dir = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(base_dir, "app", "data", "nifty_500.json")
print(f"    Target Path: {json_path}")

try:
    if os.path.exists(json_path):
        with open(json_path, "r") as f:
            data = json.load(f)
        print(f"    ✅ SUCCESS: Loaded {len(data)} items.")
        print(f"    Sample: {data[0]}")
    else:
        print("    ❌ FAILED: File does not exist at path.")
except Exception as e:
    print(f"    ❌ ERROR: {e}")

# 2. Test YFinance
print("\n[2] Testing YFinance Connectivity (RELIANCE.NS)...")
try:
    ticker = yf.Ticker("RELIANCE.NS")
    # Fetch just 1 day
    hist = ticker.history(period="1d")
    
    if not hist.empty:
        print(f"    ✅ SUCCESS: Fetched Data.")
        print(f"    Latest Close: {hist['Close'].iloc[-1]}")
        print(f"    Volume: {hist['Volume'].iloc[-1]}")
    else:
        print("    ⚠️ WARNING: YFinance returned empty data (Market might be closed or Ticker invalid).")
        print("    Attempting ^NSEI (Nifty 50)...")
        nifty = yf.Ticker("^NSEI")
        hist_nifty = nifty.history(period="1d")
        if not hist_nifty.empty:
             print(f"    ✅ SUCCESS: Fetched Nifty 50. YFinance is working.")
        else:
             print("    ❌ FAILED: YFinance returned empty for Nifty 50 too.")

except Exception as e:
    print(f"    ❌ CRITICAL ERROR: YFinance failed. Reason: {e}")

print("\n--- DIAGNOSTIC END ---")
