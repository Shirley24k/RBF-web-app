from neo4j import GraphDatabase
import os
import time

def get_driver():
    """Create a new Neo4j driver instance"""
    # uri = os.getenv("NEO4J_PROD_URI") or ""
    uri = os.getenv("NEO4J_TRAIN_URI") or ""
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
            MATCH (a:Application {application_id: $app_id})-[:has_tag]->(t:Tag)
            WITH collect(DISTINCT t.tag) AS all_tags
            WITH all_tags,
                [x IN all_tags WHERE x =~ '(?i).*[0-9].*'] AS funding_tags,
                [x IN all_tags WHERE x =~ '(?i).*(seed|series).*'] AS stage_tags,
                [x IN all_tags WHERE NOT (x =~ '(?i).*[0-9].*' OR x =~ '(?i).*(seed|series).*')] AS sector_tags
            WITH all_tags, funding_tags, stage_tags, sector_tags,
                1.0 / toFloat(size(all_tags)) AS initial_resource

            UNWIND (
            [x IN funding_tags | {tag: x, w: coalesce(2.0, 1.0)}] +
            [x IN stage_tags | {tag: x, w: coalesce(1.0, 1.0)}] +
            [x IN sector_tags | {tag: x, w: coalesce(3.0, 1.0)}]
            ) AS item

            MATCH (tg:Tag {tag: item.tag})
            WITH initial_resource, item, tg, sector_tags, all_tags,
                COUNT { (tg)<-[:has_tag]-() } + COUNT { (tg)<-[:prefer_tag]-() } AS degree_tag
            WHERE degree_tag > 0

            MATCH (tg)<-[:prefer_tag]-(i:Investor)
            WITH i, initial_resource, item, degree_tag, sector_tags, all_tags

            // Calculate past investment count for tie-breaking
            OPTIONAL MATCH (i)<-[:invested_by]-(pastApp:Application)-[:has_tag]->(secTag:Tag)
            WHERE secTag.tag IN sector_tags
            WITH i, initial_resource, item, degree_tag, COUNT(DISTINCT pastApp) AS sector_investments, all_tags

            // Calculate tag overlap count
            OPTIONAL MATCH (i)-[:prefer_tag]->(overlapTag:Tag)
            WHERE overlapTag.tag IN all_tags
            WITH i, initial_resource, item, degree_tag, sector_investments, COUNT(DISTINCT overlapTag) AS tag_overlap_count

            RETURN i.investor AS RecommendedInvestor,
                sum(item.w * initial_resource / toFloat(degree_tag)) AS score,
                sector_investments,
                tag_overlap_count
            ORDER BY score DESC, sector_investments DESC, tag_overlap_count DESC
            LIMIT 3
            """
            result = session.run(query, app_id=application_id)
            return [(record["RecommendedInvestor"], record["score"], record["sector_investments"], record["tag_overlap_count"]) for record in result]
    return execute_with_retry(operation)

def create_invested_by(application_id, investor_id):
    def operation(driver):
        with driver.session() as session:
            session.run(
                'MERGE (a:Application {application_id: $app_id})\n'
                'MERGE (i:Investor {investor: $inv_id})\n'
                'MERGE (a)-[:invested_by]->(i)',
                app_id=application_id,
                inv_id=investor_id
            )
    return execute_with_retry(operation)