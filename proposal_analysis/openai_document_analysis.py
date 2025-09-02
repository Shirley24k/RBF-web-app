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
        "title": "string",
        "company_name": "string",
        "company_industry": "string",
        "contact_person": "string",
        "contact_email": "string",
        "contact_phone": "string",
        "business_model": "string",
        "target_market": "string",
        "unique_value_proposition": "string",
        "competitive_advantage": "string",
        "business_goals": "string",
        "market_size": "string",
        "market_growth_rate": "string",
        "market_trends": "string",
        "competition_analysis": "string",
        "customer_segments": "string",
        "funding_amount": "number",
        "funding_stage": "string",
        "funding_purpose": "string",
        "current_revenue": "number",
        "projected_revenue_12m": "number",
        "projected_revenue_24m": "number",
        "current_profit_margin": "number",
        "projected_profit_margin": "number",
        "break_even_point": "string",
        "cash_flow_analysis": "string"
    }}

    For funding_amount, current_revenue, projected_revenue_12m, projected_revenue_24m, current_profit_margin, and projected_profit_margin,
     convert to MYR (Malaysian Ringgit) if it is not in MYR, but do not include currency symbol and commas. Use 0 if not mentioned.

    For funding_purpose, extract the purposes as a string, refer extracted purpose format to the following list:
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
    - "Platform Development"
    - "Business Expansion"
    
     Do not include amounts or create a dictionary.

    For company_industry, you MUST use EXACTLY one of these values (case-sensitive):
    - "SaaS", "FinTech", "HealthTech", "EdTech", "AI_ML", "Blockchain", "IoT", "Cybersecurity", "Cloud_Computing", "Data_Analytics"
    - "AR_VR", "Robotics", "Quantum_Computing", "Biotech", "CleanTech", "AgriTech", "Logistics_Tech", "E_Commerce", "Gaming", "Social_Media"
    - "Other_Tech", "Non_Tech"
    
    Do not modify the case or format. Use the exact value as shown above.

    For funding_stage, use exactly these lowercase values:
    - "seed", "series_a", "series_b"
    
    Always use lowercase, never capitalize.

    If a detail is not explicitly mentioned, return "Null" for string fields and 0 for numeric fields.

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
        print("=== OpenAI API Call ===")
        print(f"API Key exists: {bool(os.getenv('OPENAI_API_KEY'))}")
        print(f"Model: gpt-4o-mini")
        print(f"Prompt length: {len(prompt)}")
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an assistant that extracts structured data from investment documents. Always respond with valid JSON only. Follow the exact format specifications provided in the prompt, including case sensitivity and exact value matching."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=1000
        )
        
        print(f"OpenAI response received: {response}")
        print(f"Response choices: {len(response.choices)}")
        
        # Extract the assistant's reply
        reply = response.choices[0].message.content.strip()
        print(f"Raw reply from OpenAI: {reply}")
        
        # Try to parse JSON response
        try:
            extracted_data = json.loads(reply)
            print(f"Successfully parsed JSON: {extracted_data}")
            return extracted_data
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON response: {e}")
            print(f"Raw response: {reply}")
            return {}
        
    except Exception as e:
        print(f"OpenAI API Error: {e}")
        import traceback
        traceback.print_exc()
        return {}

async def extract_proposal_details(proposal_bytes: bytes) -> dict:
    try:        
        # Convert PDF to text
        preprocessed_text = preprocess_document(proposal_bytes)
        
        # Craft the prompt
        prompt = craft_prompt_for_proposal_analysis(preprocessed_text)
        
        # Call OpenAI API
        extracted_data = call_openai_chat(prompt)
        
        # Debug: Print raw extracted data before processing
        print("Raw extracted data from AI:")
        for key, value in extracted_data.items():
            print(f"  {key}: {value}")
        print("---")
        
        # Validate and set default values if needed
        if not extracted_data:
            extracted_data = {
                "title": "Null",
                "company_name": "Null",
                "company_industry": "Null",
                "contact_person": "Null",
                "contact_email": "Null",
                "contact_phone": "Null",
                "business_model": "Null",
                "target_market": "Null",
                "unique_value_proposition": "Null",
                "competitive_advantage": "Null",
                "business_goals": "Null",
                "market_size": "Null",
                "market_growth_rate": "Null",
                "market_trends": "Null",
                "competition_analysis": "Null",
                "customer_segments": "Null",
                "funding_amount": 0,
                "funding_stage": "Null",
                "funding_purpose": "Null",
                "current_revenue": 0,
                "projected_revenue_12m": 0,
                "projected_revenue_24m": 0,
                "current_profit_margin": 0,
                "projected_profit_margin": 0,
                "break_even_point": "Null",
                "cash_flow_analysis": "Null"
            }
        
        # Ensure all required fields exist
        required_fields = ["title", "company_name", "company_industry", "contact_person", "contact_email", 
        "contact_phone", "business_model", "target_market", "unique_value_proposition", "competitive_advantage", 
        "business_goals", "market_size", "market_growth_rate", "market_trends", "competition_analysis", "customer_segments",
        "funding_amount", "funding_stage", "funding_purpose", "current_revenue", "projected_revenue_12m", 
        "projected_revenue_24m", "current_profit_margin", "projected_profit_margin", "break_even_point", "cash_flow_analysis"]
        for field in required_fields:
            if field not in extracted_data:
                extracted_data[field] = "Null"
        
        # Normalize funding_stage to lowercase and validate
        if extracted_data['funding_stage'] != "Null":
            extracted_data['funding_stage'] = extracted_data['funding_stage'].lower()
            # Validate funding_stage values
            valid_stages = ["seed", "series_a", "series_b", "series_c", "pre_seed"]
            if extracted_data['funding_stage'] not in valid_stages:
                # Try to map common variations
                stage_mapping = {
                    "seed round": "seed",
                    "seed funding": "seed",
                    "series a": "series_a",
                    "series b": "series_b",
                    "series c": "series_c",
                    "pre-seed": "pre_seed",
                    "preseed": "pre_seed"
                }
                extracted_data['funding_stage'] = stage_mapping.get(extracted_data['funding_stage'], "seed")
        
        # Handle funding_purpose - convert dictionary to string or ensure it's a string
        if extracted_data['funding_purpose'] != "Null":
            if isinstance(extracted_data['funding_purpose'], dict):
                # If it's a dictionary with amounts, extract the main purpose
                purposes = list(extracted_data['funding_purpose'].keys())
                if purposes:
                    extracted_data['funding_purpose'] = purposes[0]  # Take the first purpose
            elif isinstance(extracted_data['funding_purpose'], list):
                # If it's a list, join with comma
                extracted_data['funding_purpose'] = ", ".join(extracted_data['funding_purpose'])
            elif not isinstance(extracted_data['funding_purpose'], str):
                # If it's not a string, convert to string
                extracted_data['funding_purpose'] = str(extracted_data['funding_purpose'])
            
            # Validate funding_purpose values
            valid_purposes = [
                "Market Expansion", "Product Development", "Operations Scale", "R&D Investment",
                "Team Expansion", "Technology Upgrade", "Inventory Management", "Marketing Campaign",
                "Infrastructure", "Working Capital", "Platform Development", "Business Expansion"
            ]
            if extracted_data['funding_purpose'] not in valid_purposes:
                # Try to map common variations
                purpose_mapping = {
                    "platform development": "Platform Development",
                    "product development": "Product Development",
                    "marketing campaign": "Marketing Campaign",
                    "working capital": "Working Capital",
                    "market expansion": "Market Expansion",
                    "team expansion": "Team Expansion",
                    "technology upgrade": "Technology Upgrade",
                    "inventory management": "Inventory Management",
                    "infrastructure": "Infrastructure",
                    "business expansion": "Business Expansion"
                }
                extracted_data['funding_purpose'] = purpose_mapping.get(extracted_data['funding_purpose'].lower(), "Product Development")
        
        # Validate and normalize company_industry
        if extracted_data['company_industry'] != "Null":
            valid_industries = [
                "SaaS", "FinTech", "HealthTech", "EdTech", "AI_ML", "Blockchain", "IoT", "Cybersecurity", "Cloud_Computing", "Data_Analytics",
                "AR_VR", "Robotics", "Quantum_Computing", "Biotech", "CleanTech", "AgriTech", "Logistics_Tech", "E_Commerce", "Gaming", "Social_Media",
                "Other_Tech", "Non_Tech"
            ]
            
            if extracted_data['company_industry'] not in valid_industries:
                # Try to map common variations to exact values
                industry_mapping = {
                    "fintech": "FinTech",
                    "fin tech": "FinTech",
                    "financial technology": "FinTech",
                    "saas": "SaaS",
                    "software as a service": "SaaS",
                    "healthtech": "HealthTech",
                    "health tech": "HealthTech",
                    "healthcare technology": "HealthTech",
                    "edtech": "EdTech",
                    "education technology": "EdTech",
                    "ai/ml": "AI_ML",
                    "ai_ml": "AI_ML",
                    "artificial intelligence": "AI_ML",
                    "machine learning": "AI_ML",
                    "blockchain": "Blockchain",
                    "iot": "IoT",
                    "internet of things": "IoT",
                    "cybersecurity": "Cybersecurity",
                    "cloud computing": "Cloud_Computing",
                    "data analytics": "Data_Analytics",
                    "ar/vr": "AR_VR",
                    "ar_vr": "AR_VR",
                    "augmented reality": "AR_VR",
                    "virtual reality": "AR_VR",
                    "robotics": "Robotics",
                    "quantum computing": "Quantum_Computing",
                    "biotech": "Biotech",
                    "biotechnology": "Biotech",
                    "cleantech": "CleanTech",
                    "clean tech": "CleanTech",
                    "agritech": "AgriTech",
                    "agriculture technology": "AgriTech",
                    "logistics tech": "Logistics_Tech",
                    "logistics technology": "Logistics_Tech",
                    "e-commerce": "E_Commerce",
                    "ecommerce": "E_Commerce",
                    "gaming": "Gaming",
                    "social media": "Social_Media",
                    "other tech": "Other_Tech",
                    "non tech": "Non_Tech"
                }
                extracted_data['company_industry'] = industry_mapping.get(extracted_data['company_industry'].lower(), "Other_Tech")
        
        # Normalize business_model to proper case
        if extracted_data['business_model'] != "Null":
            # Convert to title case for better readability
            extracted_data['business_model'] = extracted_data['business_model'].title()
        
        print("Extracted Details:")
        for key, value in extracted_data.items():
            print(f"- {key.replace('_', ' ').title()}: {value}")

        # Convert string to float for numeric fields
        numeric_fields = ['funding_amount', 'current_revenue', 'projected_revenue_12m', 'projected_revenue_24m', 'current_profit_margin', 'projected_profit_margin']
        for field in numeric_fields:
            if extracted_data[field] != "Null" and extracted_data[field] != 0:
                try:
                    extracted_data[field] = float(extracted_data[field])
                except (ValueError, TypeError):
                    extracted_data[field] = 0
            else:
                extracted_data[field] = 0

        return extracted_data
        
    except Exception as e:
        print(f"An error occurred: {e}")
        return {
            "title": "Null",
            "company_name": "Null",
            "company_industry": "Null",
            "contact_person": "Null",
            "contact_email": "Null",
            "contact_phone": "Null",
            "business_model": "Null",
            "target_market": "Null",
            "unique_value_proposition": "Null",
            "competitive_advantage": "Null",
            "business_goals": "Null",
            "market_size": "Null",
            "market_growth_rate": "Null",
            "market_trends": "Null",
            "competition_analysis": "Null",
            "customer_segments": "Null",
            "funding_amount": 0,
            "funding_stage": "Null",
            "funding_purpose": "Null",
            "current_revenue": 0,
            "projected_revenue_12m": 0,
            "projected_revenue_24m": 0,
            "current_profit_margin": 0,
            "projected_profit_margin": 0,
            "break_even_point": "Null",
            "cash_flow_analysis": "Null"
        }

async def extract_agreement_details(agreement_path: str) -> dict:
   
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
    
