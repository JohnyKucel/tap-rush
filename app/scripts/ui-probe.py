"""Probe: is the fake Phantom actually seen/connected by the adapter?"""
import json
import os
import time

from playwright.sync_api import sync_playwright

APP_URL = "http://127.0.0.1:4173/"
KEYPAIR = json.load(open(os.path.expanduser("~/.config/solana/id.json")))
PUBKEY_B58 = "4QyGboukYFcc4AvZV45yRDXCbsMZjUo9E2xdKnVmcjgC"
PUBKEY_BYTES = KEYPAIR[32:]
INIT_SCRIPT = open(os.path.expanduser("~/workspace/hackathons/solana-blitz-v10/app/scripts/fake-phantom.js")).read()


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=os.path.expanduser("~/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome"),
            args=["--password-store=basic", "--no-sandbox"],
        )
        ctx = browser.new_context(viewport={"width": 1440, "height": 900}, ignore_https_errors=True)
        page = ctx.new_page()
        page.on("console", lambda m: print("CONSOLE", m.type, m.text[:200]) if m.type == "error" else None)
        page.on("pageerror", lambda e: print("PAGEERROR", str(e)[:300]))
        page.add_init_script(INIT_SCRIPT)
        page.goto(APP_URL, wait_until="domcontentloaded", timeout=60000)
        page.locator("h1").wait_for(timeout=30000)
        page.wait_for_timeout(2000)
        print("pre-click window.solana:", page.evaluate("() => ({ isPhantom: !!window.solana?.isPhantom, phantomSolana: !!window.phantom?.solana?.isPhantom, isConnected: !!window.solana?.isConnected })"))
        page.get_by_text("Select Wallet").first.click(timeout=10000)
        page.wait_for_timeout(1200)
        page.get_by_text("Phantom").first.click(timeout=10000)
        page.wait_for_timeout(2000)
        # Modal only selects; the button must be clicked again to connect.
        page.locator(".wallet-adapter-button").first.click(timeout=10000)
        for i in range(5):
            page.wait_for_timeout(2000)
            st = page.evaluate(
                "() => ({ solConnected: !!window.solana?.isConnected, solPubkey: window.solana?.publicKey ? window.solana.publicKey.toBase58() : null, btn: document.querySelector('.wallet-adapter-button')?.textContent?.trim() })"
            )
            print(f"t+{(i+1)*2}s:", st)
        browser.close()


if __name__ == "__main__":
    main()
