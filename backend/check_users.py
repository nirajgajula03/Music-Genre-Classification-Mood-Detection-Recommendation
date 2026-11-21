import asyncio
from app.database import db, client
from passlib.context import CryptContext

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def main():
    user = await db.users.find_one(
        {"email": "gajulaniraj.06@gmail.com"}
    )

    if user:
        entered = input("Enter your login password: ")
        try:
            result = pwd.verify(entered, user["password"])
            print("Password verification:", result)
        except Exception as e:
            print("Verification error:", type(e).__name__)
    else:
        print("Account not found")

    client.close()

asyncio.run(main())