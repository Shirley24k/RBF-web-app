import PyPDF2
import os
from dotenv import load_dotenv
import json
import requests
import asyncio
from supabase import create_client, Client
import io
from openai import OpenAI

load_dotenv() 
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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
def get_document_from_storage(document_path: str, storage_name: str) -> bytes:
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
        response = supabase.storage.from_(storage_name).download(document_path)
        
        if response is None:
            raise FileNotFoundError(f"File not found in storage: {document_path}")
        
        return response
        
    except Exception as e:
        print(f"Error retrieving file from Supabase storage: {e}")
        raise

#2. Preprocess document text
def preprocess_document(document_bytes: bytes) -> str:
    """
    Convert PDF bytes to text for processing.
    
    Args:
        proposal_bytes: PDF file content as bytes
        
    Returns:
        Extracted text content
    """
    try:
        # Create a file-like object from bytes
        pdf_file = io.BytesIO(document_bytes)
        
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
def craft_prompt_for_proposal_analysis(document_text):
    prompt = f"""
    Analyze the following investment proposal document and extract the following details in JSON format:
    {{
        "funding_stage": "string",
        "funding_amount": "number",
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

    Respond only with a valid JSON object. Do not include any explanation.

    Document:
    ---
    {document_text}
    ---
    """
    return prompt

def craft_prompt_for_agreement_analysis(document_text):
    prompt = f"""
    Analyze the following funding agreement document and extract the following details in JSON format:
    {{
        "revenue_share_percentage": "number",
        "repayment_cap": "number",
        "cap_multiple": "number"
    }}

    If a detail is not explicitly mentioned or cannot be determined, return "N/A" for that field.

    Respond only with a valid JSON object. Do not include any explanation.
    
    Document:
    ---
    {document_text}
    ---
    """
    return prompt

def call_openai_chat(prompt: str) -> dict:
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an assistant that extracts structured data from investment documents. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=1000
        )
        
        # Extract the assistant's reply
        reply = response.choices[0].message.content.strip()
        
        # Try to parse JSON response
        try:
            extracted_data = json.loads(reply)
            return extracted_data
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON response: {e}")
            print(f"Raw response: {reply}")
            return {}
        
    except Exception as e:
        print(f"OpenAI API Error: {e}")
        return {}

async def extract_proposal_details(proposal_path: str) -> dict:
    """
    Complete pipeline to analyze investment proposal from Supabase storage using OpenAI.
    
    Args:
        proposal_path: Path to the file in Supabase storage
        
    Returns:
        Dictionary containing extracted analysis results
    """
    try:
        # Get PDF from Supabase storage
        proposal_bytes = get_document_from_storage(proposal_path, "business-proposal")
        
        # Convert PDF to text
        preprocessed_text = preprocess_document(proposal_bytes)
        
        # Craft the prompt
        prompt = craft_prompt_for_proposal_analysis(preprocessed_text)
        
        # Call OpenAI API
        extracted_data = call_openai_chat(prompt)
        
        # Validate and set default values if needed
        if not extracted_data:
            extracted_data = {
                "funding_stage": "Null",
                "funding_amount": "Null",
                "funding_purpose": "Null"
            }
        
        # Ensure all required fields exist
        required_fields = ["funding_stage", "funding_amount", "funding_purpose"]
        for field in required_fields:
            if field not in extracted_data:
                extracted_data[field] = "Null"
        
        # Convert funding_purpose array to string if needed
        if extracted_data['funding_purpose'] != "Null" and isinstance(extracted_data['funding_purpose'], list):
            extracted_data['funding_purpose'] = ", ".join(extracted_data['funding_purpose'])
        
        print("Extracted Details:")
        for key, value in extracted_data.items():
            print(f"- {key.replace('_', ' ').title()}: {value}")

        # Convert string to float for funding_amount
        if extracted_data['funding_amount'] != "Null":
            try:
                extracted_data['funding_amount'] = float(extracted_data['funding_amount'])
            except (ValueError, TypeError):
                extracted_data['funding_amount'] = "Null"

        return extracted_data
        
    except Exception as e:
        print(f"An error occurred: {e}")
        return {
            "funding_stage": "Null",
            "funding_amount": "Null",
            "funding_purpose": "Null"
        }

async def extract_agreement_details(agreement_path: str) -> dict:
    """
    Complete pipeline to analyze funding agreement from Supabase storage using OpenAI.
    
    Args:
        agreement_path: Path to the file in Supabase storage
        
    Returns:
        Dictionary containing extracted analysis results
    """
    try:
        # Get PDF from Supabase storage
        agreement_bytes = get_document_from_storage(agreement_path, "agreement")
        
        # Convert PDF to text
        preprocessed_text = preprocess_document(agreement_bytes)
        
        # Craft the prompt
        prompt = craft_prompt_for_agreement_analysis(preprocessed_text)
        
        # Call OpenAI API
        extracted_data = call_openai_chat(prompt)
        
        # Validate and set default values if needed
        if not extracted_data:
            extracted_data = {
                "revenue_share_percentage": "Null",
                "repayment_cap": "Null",
                "cap_multiple": "Null"
            }
        
        # Ensure all required fields exist
        required_fields = ["revenue_share_percentage", "repayment_cap", "cap_multiple"]
        for field in required_fields:
            if field not in extracted_data:
                extracted_data[field] = "Null"
        
        print("Extracted Details:")
        for key, value in extracted_data.items():
            print(f"- {key.replace('_', ' ').title()}: {value}")

        return extracted_data
        
    except Exception as e:
        print(f"An error occurred: {e}")
        return {
            "revenue_share_percentage": "Null",
            "repayment_cap": "Null",
            "cap_multiple": "Null"
        }

if __name__ == "__main__":
    # Example usage with a file stored in Supabase storage
    # The path should be relative to your storage bucket
    storage_path = "Agreement sample.pdf"  # Adjust this path
    response = asyncio.run(extract_agreement_details(storage_path))
    print(response)
    if response and 'revenue_share_percentage' in response:
        print(response['revenue_share_percentage'])
    else:
        print("No revenue share percentage found in response")
    
