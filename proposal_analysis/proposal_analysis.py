import PyPDF2
import os
from dotenv import load_dotenv
import json
import requests
import asyncio
from supabase import create_client, Client
import io

load_dotenv() 

# Initialize Supabase client
def get_supabase_client() -> Client:
    """
    Initialize and return Supabase client using environment variables.
    """
    supabase_url = os.getenv("SUPABASE_PROJECT_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        raise ValueError("SUPABASE_PROJECT_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables")
    
    return create_client(supabase_url, supabase_key)

#1. Get the proposal from storage
def get_proposal_from_storage(proposal_path: str) -> bytes:
    """
    Retrieve PDF file from Supabase storage.
    
    Args:
        proposal_path: Path to the file in Supabase storage (e.g., 'proposals/document.pdf')
        
    Returns:
        PDF file content as bytes
    """
    try:
        supabase = get_supabase_client()
        
        # Download the file from storage
        response = supabase.storage.from_('business-proposal').download(proposal_path)
        
        if response is None:
            raise FileNotFoundError(f"File not found in storage: {proposal_path}")
        
        return response
        
    except Exception as e:
        print(f"Error retrieving file from Supabase storage: {e}")
        raise

#2. Preprocess document text
def preprocess_document(proposal_bytes: bytes) -> str:
    """
    Convert PDF bytes to text for processing.
    
    Args:
        proposal_bytes: PDF file content as bytes
        
    Returns:
        Extracted text content
    """
    try:
        # Create a file-like object from bytes
        pdf_file = io.BytesIO(proposal_bytes)
        
        # Read PDF using PyPDF2
        reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        
        for page_num in range(len(reader.pages)):
            page_text = reader.pages[page_num].extract_text()
            text += f"\n--- Page {page_num + 1} ---\n{page_text}\n"
        
        return text.strip()
        
    except Exception as e:
        print(f"Error processing PDF: {e}")
        raise

#3. Craft the prompt
def craft_prompt(document_text):
    prompt = f"""
    Analyze the following investment proposal document and extract the following details in JSON format:
    {{
        "funding_stage": "string",
        "funding_amount": "decimal",
        "funding_purpose": "string"
    }}

    For funding_amount, use convert to MYR (Malaysian Ringgit) if it is not in MYR, but do not include currency symbol and commas.
    
    For funding_purpose (can be multiple), use short and concise values such as:
    - "Market Expansion"
    - "Product Development" 
    - "Operations Scale"
    - "R&D Investment"
    - "Team Expansion"
    - "Technology Upgrade"
    - "Inventory Management"
    - "Marketing Campaign"
    - "Infrastructure"
    - "Working Capital"
    
    If a detail is not explicitly mentioned, return "Null".

    Document:
    ---
    {document_text}
    ---
    """
    return prompt

#4. Make the gemini API call
async def make_api_call(proposal_path: str) -> dict:
    """
    Complete pipeline to analyze investment proposal from Supabase storage.
    
    Args:
        proposal_path: Path to the file in Supabase storage
        
    Returns:
        Dictionary containing extracted analysis results
    """
    try:
        # Get PDF from Supabase storage
        proposal_bytes = get_proposal_from_storage(proposal_path)
        
        # Convert PDF to text
        preprocessed_text = preprocess_document(proposal_bytes)
        
        # Craft the prompt
        prompt = craft_prompt(preprocessed_text)
        chatHistory = []
        chatHistory.append({ "role": "user", "parts": [{ "text": prompt }] })
        payload = {
            "contents": chatHistory,
            "generationConfig": {
                "responseMimeType": "application/json",
                "responseSchema": {
                    "type": "OBJECT",
                    "properties": {
                        "funding_stage": { 
                            "type": "STRING",
                            "enum": ["Seed", "Series A", "Series B"]
                         },
                        "funding_amount": { "type": "STRING" },
                        "funding_purpose": { "type": "STRING" }
                    },
                    "propertyOrdering": [
                        "funding_stage", "funding_amount", "funding_purpose"
                    ]
                }
            }
        }

        apiKey = os.getenv("GEMINI_API_KEY")
        apiUrl = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={apiKey}"

        response = requests.post(apiUrl, json=payload)
        result = response.json()

        if 'candidates' in result and len(result['candidates']) > 0 and \
           'content' in result['candidates'][0] and len(result['candidates'][0]['content']['parts']) > 0:
            
            # The response is already structured JSON due to responseSchema
            extracted_data_str = result['candidates'][0]['content']['parts'][0]['text']
            extracted_data = json.loads(extracted_data_str) # Parse the JSON string

            print("Extracted Details:")
            for key, value in extracted_data.items():
                print(f"- {key.replace('_', ' ').title()}: {value}")

            # Convert string to float
            if extracted_data['funding_amount'] != "Null":
                extracted_data['funding_amount'] = float(extracted_data['funding_amount'])

            return extracted_data
        else:
            print("Could not extract details. Unexpected API response structure.")
            print(result) # Print full result for debugging
            return {
                "funding_stage": "Null",
                "funding_amount": "Null", 
                "funding_purpose": "Null"
            }
            
    except Exception as e:
        print(f"An error occurred: {e}")
        return {
            "funding_stage": "Null",
            "funding_amount": "Null",
            "funding_purpose": "Null"
        }

if __name__ == "__main__":
    # Example usage with a file stored in Supabase storage
    # The path should be relative to your storage bucket
    storage_path = "Business proposal sample.pdf"  # Adjust this path
    response = asyncio.run(make_api_call(storage_path))
    print(response)
    print(response['funding_stage'])
    
