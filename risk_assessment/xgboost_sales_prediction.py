import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from xgboost import XGBRegressor
import warnings
warnings.filterwarnings('ignore')

def clean_numeric_data(value):
    """Clean numeric data by removing commas, spaces, and converting to float"""
    if pd.isna(value) or value == '':
        return np.nan
    cleaned = str(value).replace(',', '').replace(' ', '').strip()
    try:
        return float(cleaned)
    except ValueError:
        return np.nan

def load_and_preprocess_data():
    """Load and preprocess the company revenue data"""
    print("Loading company revenue data...")
    df = pd.read_csv('risk_assessment/company_revenue.csv')
    print(f"Original data shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    numeric_columns = ['revenue_q1', 'revenue_q2', 'growth_rate', 'predicted_sales']
    for col in numeric_columns:
        df[col] = df[col].apply(clean_numeric_data)
    df_clean = df.dropna(subset=numeric_columns)
    print(f"Data shape after cleaning: {df_clean.shape}")
    print(f"Removed {len(df) - len(df_clean)} rows with missing values")
    print("\nData statistics:")
    print(df_clean[numeric_columns].describe())
    return df_clean

def train_xgboost_model(df):
    """Train XGBoost regressor model"""
    print("\nTraining XGBoost model...")
    feature_columns = ['revenue_q1', 'revenue_q2', 'growth_rate']
    target_column = 'predicted_sales'
    X = df[feature_columns]
    y = df[target_column]
    print(f"Features: {feature_columns}")
    print(f"Target: {target_column}")
    print(f"X shape: {X.shape}, y shape: {y.shape}")
   
    #split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    #scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    #train model
    model = XGBRegressor(n_estimators=100, random_state=42)
    model.fit(X_train_scaled, y_train)
    
    #make predictions
    y_pred_train = model.predict(X_train_scaled)
    y_pred_test = model.predict(X_test_scaled)
    
    #calculate metrics
    train_rmse = np.sqrt(mean_squared_error(y_train, y_pred_train))
    test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
    train_r2 = r2_score(y_train, y_pred_train)
    test_r2 = r2_score(y_test, y_pred_test)
    train_mae = mean_absolute_error(y_train, y_pred_train)
    test_mae = mean_absolute_error(y_test, y_pred_test)
    
    print("\nModel Performance:")
    print(f"Training RMSE: {train_rmse:,.2f}")
    print(f"Test RMSE: {test_rmse:,.2f}")
    print(f"Training R²: {train_r2:.4f}")
    print(f"Test R²: {test_r2:.4f}")
    print(f"Training MAE: {train_mae:,.2f}")
    print(f"Test MAE: {test_mae:,.2f}")
    
    return model, scaler, feature_columns, X_test, y_test, y_pred_test

def save_model(model, scaler, feature_columns):
    """Save the trained model and scaler"""
    import joblib
    joblib.dump(model, 'risk_assessment/xgboost_sales_model.pkl')
    joblib.dump(scaler, 'risk_assessment/xgboost_sales_scaler.pkl')
    import json
    with open('risk_assessment/feature_columns.json', 'w') as f:
        json.dump(feature_columns, f)
    print("\nModel saved:")
    print("- Model: risk_assessment/xgboost_sales_model.pkl")
    print("- Scaler: risk_assessment/xgboost_sales_scaler.pkl")
    print("- Features: risk_assessment/feature_columns.json")

def main():
    print("=== XGBoost Sales Prediction Model ===")
    df = load_and_preprocess_data()
    model, scaler, feature_columns, X_test, y_test, y_pred_test = train_xgboost_model(df)
    save_model(model, scaler, feature_columns)
    print("\n=== Model Training Complete ===")
    print("You can now use the saved model to make predictions on new data.")

if __name__ == "__main__":
    main() 