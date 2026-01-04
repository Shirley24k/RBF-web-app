# This is the evaluation script for the matching algorithm on itjuzi.com dataset (use local Neo4j)

from neo4j import GraphDatabase
import os
from dotenv import load_dotenv
import time
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from matching import match_investor_application, execute_with_retry
import pandas as pd
import re
load_dotenv() 

# Use training database for testing performance (local Neo4j instance)
uri = os.getenv("NEO4J_TRAIN_URI") or ""
username = os.getenv("NEO4J_USERNAME") or ""
password = os.getenv("NEO4J_PASSWORD") or ""

driver = GraphDatabase.driver(uri, auth=(username, password))
driver.verify_connectivity()

def get_application_tags(tx):
    """Return dict: application_id -> set(tags)"""
    query = """
    MATCH (a:Application)-[:has_tag]->(t:Tag)
    RETURN a.application_id AS app_id, collect(DISTINCT t.tag) AS tags
    """
    result = tx.run(query)
    return {r["app_id"]: set(r["tags"]) for r in result}

def get_investor_tags(tx):
    """Return dict: investor -> set(tags)"""
    query = """
    MATCH (i:Investor)-[:prefer_tag]->(t:Tag)
    RETURN i.investor AS investor, collect(DISTINCT t.tag) AS tags
    """
    result = tx.run(query)
    return {r["investor"]: set(r["tags"]) for r in result}

def get_investment_record(tx):
    """Return dict: application_id -> set(investors)"""
    query = """
    MATCH (a:Application)-[:invested_by]->(i:Investor)
    RETURN a.application_id AS app_id, collect(DISTINCT i.investor) AS investors
    """
    result = tx.run(query)
    return {r["app_id"]: set(r["investors"]) for r in result}

def get_all_applications(tx):
    """Get all application IDs from the database"""
    result = tx.run("MATCH (a:Application) RETURN a.application_id AS Application")
    return [r["Application"] for r in result]

def insert_application_simple(app_id, tags):
    """Simplified application insertion - just app_id and all tags"""
    with driver.session() as session:   
        # Create application node
        session.run('MERGE (a:Application {application_id: $id})', id=app_id)
        
        # Create tag nodes and connect to application
        for tag in tags:
            if tag:  # Skip empty tags
                session.run(
                    'MERGE (t:Tag {tag: $tag}) '
                    'MERGE (a:Application {application_id: $id}) '
                    'MERGE (a)-[:has_tag]->(t)',
                    tag=tag, id=app_id
                )

def insert_investor_simple(investor, preferences):
    """Simplified investor insertion - just investor name and all preferences"""
    with driver.session() as session:
        # Create investor node with string ID
        session.run('MERGE (i:Investor {investor: $investor_id})', investor_id=str(investor))
        
        # Create tag nodes and connect to investor
        for pref in preferences:
            if pref:  # Skip empty preferences
                session.run(
                    'MERGE (t:Tag {tag: $tag}) '
                    'MERGE (i:Investor {investor: $investor_id}) '
                    'MERGE (i)-[:prefer_tag]->(t)',
                    tag=pref, investor_id=str(investor)
                )

def insert_investment_record(app_id, investor):
    with driver.session() as session:
        session.run(
            'MERGE (a:Application {application_id: $app_id}) '
            'MERGE (i:Investor {investor: $investor_id}) '
            'MERGE (a)-[:invested_by]->(i)',
            app_id=app_id, investor_id=str(investor)
        )

def load_csv_data_to_neo4j():
    """Load processed CSV data into Neo4j database"""
    print("🔄 Loading CSV data into Neo4j database...")
    
    try:
        # Read CSV files using paths relative to this script's directory
        base_dir = os.path.dirname(os.path.abspath(__file__))
        app_tags_df = pd.read_csv(os.path.join(base_dir, 'application_tags.csv'))
        investor_tags_df = pd.read_csv(os.path.join(base_dir, 'investor_tags.csv'))
        investment_record_df = pd.read_csv(os.path.join(base_dir, 'investment_record.csv'))
        
        print(f" Found {len(app_tags_df)} application tag records")
        print(f" Found {len(investor_tags_df)} investor tag records")
        print(f" Found {len(investment_record_df)} investment record records")
        
        # Get unique applications and investors
        unique_apps = app_tags_df['application_id'].unique()
        unique_investors = investor_tags_df['investor'].unique()
        unique_investment_record = investment_record_df[['application_id', 'investor']].drop_duplicates()
        
        print(f" Processing {len(unique_apps)} applications and {len(unique_investors)} investors...")
        
        # Insert applications
        print(f"\nInserting applications...")
        for i, app_id in enumerate(unique_apps):
            try:
                # Get all tags for this application
                app_tags = app_tags_df[app_tags_df['application_id'] == app_id]['tag'].tolist()
                
                # Insert application with all tags
                insert_application_simple(app_id, app_tags)
                
                if (i + 1) % 10 == 0 or (i + 1) == len(unique_apps):
                    print(f"   Inserted {i + 1}/{len(unique_apps)} applications...")
                    
            except Exception as e:
                print(f"   Error inserting application {app_id}: {e}")
        
        # Insert investors
        print(f"\n👥 Inserting investors...")
        for i, investor in enumerate(unique_investors):
            try:
                # Get all preferences for this investor
                investor_prefs = investor_tags_df[investor_tags_df['investor'] == investor]['tag'].tolist()
                
                # Insert investor with all preferences (simplified approach)
                insert_investor_simple(investor, investor_prefs)
                
                if (i + 1) % 20 == 0 or (i + 1) == len(unique_investors):
                    print(f"   Inserted {i + 1}/{len(unique_investors)} investors...")
                    
            except Exception as e:
                print(f"   Error inserting investor {investor}: {e}")
        
        print(f"\nCSV data loaded successfully into Neo4j!")
        
        #Insert investment record
        print(f"\nInserting investment record...")
        for row in unique_investment_record.itertuples(index=False):
            try:
                insert_investment_record(str(row.application_id), str(row.investor))
            except Exception as e:
                print(f"   Error inserting investment record {row.application_id}: {e}")
        print(f"   Inserted {len(unique_investment_record)} investment record...")
        return True

    except Exception as e:
        print(f"Error loading CSV data: {e}")
        return False

def print_recommendations(app_tag_map):
    """Print recommendations for each application with score, sector investments, and tag overlap count."""
    total_apps = len(app_tag_map)
    print(f"\n=== Recommendations By Application ===")
    print(f"Applications: {total_apps}")
    for idx, app_id in enumerate(app_tag_map.keys(), start=1):
        try:
            start_time = time.time()
            matches = match_investor_application(app_id) or []
            elapsed = time.time() - start_time
            print(f"\nApplication {app_id} (#{idx}/{total_apps}) - computed in {elapsed:.3f}s")
            if not matches:
                print("  No recommendations found.")
                continue
            # Detect fallback (tuples of length 2) vs primary (length >= 4)
            primary_shape = len(matches[0]) >= 4
            if primary_shape:
                print("  Investor | Score | SectorInvestments | TagOverlapCount")
                for rec in matches:
                    investor, score, sector_investments, tag_overlap_count = rec[0], rec[1], rec[2], rec[3]
                    print(f"  {investor} | {score:.4f} | {sector_investments} | {tag_overlap_count}")
            else:
                print("  [Fallback] Investor | PastInvestments")
                for rec in matches:
                    investor, past_investments = rec[0], rec[1]
                    print(f"  {investor} | {past_investments}")
        except Exception as e:
            print(f"  Error generating recommendations for application {app_id}: {e}")


if __name__ == "__main__":
    try:
        # print("Starting CSV to Neo4j Pipeline...")
        
        # Step 1: Load CSV data into Neo4j
        csv_loaded = load_csv_data_to_neo4j()
        
        print(f"\nGenerating recommendations using matching algorithm...")
        with driver.session() as session:
            app_tag_map = session.execute_read(get_application_tags)
            inv_tag_map = session.execute_read(get_investor_tags)
            app_investments = session.execute_read(get_investment_record)
        
        # Print recommendations per application
        print_recommendations(app_tag_map)
        print(f"\nDone.")
        
    except Exception as e:
        print(f"Pipeline failed with error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        driver.close()
        print(" Database connection closed")
