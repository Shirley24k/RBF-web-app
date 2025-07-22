#preprocess investment data by exploding investors of each investment

import pandas as pd
import uuid

# Define funding bins and create a function to assign a funding range tag
funding_bins = [
    (0, 100_000_000, "0-100M"),
    (100_000_001, 200_000_000, "100M-200M"),
    (200_000_001, 300_000_000, "200M-300M"),
    (300_000_001, 400_000_000, "300M-400M"),
    (400_000_001, 500_000_000, "400M-500M"),
    (500_000_001, 600_000_000, "500M-600M"),
    (600_000_001, 700_000_000, "600M-700M"),
    (700_000_001, 800_000_000, "700M-800M"),
    (800_000_001, 900_000_000, "800M-900M"),
    (900_000_001, 1_000_000_000, "900M-1B"),
    (1_000_000_001, 2_000_000_000, "1B-2B"),
    (2_000_000_001, 3_000_000_000, "2B-3B"),
    (3_000_000_001, 4_000_000_000, "3B-4B"),
    (4_000_000_001, 5_000_000_000, "4B-5B"),
    (5_000_000_001, 10_000_000_000, "5B-10B"),
    (10_000_000_001, float("inf"), "10B+")
]

def assign_funding_range(amount):
    if pd.isnull(amount):
        return "Unknown"
    for low, high, label in funding_bins:
        if low <= amount <= high:
            return label
    return "Unknown"

# Read the dataset
file_path = "matching/Investment dataset.csv"
df = pd.read_csv(file_path, encoding="utf-8")

# Create application_id for each unique investment
df['application_id'] = [str(uuid.uuid4()) for _ in range(len(df))]

# Explode investors of each investment
df['Investors'] = df['Investors'].str.split(',')
df_exploded = df.explode('Investors')
df_exploded['Investors'] = df_exploded['Investors'].str.strip()

# Convert funding amount to numeric and multiply by 10000
amount_col = "Funding amount (RMB '0,000)"
df_exploded[amount_col] = pd.to_numeric(df_exploded[amount_col], errors='coerce')
df_exploded[amount_col] = df_exploded[amount_col].apply(lambda x: x * 10000 if pd.notnull(x) else x)

# Assign funding range
funding_range_col = 'Funding Range'
df_exploded[funding_range_col] = df_exploded[amount_col].apply(assign_funding_range)

# --- 1. startup_application.csv (application_id, startup) ---
startup_application = df.loc[:, ['application_id', 'Startup']].drop_duplicates()
startup_application.to_csv('matching/startup_application.csv', index=False, encoding='utf-8-sig')

# --- 2. application_tags.csv (application_id, tag) ---
# Get the funding range data from exploded dataframe and merge back
funding_range_data = df_exploded.loc[:, ['application_id', funding_range_col]].drop_duplicates()

# Sector tags
sector_tags = df.loc[:, ['application_id', 'Sector']].rename(columns={'Sector': 'tag'})
sector_tags['tag'] = sector_tags['tag'].str.strip()

# Stage tags
stage_tags = df.loc[:, ['application_id', 'Funding stage']].rename(columns={'Funding stage': 'tag'})
stage_tags['tag'] = stage_tags['tag'].str.strip()

# Amount range tags
amount_tags = funding_range_data.rename(columns={funding_range_col: 'tag'})
amount_tags['tag'] = amount_tags['tag'].str.strip()

# Combine all tags
application_tags = pd.concat([sector_tags, stage_tags, amount_tags], ignore_index=True).drop_duplicates()
application_tags.to_csv('matching/application_tags.csv', index=False, encoding='utf-8-sig')

# --- 3. investor_tags.csv (investor, tag) ---
# Get unique investors from exploded data
unique_investors = df_exploded['Investors'].dropna().unique()

# Create investor tags based on their investment patterns
investor_tags_list = []

for investor in unique_investors:
    investor_data = df_exploded[df_exploded['Investors'] == investor]
    
    # Sector tags for this investor
    sectors = investor_data['Sector'].dropna().unique()
    for sector in sectors:
        investor_tags_list.append({'investor': investor, 'tag': sector.strip()})
    
    # Stage tags for this investor
    stages = investor_data['Funding stage'].dropna().unique()
    for stage in stages:
        investor_tags_list.append({'investor': investor, 'tag': stage.strip()})
    
    # Amount range tags for this investor
    amounts = investor_data[funding_range_col].dropna().unique()
    for amount in amounts:
        investor_tags_list.append({'investor': investor, 'tag': amount.strip()})

investor_tags = pd.DataFrame(investor_tags_list).drop_duplicates()
investor_tags.to_csv('matching/investor_tags.csv', index=False, encoding='utf-8-sig')

# --- 4. investment_record.csv (application_id, investor) ---
investment_record = df_exploded.loc[:, ['application_id', 'Investors']].rename(columns={'Investors': 'investor'}).drop_duplicates()
investment_record.to_csv('matching/investment_record.csv', index=False, encoding='utf-8-sig')

# Print summary
print("Files created successfully:")
print(f"- startup_application.csv: {len(startup_application)} records")
print(f"- application_tags.csv: {len(application_tags)} records")
print(f"- investor_tags.csv: {len(investor_tags)} records")
print(f"- investment_record.csv: {len(investment_record)} records")

