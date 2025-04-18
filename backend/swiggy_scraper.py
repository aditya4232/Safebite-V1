from flask import Flask, request, jsonify
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

app = Flask(__name__)

@app.route('/api/crawl', methods=['GET'])
def crawl_food_sites():
    query = request.args.get("query")
    city = request.args.get("city")

    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        swiggy_url = f"https://www.swiggy.com/search?query={query}&location={city}"
        page.goto(swiggy_url, timeout=60000)

        html = page.content()
        soup = BeautifulSoup(html, 'html.parser')

        # WARNING: These classnames change often – adjust selectors!
        for card in soup.select(".styles_restaurantCard__1dUuM"):  # Swiggy uses dynamic classes
            name = card.select_one("h3") or "Unknown"
            link = "https://swiggy.com" + card.get('href', '')

            results.append({
                "restaurant": name.text.strip(),
                "redirect": link
            })

        browser.close()

    return jsonify(results)
