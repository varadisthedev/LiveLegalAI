import httpx
import docx
import sys
import json

def run_tests():
    print("--- 1. Generating a dummy legal document ---")
    doc = docx.Document()
    doc.add_heading('CEASE AND DESIST DEMAND', 0)
    doc.add_paragraph('To whom it may concern,')
    doc.add_paragraph('You are hereby notified that your use of the logo "Acme Corp" is a direct infringement of our trademark.')
    doc.add_paragraph('We demand that you immediately cease and desist all use of this trademark within 14 days of receiving this notice.')
    doc.add_paragraph('If you do not comply, we will be forced to file a lawsuit and seek monetary damages of $50,000 for copyright infringement.')
    doc.add_paragraph('Govern yourself accordingly.')
    
    filename = 'test_notice.docx'
    doc.save(filename)
    print(f"✅ Created {filename}\n")

    base_url = "http://localhost:8000"

    print("--- 2. Testing POST /ingest ---")
    try:
        with open(filename, 'rb') as f:
            files = {'file': (filename, f, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')}
            response = httpx.post(f"{base_url}/ingest", files=files, timeout=120.0)
            
        print(f"Status: {response.status_code}")
        response_data = response.json()
        print(json.dumps(response_data, indent=2))
        
        if response.status_code != 200:
            print("❌ /ingest failed!")
            sys.exit(1)
            
        doc_id = response_data.get('document_id')
        print("✅ /ingest successful! Document ID:", doc_id, "\n")
        
    except httpx.ConnectError:
        print("❌ Could not connect to the server. Is `python main.py` running on port 8000?")
        sys.exit(1)

    print("--- 3. Testing POST /analyze ---")
    response = httpx.post(f"{base_url}/analyze", json={"document_id": doc_id}, timeout=120.0)
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    
    if response.status_code == 200:
        print("✅ /analyze successful!\n")
    else:
        print("❌ /analyze failed!\n")

    print("--- 4. Testing POST /chat ---")
    payload = {
        "document_id": doc_id, 
        "question": "What happens if I don't comply and what is the deadline?"
    }
    response = httpx.post(f"{base_url}/chat", json=payload, timeout=120.0)
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    
    if response.status_code == 200:
        print("✅ /chat successful!\n")
    else:
        print("❌ /chat failed!\n")

if __name__ == "__main__":
    run_tests()
