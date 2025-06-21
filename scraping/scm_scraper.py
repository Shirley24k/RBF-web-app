from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import csv
import os
import psycopg2
from dotenv import load_dotenv


def scrape_and_export():
    print("Starting SCM scrape...", flush=True)

    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")

    driver = webdriver.Chrome(options=options)

    try:
        driver.get("https://www.sc.com.my/investor-alert-list")
        print("Page loaded.", flush=True)

        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(3)
        print("Scrolled to bottom.", flush=True)

        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "#row-list-result"))
        )
        print("Content container found.", flush=True)

        # Extract only the investor names from .list-name elements
        name_elements = driver.find_elements(
            By.CSS_SELECTOR,
            ".txt-name .a-inner-text"
        )

        print(f"Found {len(name_elements)} investor names.", flush=True)

        names = []
        for i, el in enumerate(name_elements):
            try:
                full_text = el.text.strip()
                first_line = full_text.split('\n')[0]
                if first_line:
                    names.append(first_line)
                if i % 1000 == 0:
                    print(f"Processed {i}/{len(name_elements)} names", flush=True)
            except Exception as e:
                print(f"Error processing name {i}: {e}", flush=True)

        # Write only names to CSV
        with open("scm_investor_names.csv", "w", encoding="utf-8-sig", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["Investor Name"])  # header
            for name in names:
                writer.writerow([name])

        print("Finished writing investor names to scm_investor_names.csv", flush=True)
        
        # Update database before returning
        update_database_from_csv("scm_investor_names.csv")
        
        return {"success": True, "total": len(names), "file_path": "scm_investor_names.csv"}

    except Exception as e:
        print(f"Error: {str(e)}", flush=True)
        return {"error": str(e)}

    finally:
        driver.quit()
        print("Browser closed.", flush=True)

def update_database_from_csv(csv_path):
    load_dotenv()

    conn = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_DATABASE"),
        user=os.getenv("DB_USERNAME"),
        password=os.getenv("DB_PASSWORD")
    ) 
    cursor = conn.cursor() 

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scm_investors (
            id SERIAL PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            updated_at TIMESTAMP DEFAULT NOW()
        )
    """)
    conn.commit()

    # Read and upsert
    with open(csv_path, encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row["Investor Name"].strip()
            cursor.execute("""
                INSERT INTO scm_investors (name)
                VALUES (%s)
                ON CONFLICT (name)
                DO UPDATE SET updated_at = NOW()
            """, (name,))

    conn.commit()
    cursor.close()
    conn.close()
    print("PostgreSQL updated with scraped data.")
