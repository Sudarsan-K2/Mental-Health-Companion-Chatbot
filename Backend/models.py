from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String) # We never store real passwords, only encrypted "hashes"
    
    # Link user to their chats
    chats = relationship("ChatHistory", back_populates="owner")

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    user_message = Column(String)
    bot_reply = Column(String)
    emotion_detected = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Link back to user
    owner = relationship("User", back_populates="chats")