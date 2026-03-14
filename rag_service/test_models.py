import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)
for m in genai.list_models():
    if "generateContent" in m.supported_generation_methods:
        print(f"MODEL: {m.name}")
