from flask import Flask, jsonify
from scraping.scm_scraper import scrape_and_export

app = Flask(__name__)

@app.route("/scrape-scm", methods=["GET"])
def trigger_scrape():
    result = scrape_and_export()
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
