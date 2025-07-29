import asyncio
from flask import Flask, jsonify, request
from flask_cors import CORS
import joblib
from proposal_analysis.openai_document_analysis import extract_agreement_details, extract_proposal_details
from scraping.scm_scraper import scrape_and_export
import numpy as np
from matching.matching import insert_investor, insert_startup, insert_application, match_investor_application, update_investor
import traceback

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
        model = joblib.load('risk_assessment/xgboost_sales_model.pkl')
        scaler = joblib.load('risk_assessment/xgboost_sales_scaler.pkl')
        
        # Validate required fields exist
        required_fields = ['revenue_q1', 'revenue_q2', 'growth_rate']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Auto-scale small values to millions
        scaled_values = data.copy()
        needs_scaling_back = False
        
        for field in ['revenue_q1', 'revenue_q2']:
            if data[field] < 100000:  # Less than 100k, assume thousands
                scaled_values[field] = data[field] * 1000
                needs_scaling_back = True
        
        # Validate growth rate
        warnings = []
        if data['growth_rate'] < -1 or data['growth_rate'] > 5:
            warnings.append(f"growth_rate ({data['growth_rate']}) is outside typical range (-1 to 5).")
        
        # Make prediction
        X = np.array([[scaled_values['revenue_q1'], scaled_values['revenue_q2'], scaled_values['growth_rate']]])
        X_scaled = scaler.transform(X)
        prediction = model.predict(X_scaled)
        
        # Scale prediction back if needed
        if needs_scaling_back:
            prediction = prediction / 1000
        
        response = {
            'prediction': prediction.tolist()[0],
        }
        
        if warnings:
            response['warnings'] = warnings
            
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/proposal-analysis', methods=['POST'])
def proposal_analysis():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    try: 
        proposal_path = data['proposal_path']
        response =asyncio.run(extract_proposal_details(proposal_path))
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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

@app.route('/neo4j/startup', methods=['POST'])
def api_insert_startup():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        id = data['id']
        if not id:
            return jsonify({'error': 'Missing required field: id'}), 400

        insert_startup(id)
        return jsonify({'status': 'success', 'message': 'Startup inserted successfully'})
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
        startup_id = data['startup_id'] 
        funding_amount_range = data['funding_amount_range']
        funding_stage = data['funding_stage']
        company_sector = data['company_sector']

        if not app_id or not startup_id or not funding_amount_range or not funding_stage or not company_sector:
            return jsonify({'error': 'Missing required fields: app_id, startup_id, funding_amount_range, funding_stage, or company_sector'}), 400

        insert_application(app_id, startup_id, funding_amount_range, funding_stage, company_sector)
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
        response = [{"investor": inv, "score": score} for inv, score in result]
        return jsonify(response) 
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
