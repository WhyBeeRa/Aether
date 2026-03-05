import asyncio
from search_engine import AetherSearchEngine

async def main():
    se = AetherSearchEngine()
    print("Searching tools...")
    res = await se.semantic_search("אני רוצה לבנות אפליקציות")
    print("Result:", res)

if __name__ == "__main__":
    asyncio.run(main())
