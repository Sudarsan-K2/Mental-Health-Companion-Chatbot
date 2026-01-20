from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import uvicorn
import inference  # Your Gemini Brain
import models, database

# 1. Setup Password Hashing (Security)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 2. Initialize Database Tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# 3. Allow Frontend to Connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Schemas (Data Validation) ---
class UserAuth(BaseModel):
    username: str
    password: str

class ChatInput(BaseModel):
    user_id: int
    text: str

# --- Helper Functions ---
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# --- ROUTES ---

@app.get("/")
def home():
    return {"status": "Database & AI Online"}

# 1. REGISTER (Sign Up)
@app.post("/register")
def register(user: UserAuth, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Hash password and save
    hashed_pw = get_password_hash(user.password)
    new_user = models.User(username=user.username, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"status": "User created", "user_id": new_user.id}

# 2. LOGIN
@app.post("/login")
def login(user: UserAuth, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid username or password")
    
    return {"status": "Login successful", "user_id": db_user.id, "username": db_user.username}

# 3. CHAT (Now saves to DB!)
@app.post("/chat")
def chat(input_data: ChatInput, db: Session = Depends(get_db)):
    # 1. Get AI Response
    emotion, reply = inference.get_ai_response(input_data.text)
    
    # 2. Save to Database
    history = models.ChatHistory(
        user_id=input_data.user_id,
        user_message=input_data.text,
        bot_reply=reply,
        emotion_detected=emotion
    )
    db.add(history)
    db.commit()
    
    return {"user_text": input_data.text, "emotion": emotion, "reply": reply}

# 4. GET HISTORY (Load past chats)
@app.get("/history/{user_id}")
def get_history(user_id: int, db: Session = Depends(get_db)):
    chats = db.query(models.ChatHistory).filter(models.ChatHistory.user_id == user_id).all()
    return chats

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)