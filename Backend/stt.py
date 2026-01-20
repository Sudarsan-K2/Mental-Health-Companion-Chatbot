import speech_recognition as sr

def listen_once():
    recognizer = sr.Recognizer()
    try:
        with sr.Microphone() as source:
            print("🎤 Listening...")
            recognizer.adjust_for_ambient_noise(source)
            audio = recognizer.listen(source, timeout=5)
            
            print("✅ Processing audio...")
            text = recognizer.recognize_google(audio)
            print(f"🗣️ User said: {text}")
            return text
            
    except sr.WaitTimeoutError:
        return "Error: No speech detected."
    except sr.UnknownValueError:
        return "Error: Could not understand audio."
    except Exception as e:
        return f"Error: {str(e)}"