
from playwright.sync_api import sync_playwright
import os

def run():
    # Get the absolute path to the html file
    error_500_path = os.path.abspath("dist/500.html")
    not_found_path = os.path.abspath("dist/404.html")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Verify 500 error page (500.html)
        print(f"Loading {error_500_path}")
        page.goto(f"file://{error_500_path}")

        # Check title
        title = page.title()
        print(f"500 Title: {title}")

        # Take screenshot of 500 page
        page.screenshot(path="verification/500_screenshot.png")

        # Verify 404 error page (404.html)
        print(f"Loading {not_found_path}")
        page.goto(f"file://{not_found_path}")

        # Check title
        title_404 = page.title()
        print(f"404 Title: {title_404}")

        # Take screenshot of 404 page
        page.screenshot(path="verification/404_screenshot.png")

        browser.close()

if __name__ == "__main__":
    run()
