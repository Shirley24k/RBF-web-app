import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
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
    print(f"Data shape: {df.shape}")
    
    # Clean numeric data first
    numeric_columns = ['revenue_q1', 'revenue_q2', 'growth_rate', 'predicted_sales']
    for col in numeric_columns:
        df[col] = df[col].apply(clean_numeric_data)
    
    # Remove rows with missing values
    df_clean = df.dropna(subset=numeric_columns)
    print(f"Cleaned data shape: {df_clean.shape}")
    
    return df_clean

def train_xgboost_model(df):
    """Train XGBoost regressor model with balanced complexity"""
    print("\nTraining XGBoost model...")
    feature_columns = ['revenue_q1', 'revenue_q2', 'growth_rate']
    target_column = 'predicted_sales'
    X = df[feature_columns]
    y = df[target_column]
    print(f"Features: {feature_columns}")
    print(f"Target: {target_column}")
    print(f"Data shape: {X.shape}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Scale features using StandardScaler (z-score normalization)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Also scale the target variable for better training
    target_scaler = StandardScaler()
    y_train_scaled = target_scaler.fit_transform(y_train.values.reshape(-1, 1)).flatten()
    y_test_scaled = target_scaler.transform(y_test.values.reshape(-1, 1)).flatten()
    
    print(f"Features normalized to mean=0, std=1")
    
    # Train model with conservative settings to reduce extreme predictions
    print(f"\nTraining model with conservative settings to reduce extreme predictions...")
    model = XGBRegressor(
        n_estimators=75,           # Reduced: fewer trees for more conservative predictions
        max_depth=5,               # Reduced: shallower trees to prevent overfitting
        learning_rate=0.1,        # Reduced: slower learning for more stable predictions
        subsample=0.8,             # Reduced: use fewer samples to increase generalization
        colsample_bytree=0.8,      # Reduced: use fewer features to increase generalization
        reg_alpha=0.1,             # Increased: stronger L1 regularization
        reg_lambda=1.0,            # Increased: stronger L2 regularization
        min_child_weight=1,        # Increased: require more samples per leaf
        random_state=42
    )
    
    # Cross-validation for performance assessment
    print(f"\nPerforming cross-validation...")
    
    cv_scores = cross_val_score(
        model, 
        X_train_scaled, 
        y_train_scaled, 
        cv=5,                      # 5-fold cross-validation
        scoring='neg_mean_squared_error'
    )
    
    # Convert negative MSE to positive RMSE
    cv_rmse_scores = np.sqrt(-cv_scores)
    print(f"Cross-validation RMSE: {cv_rmse_scores.mean():.3f} ± {cv_rmse_scores.std():.3f}")
    
    # Train the final model on all training data
    print(f"\nTraining final model on all training data...")
    model.fit(X_train_scaled, y_train_scaled)
    
    # Make predictions and calculate final performance
    y_pred_train = model.predict(X_train_scaled)
    y_pred_test = model.predict(X_test_scaled)
    
    # Convert predictions back to original scale for evaluation
    y_pred_train_orig = target_scaler.inverse_transform(y_pred_train.reshape(-1, 1)).flatten()
    y_pred_test_orig = target_scaler.inverse_transform(y_pred_test.reshape(-1, 1)).flatten()
    
    # Calculate metrics on original scale
    train_rmse = np.sqrt(mean_squared_error(y_train, y_pred_train_orig))
    test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test_orig))
    train_r2 = r2_score(y_train, y_pred_train_orig)
    test_r2 = r2_score(y_test, y_pred_test_orig)
    train_mae = mean_absolute_error(y_train, y_pred_train_orig)
    test_mae = mean_absolute_error(y_test, y_pred_test_orig)
    
    print("\nModel Performance (on original scale):")
    print(f"Training RMSE: {train_rmse:,.0f}")
    print(f"Test RMSE: {test_rmse:,.0f}")
    print(f"Training R²: {train_r2:.4f}")
    print(f"Test R²: {test_r2:.4f}")
    print(f"Training MAE: {train_mae:,.0f}")
    print(f"Test MAE: {test_mae:,.0f}")
    
    return model, scaler, target_scaler, feature_columns

def save_model(model, scaler, target_scaler, feature_columns):
    """Save the trained model and scalers"""
    import joblib
    joblib.dump(model, 'risk_assessment/xgboost_sales_model.pkl')
    joblib.dump(scaler, 'risk_assessment/xgboost_sales_scaler.pkl')
    joblib.dump(target_scaler, 'risk_assessment/xgboost_sales_target_scaler.pkl')
    
    import json
    with open('risk_assessment/feature_columns.json', 'w') as f:
        json.dump(feature_columns, f)
    
    # Save scaling information for prediction consistency
    scaling_info = {
        "feature_scaler": {
            "mean": scaler.mean_.tolist(),
            "scale": scaler.scale_.tolist(),
            "var": scaler.var_.tolist()
        },
        "target_scaler": {
            "mean": target_scaler.mean_.tolist(),
            "scale": target_scaler.scale_.tolist(),
            "var": target_scaler.var_.tolist()
        },
        "description": "StandardScaler (z-score normalization) applied to all features and target"
    }
    with open('risk_assessment/scaling_info.json', 'w') as f:
        json.dump(scaling_info, f, indent=2)
    
    print("\nModel saved:")
    print("- Model: risk_assessment/xgboost_sales_model.pkl")
    print("- Feature Scaler: risk_assessment/xgboost_sales_scaler.pkl")
    print("- Target Scaler: risk_assessment/xgboost_sales_target_scaler.pkl")
    print("- Features: risk_assessment/feature_columns.json")
    print("- Scaling Info: risk_assessment/scaling_info.json")
    print("\nIMPORTANT: Using StandardScaler (z-score normalization) for all features")

def main():
    print("=== XGBoost Sales Prediction Model ===")
    
    df = load_and_preprocess_data()
    model, scaler, target_scaler, feature_columns = train_xgboost_model(df)
    save_model(model, scaler, target_scaler, feature_columns)
    
    print("Model training complete!")

if __name__ == "__main__":
    main() 