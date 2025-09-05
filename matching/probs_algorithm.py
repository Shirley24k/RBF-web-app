from neo4j import GraphDatabase
import os
from dotenv import load_dotenv
import numpy as np
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
        # Create investor node
        session.run('MERGE (i:Investor {investor: $investor})', investor=investor)
        
        # Create tag nodes and connect to investor
        for pref in preferences:
            if pref:  # Skip empty preferences
                session.run(
                    'MERGE (t:Tag {tag: $tag}) '
                    'MERGE (i:Investor {investor: $investor}) '
                    'MERGE (i)-[:prefer_tag]->(t)',
                    tag=pref, investor=investor
                )

def insert_investment_record(app_id, investor_id):
    with driver.session() as session:
        session.run(
            'MERGE (a:Application {application_id: $app_id}) '
            'MERGE (i:Investor {investor: $investor_id}) '
            'MERGE (a)-[:invested_by]->(i)',
            app_id=app_id, investor_id=investor_id
        )

# def match_investor_application(application_id):
#     with driver.session() as session:
#         query = """
#         MATCH (a:Application {application_id: 4})-[:has_tag]->(t:Tag)
#         WITH collect(DISTINCT t.tag) AS all_tags
#         WITH all_tags,
#             [x IN all_tags WHERE x =~ '(?i).*[0-9].*'] AS funding_tags,
#             [x IN all_tags WHERE x =~ '(?i).*(seed|series).*'] AS stage_tags,
#             [x IN all_tags WHERE NOT (x =~ '(?i).*[0-9].*' OR x =~ '(?i).*(seed|series).*')] AS sector_tags
#         WITH all_tags, funding_tags, stage_tags, sector_tags,
#             1.0 / toFloat(size(all_tags)) AS initial_resource

#         UNWIND (
#         [x IN funding_tags | {tag: x, w: coalesce(2.0, 1.0)}] +
#         [x IN stage_tags | {tag: x, w: coalesce(1.0, 1.0)}] +
#         [x IN sector_tags | {tag: x, w: coalesce(3.0, 1.0)}]
#         ) AS item

#         MATCH (tg:Tag {tag: item.tag})
#         WITH initial_resource, item, tg, sector_tags, all_tags,
#             COUNT { (tg)<-[:has_tag]-() } + COUNT { (tg)<-[:prefer_tag]-() } AS degree_tag
#         WHERE degree_tag > 0

#         MATCH (tg)<-[:prefer_tag]-(i:Investor)
#         WITH i, initial_resource, item, degree_tag, sector_tags, all_tags

#         // Calculate past investment count for tie-breaking
#         OPTIONAL MATCH (i)<-[:invested_by]-(pastApp:Application)-[:has_tag]->(secTag:Tag)
#         WHERE secTag.tag IN sector_tags
#         WITH i, initial_resource, item, degree_tag, COUNT(DISTINCT pastApp) AS sector_investments, all_tags

#         // Calculate tag overlap count
#         OPTIONAL MATCH (i)-[:prefer_tag]->(overlapTag:Tag)
#         WHERE overlapTag.tag IN all_tags
#         WITH i, initial_resource, item, degree_tag, sector_investments, COUNT(DISTINCT overlapTag) AS tag_overlap_count

#         RETURN i.investor AS RecommendedInvestor,
#             sum(item.w * initial_resource / toFloat(degree_tag)) AS score,
#             sector_investments,
#             tag_overlap_count
#         ORDER BY score DESC, sector_investments DESC, tag_overlap_count DESC
#         """
#         result = session.run(query, app_id=application_id)
#         return [(record["RecommendedInvestor"], record["score"], record["sector_investments"]) for record in result]

def load_csv_data_to_neo4j():
    """Load processed CSV data into Neo4j database"""
    print("🔄 Loading CSV data into Neo4j database...")
    
    try:
        # Read CSV files
        app_tags_df = pd.read_csv('matching/application_tags.csv')
        investor_tags_df = pd.read_csv('matching/investor_tags.csv')
        investment_record_df = pd.read_csv('matching/investment_record.csv')
        
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
                print(f"   Error inserting investment record {app_id}: {e}")
        print(f"   Inserted {len(unique_investment_record)} investment record...")
        return True

    except Exception as e:
        print(f"Error loading CSV data: {e}")
        return False

def compute_tag_coverage(app_tags, recommended_investors, investor_tags):
    covered_tags = set()
    for inv in recommended_investors:
        covered_tags |= investor_tags.get(inv, set())
    return len(app_tags & covered_tags) / len(app_tags) if app_tags else 0.0

def compute_tag_overlap(app_tags, investor, investor_tags):
    inv_tags = investor_tags.get(investor, set())
    union = app_tags | inv_tags
    inter = app_tags & inv_tags
    return len(inter) / len(union) if union else 0.0


def evaluate_algorithm_quality_real(app_tag_map, inv_tag_map, app_investments):
    """Evaluate algorithm quality using the actual match_investor_application() method"""
    print("=== Real Algorithm Quality Evaluation ===")
    
    total_applications = len(app_tag_map)
    total_investors = len(inv_tag_map)
    
    successful_matches = 0
    failed_matches = 0
    total_recommendations = 0
    all_match_scores = []
    execution_times = []
    
    # Enhanced metrics
    tag_match_accuracies = []
    preference_coverages = []
    recommendation_diversities = []
    all_recommended_investors = set()
    
    print(f"Testing {total_applications} applications with real matching algorithm...")
    
    for i, app_id in enumerate(app_tag_map.keys()):
        try:
            start_time = time.time()
            
            # Use the REAL matching algorithm
            matches = match_investor_application(app_id)
            
            end_time = time.time()
            execution_time = end_time - start_time
            execution_times.append(execution_time)
            
            if matches and len(matches) > 0:
                successful_matches += 1
                total_recommendations += len(matches)
                
                # Collect match scores
                scores = [score for _, score in matches]
                all_match_scores.extend(scores)
                
                # Get application tags for this app
                app_tags = app_tag_map.get(app_id, set())
                
                # === 1. TAG MATCH ACCURACY ===
                # Calculate how well the recommended investors match the application's tags
                tag_match_scores = []
                for investor, score in matches:
                    if investor in inv_tag_map:
                        investor_tags = inv_tag_map[investor]
                        # Calculate tag overlap ratio
                        overlap = len(app_tags & investor_tags)
                        if len(app_tags) > 0:
                            tag_accuracy = overlap / len(app_tags)
                            tag_match_scores.append(tag_accuracy)
                
                if tag_match_scores:
                    avg_tag_accuracy = sum(tag_match_scores) / len(tag_match_scores)
                    tag_match_accuracies.append(avg_tag_accuracy)
                
                # === 2. PREFERENCE COVERAGE ===
                # Calculate how well the application's preferences are covered by recommended investors
                covered_preferences = set()
                for investor, _ in matches:
                    if investor in inv_tag_map:
                        covered_preferences |= inv_tag_map[investor]
                
                if app_tags:
                    coverage = len(app_tags & covered_preferences) / len(app_tags)
                    preference_coverages.append(coverage)
                
                # === 3. RECOMMENDATION DIVERSITY ===
                # Calculate diversity of recommended investors
                recommended_investors = [investor for investor, _ in matches]
                unique_investors = set(recommended_investors)
                diversity = len(unique_investors) / len(recommended_investors) if recommended_investors else 0
                recommendation_diversities.append(diversity)
                
                # Track all recommended investors for global diversity
                all_recommended_investors.update(recommended_investors)
                
                # Progress indicator
                if (i + 1) % 10 == 0 or (i + 1) == total_applications:
                    print(f"   Processed {i + 1}/{total_applications} applications...")
            else:
                failed_matches += 1
                
        except Exception as e:
            failed_matches += 1
            print(f"   Error processing application {app_id}: {e}")
    
    # Calculate basic metrics
    success_rate = (successful_matches / total_applications) * 100 if total_applications > 0 else 0
    avg_execution_time = sum(execution_times) / len(execution_times) if execution_times else 0
    avg_match_score = sum(all_match_scores) / len(all_match_scores) if all_match_scores else 0
    avg_recommendations_per_app = total_recommendations / successful_matches if successful_matches > 0 else 0
    
    # Calculate enhanced metrics
    avg_tag_match_accuracy = sum(tag_match_accuracies) / len(tag_match_accuracies) if tag_match_accuracies else 0
    avg_preference_coverage = sum(preference_coverages) / len(preference_coverages) if preference_coverages else 0
    avg_recommendation_diversity = sum(recommendation_diversities) / len(recommendation_diversities) if recommendation_diversities else 0
    
    # Global diversity: how many unique investors are recommended across all applications
    global_diversity = len(all_recommended_investors) / total_investors if total_investors > 0 else 0
    
    # Comprehensive quality score
    quality_score = (
        (success_rate / 100) * 0.25 +           # Success rate weight: 25%
        avg_tag_match_accuracy * 0.25 +         # Tag match accuracy weight: 25%
        avg_preference_coverage * 0.25 +        # Preference coverage weight: 25%
        avg_recommendation_diversity * 0.25     # Recommendation diversity weight: 25%
    )
    
    print(f"\n=== Real Algorithm Performance Results ===")
    print(f"Applications tested: {total_applications}")
    print(f"Successful matches: {successful_matches}")
    print(f"Failed matches: {failed_matches}")
    print(f"Success rate: {success_rate:.1f}%")
    print(f"Total recommendations: {total_recommendations}")
    print(f"Avg recommendations per app: {avg_recommendations_per_app:.1f}")
    print(f"Average match score: {avg_match_score:.4f}")
    print(f"Average execution time: {avg_execution_time:.4f}s")
    
    print(f"\n=== Enhanced Quality Metrics ===")
    print(f"Tag Match Accuracy: {avg_tag_match_accuracy:.4f} ({avg_tag_match_accuracy*100:.1f}%)")
    print(f"Preference Coverage: {avg_preference_coverage:.4f} ({avg_preference_coverage*100:.1f}%)")
    print(f"Recommendation Diversity: {avg_recommendation_diversity:.4f} ({avg_recommendation_diversity*100:.1f}%)")
    print(f"Global Investor Diversity: {global_diversity:.4f} ({global_diversity*100:.1f}%)")
    print(f"Unique Investors Recommended: {len(all_recommended_investors)}/{total_investors}")
    
    print(f"\nOverall Quality Score: {quality_score:.4f}")
    print("Algorithm Quality:", "EXCELLENT" if quality_score > 0.8 else "GOOD" if quality_score > 0.6 else "FAIR" if quality_score > 0.4 else "POOR")
    
    return {
        "applications": total_applications,
        "successful_matches": successful_matches,
        "failed_matches": failed_matches,
        "success_rate": success_rate,
        "total_recommendations": total_recommendations,
        "avg_recommendations_per_app": avg_recommendations_per_app,
        "avg_match_score": avg_match_score,
        "avg_execution_time": avg_execution_time,
        "tag_match_accuracy": avg_tag_match_accuracy,
        "preference_coverage": avg_preference_coverage,
        "recommendation_diversity": avg_recommendation_diversity,
        "global_diversity": global_diversity,
        "unique_investors_recommended": len(all_recommended_investors),
        "quality_score": quality_score,
    }


if __name__ == "__main__":
    try:
        # print("Starting CSV to Neo4j Pipeline...")
        
        # Step 1: Load CSV data into Neo4j
        # csv_loaded = load_csv_data_to_neo4j()
        
        print(f"\nEvaluating algorithm quality with real matching algorithm...")
        with driver.session() as session:
            app_tag_map = session.execute_read(get_application_tags)
            inv_tag_map = session.execute_read(get_investor_tags)
            app_investments = session.execute_read(get_investment_record)

        # metrics = evaluate_algorithm_quality_real(app_tag_map, inv_tag_map, app_investments)
        # Compute average tag coverage and overlap across all apps
        avg_tag_coverage = 0.0
        avg_tag_overlap = 0.0
        num_apps = len(app_tag_map)

        for app_id, app_tags in app_tag_map.items():
            recs = match_investor_application(app_id) or []
            inv_names = [r[0] for r in recs]  # extract investor names

            # Coverage: fraction of app tags covered by union of recommended investors' tags
            cov = compute_tag_coverage(app_tags, inv_names, inv_tag_map)

            # Jaccard overlap per recommended investor, then average
            per_inv_overlaps = [compute_tag_overlap(app_tags, inv_name, inv_tag_map) for inv_name in inv_names]
            jacc = float(np.mean(per_inv_overlaps)) if per_inv_overlaps else 0.0

            avg_tag_coverage += cov
            avg_tag_overlap += jacc

        if num_apps > 0:
            avg_tag_coverage /= float(num_apps)
            avg_tag_overlap /= float(num_apps)

        print(f"Average tag coverage: {avg_tag_coverage:.4f}")
        print(f"Average tag overlap: {avg_tag_overlap:.4f}")
        print(f"\nPipeline completed successfully!")
        
    except Exception as e:
        print(f"Pipeline failed with error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        driver.close()
        print(" Database connection closed")
