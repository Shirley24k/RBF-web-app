from neo4j import GraphDatabase
import os
import time

def get_driver():
    """Create a new Neo4j driver instance"""
    uri = os.getenv("NEO4J_PROD_URI") or ""
    username = os.getenv("NEO4J_USERNAME") or ""
    password = os.getenv("NEO4J_PASSWORD") or ""
    
    if not uri or not username or not password:
        raise ValueError("Missing Neo4j environment variables")
    
    return GraphDatabase.driver(uri, auth=(username, password))

def execute_with_retry(operation, max_retries=3):
    """Execute a Neo4j operation with retry logic"""
    for attempt in range(max_retries):
        try:
            driver = get_driver()
            driver.verify_connectivity()
            result = operation(driver)
            driver.close()
            return result
        except Exception as e:
            driver.close() if 'driver' in locals() else None
            if attempt == max_retries - 1:
                raise e
            time.sleep(1 * (attempt + 1))  # Exponential backoff

def insert_investor(id, investment_preferences):
    def operation(driver):
        tags = []
        for key in ['preferred_industry', 'preferred_funding_stage']:
            tags.extend(investment_preferences.get(key, []))
        tags.append(investment_preferences.get('investment_amount_range'))
        
        with driver.session() as session:
            session.run('MERGE (i:Investor {investor: $id})', id=id)
            for tag in tags:
                if tag:
                    session.run(
                        'MERGE (t:Tag {tag: $tag}) '
                        'MERGE (i:Investor {investor: $id}) '
                        'MERGE (i)-[:prefer_tag]->(t)',
                        tag=tag, id=id
                    )
    
    execute_with_retry(operation)

def update_investor(id, investment_preferences):
    def operation(driver):
        tags = []
        for key in ['preferred_industry', 'preferred_funding_stage']:
            tags.extend(investment_preferences.get(key, []))
        tags.append(investment_preferences.get('investment_amount_range'))
        
        with driver.session() as session:
            # Use a transaction for atomicity
            with session.begin_transaction() as tx:
                # Get current tags for this investor
                result = tx.run(
                    'MATCH (i:Investor {investor: $id})-[r:prefer_tag]->(t:Tag) '
                    'RETURN t.tag as tag',
                    id=id
                )
                current_tags = [record['tag'] for record in result]
                
                # Remove old relationships
                tx.run(
                    'MATCH (i:Investor {investor: $id})-[r:prefer_tag]->(t:Tag) '
                    'DELETE r',
                    id=id
                )
                
                # Add new relationships
                for tag in tags:
                    if tag:
                        tx.run(
                            'MERGE (t:Tag {tag: $tag}) '
                            'MERGE (i:Investor {investor: $id}) '
                            'MERGE (i)-[:prefer_tag]->(t)',
                            tag=tag, id=id
                        )
                
                # Clean up orphaned tags (tags with no relationships)
                tx.run(
                    'MATCH (t:Tag) '
                    'WHERE NOT (t)<-[:prefer_tag]-() AND NOT (t)<-[:has_tag]-() '
                    'DELETE t'
                )
    
    execute_with_retry(operation)

def insert_application(app_id, funding_amount_range, funding_stage, company_sector, tags=None):
    def operation(driver):
        # Create tags list from parameters and additional tags
        base_tags = [funding_amount_range, funding_stage, company_sector]
        if tags:
            base_tags.extend(tags)
        
        # Filter out empty/None tags
        valid_tags = [tag for tag in base_tags if tag]
        
        with driver.session() as session:
            # Create application node
            session.run('MERGE (a:Application {application_id: $id})', id=app_id)
            
            # Create tag nodes and connect to application
            for tag in valid_tags:
                session.run(
                    'MERGE (t:Tag {tag: $tag}) '
                    'MERGE (a:Application {application_id: $id}) '
                    'MERGE (a)-[:has_tag]->(t)',
                    tag=tag, id=app_id
                )
    
    execute_with_retry(operation)

def match_investor_application(application_id):
    def operation(driver):
        with driver.session() as session:
            query = """
            MATCH (app:Application {application_id: $app_id})-[:has_tag]->(app_tag:Tag)
            WITH app, collect(app_tag) AS application_tags
            MATCH (i:Investor)-[:prefer_tag]->(inv_tag:Tag)
            WITH i, collect(inv_tag) AS investor_tags, application_tags

            WITH
              i,
              size([
                x IN application_tags
                WHERE x.tag IN [y IN investor_tags | y.tag] AND NOT x.tag STARTS WITH 'RM' AND NOT x.tag STARTS WITH 'Less' AND NOT x.tag STARTS WITH 'More'
              ]) AS sector_stage_match,
              [x IN application_tags WHERE x.tag STARTS WITH 'RM' OR x.tag STARTS WITH 'Less' OR x.tag STARTS WITH 'More'] AS s_funding_tags,
              [y IN investor_tags WHERE y.tag STARTS WITH 'RM' OR y.tag STARTS WITH 'Less' OR y.tag STARTS WITH 'More'] AS i_funding_tags

            WITH i, sector_stage_match, s_funding_tags, i_funding_tags
            UNWIND s_funding_tags AS s_fund_tag
            UNWIND i_funding_tags AS i_fund_tag

            WITH i, sector_stage_match, s_fund_tag, i_fund_tag
            CALL (s_fund_tag) {
              RETURN CASE
                WHEN s_fund_tag.tag = 'Less than RM 100,000' THEN 50000
                WHEN s_fund_tag.tag = 'RM 100,000 - RM 500,000' THEN 300000
                WHEN s_fund_tag.tag = 'RM 500,000 - RM 1,000,000' THEN 750000
                WHEN s_fund_tag.tag = 'RM 1,000,000 - RM 2,000,000' THEN 1500000
                WHEN s_fund_tag.tag = 'RM 2,000,000 - RM 5,000,000' THEN 3500000
                WHEN s_fund_tag.tag = 'More than RM 5,000,000' THEN 7000000
                ELSE 0
              END AS s_amount
            }

            CALL (i_fund_tag) {
              RETURN CASE
                WHEN i_fund_tag.tag = 'Less than RM 100,000' THEN 50000
                WHEN i_fund_tag.tag = 'RM 100,000 - RM 500,000' THEN 300000
                WHEN i_fund_tag.tag = 'RM 500,000 - RM 1,000,000' THEN 750000
                WHEN i_fund_tag.tag = 'RM 1,000,000 - RM 2,000,000' THEN 1500000
                WHEN i_fund_tag.tag = 'RM 2,000,000 - RM 5,000,000' THEN 3500000
                WHEN i_fund_tag.tag = 'More than RM 5,000,000' THEN 7000000
                ELSE 0
              END AS i_amount
            }

            WITH i, sector_stage_match, s_amount, i_amount
            WHERE s_amount > 0 AND i_amount > 0
            WITH i, sector_stage_match, exp(- abs(s_amount - i_amount) / 100000) AS funding_sim
            WITH i, sector_stage_match, avg(funding_sim) AS avg_funding_sim
            WITH i, (avg_funding_sim * 1.0) + (sector_stage_match * 1.0) AS score
            RETURN i.investor AS RecommendedInvestor, score
            ORDER BY score DESC
            LIMIT 3
            """
            result = session.run(query, app_id=application_id)
            return [(record["RecommendedInvestor"], record["score"]) for record in result]
    return execute_with_retry(operation)