
import asyncio

from app.database import db, client
from app.data.sample_songs import CATALOG


async def main():
    try:
        existing = await db.songs.find(
            {}, {"title": 1, "_id": 0}
        ).to_list(length=None)

        existing_titles = {
            song["title"].casefold()
            for song in existing
            if song.get("title")
        }

        bollywood_songs = [
            song for song in CATALOG
            if song.get("genre") == "bollywood"
        ]

        new_songs = [
            song for song in bollywood_songs
            if song["title"].casefold() not in existing_titles
        ]

        if new_songs:
            await db.songs.insert_many(new_songs)

        print("Bollywood songs inserted:", len(new_songs))
        print("Already present:", len(bollywood_songs) - len(new_songs))
        print("Total songs in database:", await db.songs.count_documents({}))

    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(main())
