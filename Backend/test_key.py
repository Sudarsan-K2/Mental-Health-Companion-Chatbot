import google.generativeai as genai

# PASTE YOUR KEY HERE
genai.configure(api_key="AIzaSyAaNAlA_-VevomViNcZq2PLW77MmvNAjpw")

print("🔍 Checking available models for your API key...")

try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"✅ Available: {m.name}")
            
    print("\n--- Testing Connection ---")
    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content("Hello")
    print(f"🎉 Success! Reply: {response.text}")
    
except Exception as e:
    print(f"\n❌ Error Details: {e}")