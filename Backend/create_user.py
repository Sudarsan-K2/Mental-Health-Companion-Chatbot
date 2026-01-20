# backend/create_user.py
import database, models
from passlib.context import CryptContext

# --- CONFIGURATION: CHANGE THIS TO WHATEVER YOU WANT ---
MY_USERNAME = "admin"       # <--- Change this
MY_PASSWORD = "admin@123" # <--- Change this
# -------------------------------------------------------

# Setup security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_first_user():
    db = database.SessionLocal()
    
    # Check if user already exists
    existing = db.query(models.User).filter(models.User.username == MY_USERNAME).first()
    if existing:
        print(f"❌ User '{MY_USERNAME}' already exists!")
        return

    # Create new user
    hashed_pw = pwd_context.hash(MY_PASSWORD)
    new_user = models.User(username=MY_USERNAME, hashed_password=hashed_pw)
    
    db.add(new_user)
    db.commit()
    print(f"✅ Success! User created.")
    print(f"🆔 User ID: {new_user.id}")
    print(f"👤 Username: {MY_USERNAME}")
    print(f"🔑 Password: {MY_PASSWORD}")

if __name__ == "__main__":
    create_first_user()