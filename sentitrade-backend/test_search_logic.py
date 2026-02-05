
import asyncio
import logging
import sys
import os

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Mock settings
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test.db"

# Add current dir to path
sys.path.append(os.getcwd())

async def test_search():
    print("--- SEARCH LOGIC TEST ---")
    
    try:
        from app.services.market_data import MarketDataService
        service = MarketDataService()
        
        query = "TATA"
        print(f"Searching for: {query}")
        
        results = await service.search_assets(query)
        
        print(f"Results Found: {len(results)}")
        for r in results:
            print(f" - {r['symbol']}: {r['name']}")
            
        if len(results) == 0:
            print("❌ FAILURE: No results found for TATA.")
        else:
            print("✅ SUCCESS: Search logic is working.")

    except Exception as e:
        print(f"❌ CRITICAL ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_search())
