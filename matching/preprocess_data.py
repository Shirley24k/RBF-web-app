# Preprocess itjuzi.com dataset for three-node system (Application, Tag, Investor)

import pandas as pd
import uuid
import os

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

# Read the dataset using path relative to this file's directory
base_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(base_dir, "Investment dataset.csv")
df = pd.read_csv(file_path, encoding="utf-8")

print(f"Original dataset shape: {df.shape}")
print(f"Columns: {list(df.columns)}")

# Create application_id for each unique investment
df['application_id'] = [str(uuid.uuid4()) for _ in range(len(df))]

# Explode investors of each investment (split comma-separated investors)
df['Investors'] = df['Investors'].str.split(',')
df_exploded = df.explode('Investors')
df_exploded['Investors'] = df_exploded['Investors'].str.strip()

# Convert funding amount to numeric and multiply by 10000 (RMB '0,000 format)
amount_col = "Funding amount (RMB '0,000)"
df_exploded[amount_col] = pd.to_numeric(df_exploded[amount_col], errors='coerce')
df_exploded[amount_col] = df_exploded[amount_col].apply(lambda x: x * 10000 if pd.notnull(x) else x)

# Assign funding range tags
funding_range_col = 'Funding Range'
df_exploded[funding_range_col] = df_exploded[amount_col].apply(assign_funding_range)

print(f"Exploded dataset shape: {df_exploded.shape}")
print(f"Funding ranges found: {df_exploded[funding_range_col].value_counts().to_dict()}")

# --- 1. application_tags.csv (application_id, tag) ---
# Create tags for each application from sector, stage, and funding range

# Sector tags
sector_tags = df.loc[:, ['application_id', 'Sector']].rename(columns={'Sector': 'tag'})
sector_tags['tag'] = sector_tags['tag'].str.strip()

# Stage tags  
stage_tags = df.loc[:, ['application_id', 'Funding stage']].rename(columns={'Funding stage': 'tag'})
stage_tags['tag'] = stage_tags['tag'].str.strip()

# Funding range tags
funding_range_data = df_exploded.loc[:, ['application_id', funding_range_col]].rename(columns={funding_range_col: 'tag'})
funding_range_data['tag'] = funding_range_data['tag'].str.strip()

# Combine all tags and remove duplicates
application_tags = pd.concat([sector_tags, stage_tags, funding_range_data], ignore_index=True)
application_tags = application_tags.dropna().drop_duplicates()

# Clean up tags (remove empty strings and normalize)
application_tags = application_tags[application_tags['tag'].str.len() > 0]
application_tags['tag'] = application_tags['tag'].str.strip()

application_tags.to_csv(os.path.join(base_dir, 'application_tags.csv'), index=False, encoding='utf-8-sig')

# --- 2. investor_tags.csv (investor_id, investor, tag) ---
# Create tags for each investor based on their investment patterns

# Get unique investors from exploded data
unique_investors = df_exploded['Investors'].dropna().unique()

# Create deterministic numeric IDs for investors (1..N), sorted by name
sorted_investors = sorted([inv.strip() for inv in unique_investors if isinstance(inv, str)])
investor_id_map = {inv: idx for idx, inv in enumerate(sorted_investors, start=1)}

investor_tags_list = []

for investor in unique_investors:
    if pd.isna(investor) or investor.strip() == '':
        continue
        
    investor_data = df_exploded[df_exploded['Investors'] == investor]
    
    # Sector preferences for this investor
    sectors = investor_data['Sector'].dropna().unique()
    for sector in sectors:
        if sector.strip():
            investor_tags_list.append({'investor': investor.strip(), 'tag': sector.strip()})
    
    # Stage preferences for this investor
    stages = investor_data['Funding stage'].dropna().unique()
    for stage in stages:
        if stage.strip():
            investor_tags_list.append({'investor': investor.strip(), 'tag': stage.strip()})
    
    # Amount range preferences for this investor
    amounts = investor_data[funding_range_col].dropna().unique()
    for amount in amounts:
        if amount.strip() and amount != 'Unknown':
            investor_tags_list.append({'investor': investor.strip(), 'tag': amount.strip()})

investor_tags = pd.DataFrame(investor_tags_list).drop_duplicates()
investor_tags = investor_tags.dropna()

# Attach numeric id as 'investor' (as string) and keep string as 'investor_name'
investor_tags['investor_name'] = investor_tags['investor']
investor_tags['investor'] = investor_tags['investor_name'].map(investor_id_map).astype(str)

# Reorder columns: investor (id), investor_name, tag
investor_tags = investor_tags[['investor', 'investor_name', 'tag']]

investor_tags.to_csv(os.path.join(base_dir, 'investor_tags.csv'), index=False, encoding='utf-8-sig')

# --- 3. investment_record.csv (application_id, investor_id, investor) ---
# Record which investors actually invested in which applications

investment_record = df_exploded.loc[:, ['application_id', 'Investors']].rename(columns={'Investors': 'investor'})
investment_record = investment_record.dropna()
investment_record['investor'] = investment_record['investor'].str.strip()
investment_record = investment_record[investment_record['investor'].str.len() > 0].drop_duplicates()

# Attach numeric id as 'investor' (as string) and keep string as 'investor_name'
investment_record['investor_name'] = investment_record['investor']
investment_record['investor'] = investment_record['investor_name'].map(investor_id_map).astype(str)

# Reorder columns: application_id, investor (id), investor_name
investment_record = investment_record[['application_id', 'investor', 'investor_name']]

investment_record.to_csv(os.path.join(base_dir, 'investment_record.csv'), index=False, encoding='utf-8-sig')

# Print summary
print("Files created successfully:")
print(f"- application_tags.csv: {len(application_tags)} records")
print(f"- investor_tags.csv: {len(investor_tags)} records") 
print(f"- investment_record.csv: {len(investment_record)} records")

print(f"\nData Summary:")
print(f"- Unique Applications: {len(df)}")
print(f"- Unique Investors: {len(unique_investors)}")
print(f"- Total Investment Records: {len(df_exploded)}")

print(f"\nTag Categories:")
print(f"- Sector Tags: {len(sector_tags)}")
print(f"- Stage Tags: {len(stage_tags)}")
print(f"- Funding Range Tags: {len(funding_range_data)}")

print(f"\nFunding Ranges Found:")
for range_name, count in df_exploded[funding_range_col].value_counts().items():
    print(f"   {range_name}: {count} investments")

