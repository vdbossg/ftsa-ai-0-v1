# server\proxy\forexfactory_proxy.py
import sys
import traceback
from flask import Flask, Response
from playwright.sync_api import sync_playwright

sys.stderr = open("proxy_error.log", "w")
sys.stdout = open("proxy_output.log", "w")

app = Flask(__name__)

@app.route("/calendar")
def calendar():
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent=("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                            "AppleWebKit/537.36 (KHTML, like Gecko) "
                            "Chrome/115.0.0.0 Safari/537.36"),
                locale="en-US",
                java_script_enabled=True
            )
            page = context.new_page()

            # Navigate with network idle
            page.goto("https://www.forexfactory.com/calendar", wait_until="networkidle")
            page.wait_for_timeout(5000)  # wait extra 5s for JS rendering

            html = page.content()
            context.close()
            browser.close()

            return Response(html, mimetype='text/html')
    except Exception as e:
        traceback.print_exc(file=sys.stderr)
        return f"Proxy error: {str(e)}", 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8081)

