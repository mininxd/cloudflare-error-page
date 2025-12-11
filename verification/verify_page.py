
from playwright.sync_api import sync_playwright
import os
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the local HTML file
        file_path = os.path.abspath("dist/index.html")
        page.goto(f"file://{file_path}")

        # Wait for dynamic content to be populated
        page.wait_for_selector("#error-time")
        page.wait_for_selector("#ray-id")

        # We don't wait for #cf-footer-ip to be visible because it's hidden by default.
        # But we can check its textContent if it is populated (which it should be, either from config or fetch)

        # Verify content is not empty
        time_text = page.locator("#error-time").text_content()
        ray_id_text = page.locator("#ray-id").text_content()

        print(f"Time: {time_text}")
        print(f"Ray ID: {ray_id_text}")

        # Check against expected config values
        # In config.json: "time": "2025-12-11 08:25:25 UTC"
        # In config.json: "ray_id": "0123456789abcdef"

        if time_text != "2025-12-11 08:25:25 UTC":
             print(f"ERROR: Time does not match config. Expected '2025-12-11 08:25:25 UTC', got '{time_text}'")

        if ray_id_text != "0123456789abcdef":
             print(f"ERROR: Ray ID does not match config. Expected '0123456789abcdef', got '{ray_id_text}'")

        # Verify Client IP
        # In config.json: "client_ip": "1.1.1.1"
        # The element is hidden, but textContent should be set.
        ip_text = page.locator("#cf-footer-ip").text_content()
        print(f"Client IP: {ip_text}")

        if ip_text != "1.1.1.1":
            print(f"ERROR: Client IP does not match config. Expected '1.1.1.1', got '{ip_text}'")

        # Verify Host Name
        # In config.json: "host_status": { "name": "" } -> Should fallback to window.location.origin
        # Since we are opening file://, origin is usually 'null' or empty or file://
        host_text = page.locator("#host-name").text_content()
        print(f"Host Name: {host_text}")

        # Since we cannot easily predict origin in headless file:// mode (often 'null'), we just verify it's not empty string if origin is not empty.
        # Actually, origin for file:// is 'null' in Chromium.
        if host_text == "":
            # Only acceptable if origin is actually empty, but usually textContent is 'null' string if origin is null
             print("WARNING: Host Name is empty.")

        # Take screenshot
        page.screenshot(path="verification/screenshot.png")
        print("Screenshot saved to verification/screenshot.png")

        browser.close()

if __name__ == "__main__":
    run()
