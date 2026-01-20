import google.generativeai as genai
import json

# --- PASTE YOUR API KEY HERE ---
genai.configure(api_key="AIzaSyAaNAlA_-VevomViNcZq2PLW77MmvNAjpw")

def get_ai_response(user_text):
    """
    Analyzes text using Google Gemini and returns Emotion + Comforting Reply.
    """
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # System Prompt: This defines the bot's personality
        prompt = f"""
        You are an empathetic, professional mental wellness AI companion.
        User Text: "{user_text}"
        
        Task:
        1. Identify the core emotion (e.g., Anxiety, Joy, Grief, Anger, Hope, Neutral).
        2. Write a warm, human-like response (max 2 sentences).
        
        Respond STRICTLY in this JSON format:
        {{
            "emotion": "Detected Emotion",
            "reply": "Your response here"
        }}
        """
        
        response = model.generate_content(prompt)
        
        # Clean up JSON formatting issues
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean_text)
        
        return data['emotion'], data['reply']
        
    except Exception as e:
        print(f"❌ AI Error: {e}")
        return "Neutral", "I am having trouble connecting to the cloud, but I am here listening."