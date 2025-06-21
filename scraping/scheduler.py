import schedule
import time
from .scm_scraper import scrape_and_export  # ✅ relative import

def job():
    print("Scheduled scraping started...")
    result = scrape_and_export()
    print("Scheduled scraping completed. Total:", result.get("total", 0))

schedule.every().day.at("10:00").do(job)  # 🕙 Daily at 10 AM

if __name__ == "__main__":
    print("Scheduler running from scraping/ folder...")
    while True:
        schedule.run_pending()
        time.sleep(1)
