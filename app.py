import asyncio
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import joblib
# from proposal_analysis.proposal_analysis import extract_agreement_details, extract_proposal_details
from proposal_analysis.openai_document_analysis import extract_agreement_details, extract_proposal_details
from scraping.scm_scraper import scrape_and_export
import numpy as np
from matching.matching import insert_investor, insert_application, match_investor_application, update_investor, create_invested_by
import traceback

def convert_numpy_types(obj):
    """Convert NumPy types to Python native types for JSON serialization"""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    else:
        return obj

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route("/scrape-scm", methods=["GET"])
def trigger_scrape():
    result = scrape_and_export()
    return jsonify(result)

@app.route('/predict-sales', methods=['POST'])
def predict_sales():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(base_dir, 'risk_assessment', 'xgboost_sales_model.pkl')
        scaler_path = os.path.join(base_dir, 'risk_assessment', 'xgboost_sales_scaler.pkl')
        target_scaler_path = os.path.join(base_dir, 'risk_assessment', 'xgboost_sales_target_scaler.pkl')
        
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        target_scaler = joblib.load(target_scaler_path)
        
        # Validate required fields exist
        required_fields = ['revenue_q1', 'revenue_q2', 'growth_rate']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Validate input ranges
        revenue_q1 = float(data['revenue_q1'])
        revenue_q2 = float(data['revenue_q2'])
        growth_rate = float(data['growth_rate'])
        
        # Basic data validation
        if revenue_q1 <= 0 or revenue_q2 <= 0:
            return jsonify({'error': 'Revenue values must be positive'}), 400
        
        # Prepare features for prediction
        X = np.array([[revenue_q1, revenue_q2, growth_rate]])
        
        # Apply StandardScaler transformation (same as training)
        X_scaled = scaler.transform(X)
        
        # Make prediction on scaled data
        prediction_scaled = model.predict(X_scaled)
        
        # Convert prediction back to original scale using target_scaler
        prediction = target_scaler.inverse_transform(prediction_scaled.reshape(-1, 1))[0, 0]
        prediction = float(prediction)  # Convert numpy float32 to Python float
                
        response = {
            'prediction': float(prediction)
        }
            
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/proposal-analysis', methods=['POST'])
def proposal_analysis():
    # Check if file is uploaded
    if 'document' in request.files:
        try:
            file = request.files['document']
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400
            
            if file and file.filename.endswith('.pdf'):
                # Read file bytes
                file_bytes = file.read()
                
                # Debug: Print file info
                print(f"Processing file: {file.filename}, Size: {len(file_bytes)} bytes")
                
                try:
                    # Call the async function properly
                    response = asyncio.run(extract_proposal_details(file_bytes))
                    
                    # Debug: Print the response before jsonify
                    print("Response from extract_proposal_details:")
                    print(f"Type: {type(response)}")
                    print(f"Content: {response}")
                    
                    # Check if response is valid
                    if not response or not isinstance(response, dict):
                        print("Invalid response received")
                        return jsonify({'error': 'Failed to extract proposal details'}), 500
                    
                    # Return the response
                    return jsonify(response)
                    
                except Exception as extract_error:
                    print(f"Error in extract_proposal_details: {extract_error}")
                    return jsonify({'error': f'Failed to extract proposal details: {str(extract_error)}'}), 500
                    
            else:
                return jsonify({'error': 'Invalid file type. Only PDF files are allowed.'}), 400
        except Exception as e:
            print(f"General error in proposal_analysis: {e}")
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'No file uploaded'}), 400

@app.route('/agreement-analysis', methods=['POST'])
def agreement_analysis():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    try:
        agreement_path = data['agreement_path']
        response = asyncio.run(extract_agreement_details(agreement_path))
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/neo4j/investor', methods=['POST'])
def api_insert_investor():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        id = data.get('id')
        investment_preferences = data.get('investment_preferences')
        
        if not id or not investment_preferences:
            return jsonify({'error': 'Missing required fields: id or investment_preferences'}), 400
            
        insert_investor(id, investment_preferences)
        return jsonify({'status': 'success', 'message': 'Investor inserted successfully'})
    except KeyError as e:
        return jsonify({'error': f'Missing required field: {str(e)}'}), 400
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/neo4j/update-investor', methods=['POST'])
def api_update_investor():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        id = data.get('id')
        investment_preferences = data.get('investment_preferences')
        
        if not id or not investment_preferences:
            return jsonify({'error': 'Missing required fields: id or investment_preferences'}), 400
            
        update_investor(id, investment_preferences)
        return jsonify({'status': 'success', 'message': 'Investor updated successfully'})
    except KeyError as e:
        return jsonify({'error': f'Missing required field: {str(e)}'}), 400
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/neo4j/application', methods=['POST'])
def api_insert_application():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        app_id = data['application_id']
        funding_amount_range = data['funding_amount_range']
        funding_stage = data['funding_stage']
        company_sector = data['company_sector']

        if not app_id or not funding_amount_range or not funding_stage or not company_sector:
            return jsonify({'error': 'Missing required fields: app_id, funding_amount_range, funding_stage, or company_sector'}), 400

        insert_application(app_id, funding_amount_range, funding_stage, company_sector)
        return jsonify({'status': 'success'})
    except KeyError as e:
        return jsonify({'error': f'Missing required field: {str(e)}'}), 400
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/matching', methods=['POST'])
def matching():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        application_id = data['application_id']
        if not application_id:
            return jsonify({'error': 'Missing required field: application_id'}), 400
        
        result = match_investor_application(application_id)
        response = [{"investor": inv, "score": convert_numpy_types(score)} for inv, score in result]
        return jsonify(response) 
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/neo4j/invested-by', methods=['POST'])
def api_invested_by():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        application_id = data.get('application_id')
        investor_id = data.get('investor_id')
        if not application_id or not investor_id:
            return jsonify({'error': 'Missing required fields: application_id or investor_id'}), 400
        create_invested_by(application_id, investor_id)
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
    
