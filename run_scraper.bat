@echo off
cd /d "C:\RBF\flask-ml"
call venv\Scripts\activate
echo Starting scraper at %date% %time% >> logs\scraper.log
python run_scraper.py >> logs\scraper.log 2>&1


