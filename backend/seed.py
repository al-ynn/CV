"""Idempotently insert any missing initial portfolio records into real MongoDB."""
import asyncio

from db import client, verify_database_connection
from server import seed_content


async def main():
    await verify_database_connection()
    await seed_content()
    print("Initial portfolio data is present in MongoDB (existing records were preserved).")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
