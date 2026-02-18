"""Seed the database with an admin account."""

import bcrypt
from app.database import SessionLocal
from app.models.user import User


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def seed():
    db = SessionLocal()
    try:
        # Check if admin already exists
        existing = db.query(User).filter(User.email == "admin@nocho.ng").first()
        if existing:
            print("Admin account already exists — skipping.")
            return

        admin = User(
            name="Admin",
            nickname="admin",
            email="admin@nocho.ng",
            password_hash=hash_password("admin123"),
            role="admin",
        )
        db.add(admin)
        db.commit()
        print("Admin account created: admin@nocho.ng / admin123")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
