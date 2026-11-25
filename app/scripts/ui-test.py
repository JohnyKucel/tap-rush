"""Tap Rush UI drive test — fake Phantom provider injected before page load.

Devnet only. The fake provider exposes the DEPLOY wallet pubkey
(4QyGbouk..., devnet-only throwaway, NOT Grey's wallet). The app never asks
the wallet to sign (all gameplay txs use the derived temp keypair), so the
fake only needs connect()/publicKey/on()/off().
Flow: open UI -> connect Phantom -> delegate -> start round -> tap x5 ->
auto-finish -> leaderboard. Screenshots + video recorded.
"""
import json
import os
import sys
import time

from playwright.sync_api import sync_playwright

APP_URL = "http://127.0.0.1:4173/"
OUT = os.path.expanduser("~/workspace/hackathons/solana-blitz-v10/docs/ui-test")
os.makedirs(OUT, exist_ok=True)

KEYPAIR = json.load(open(os.path.expanduser("~/.config/solana/id.json")))
PUBKEY_B58 = "4QyGboukYFcc4AvZV45yRDXCbsMZjUo9E2xdKnVmcjgC"
PUBKEY_BYTES = KEYPAIR[32:]  # last 32 bytes of the 64-byte secret key

INIT_SCRIPT = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "fake-phantom.js")).read()


def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)


def main():
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=os.path.expanduser(
                "~/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome"
            ),
            args=["--password-store=basic", "--no-sandbox"],
            proxy={"server": "http://127.0.0.1:18080", "bypass": "127.0.0.1,localhost"},
        )
        ctx = browser.new_context(
            viewport={"width": 1440, "height": 900},
            ignore_https_errors=True,
            record_video_dir=os.path.join(OUT, "video"),
            record_video_size={"width": 1440, "height": 900},
        )
        page = ctx.new_page()
        # Google Fonts hang for 60s+ through the proxy and block DOMContentLoaded;
        # abort them (fallback font is cosmetic only).
        page.route("**/fonts.googleapis.com/**", lambda route: route.abort())
        page.route("**/fonts.gstatic.com/**", lambda route: route.abort())
        page.on("console", lambda m: errors.append(f"console.{m.type}: {m.text}") if m.type in ("error",) else None)
        page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
        page.add_init_script(INIT_SCRIPT)
        log("goto app")
        page.goto(APP_URL, wait_until="domcontentloaded", timeout=60000)
        page.locator("h1").wait_for(timeout=30000)
        page.wait_for_timeout(2000)
        page.screenshot(path=os.path.join(OUT, "01-idle.png"))
        log("idle screenshot taken")

        # Connect wallet
        log("click Select Wallet")
        page.get_by_text("Select Wallet").first.click(timeout=10000)
        page.wait_for_timeout(1500)
        page.screenshot(path=os.path.join(OUT, "02-wallet-modal.png"))
        log("click Phantom in modal")
        page.get_by_text("Phantom").first.click(timeout=10000)
        page.wait_for_timeout(2000)
        # Modal only selects; click the wallet button again to actually connect.
        log("click wallet button again to connect")
        page.locator(".wallet-adapter-button").first.click(timeout=10000)
        page.wait_for_timeout(8000)
        page.screenshot(path=os.path.join(OUT, "03-connected.png"))
        body = page.locator("body").inner_text()
        log(f"connected? best visible: {'best kamu' in body.lower()}")

        # Delegate: click the big TAP target while idle
        log("click TAP target (delegate)")
        page.locator("button.tap-target").click(timeout=10000)
        page.wait_for_timeout(12000)
        page.screenshot(path=os.path.join(OUT, "04-delegated.png"))
        log("phase after delegate: " + page.locator("body").inner_text()[:400].replace("\n", " | "))

        # Start round: MULAI button (tap target now says MULAI)
        log("click MULAI (start round)")
        page.locator("button.tap-target").click(timeout=10000)
        # Wait for the live phase: startRound only sets phase=live AFTER its
        # tx confirms (~4-10s through this proxy). Tapping earlier would just
        # re-trigger startRound instead of tap().
        log("waiting for live phase (Ronde jalan di rollup)")
        page.get_by_text("Ronde jalan di rollup").wait_for(timeout=30000)
        log("live! tapping rapidly")
        for i in range(8):
            try:
                page.locator("button.tap-target").click(timeout=3000)
                log(f"tap click {i + 1}")
            except Exception as e:
                log(f"tap click {i + 1} failed: {e}")
            page.wait_for_timeout(1000)
        page.screenshot(path=os.path.join(OUT, "05-live.png"))
        # Wait for auto-finish (10s timer) + commit + record
        log("waiting for auto-finish + leaderboard (25s)")
        page.wait_for_timeout(25000)
        page.screenshot(path=os.path.join(OUT, "06-done.png"))
        text = page.locator("body").inner_text()
        log("final body text:\n" + text)
        log("CONSOLE/PAGE ERRORS: " + (json.dumps(errors, indent=1) if errors else "none"))
        ctx.close()
        browser.close()
    log("done")


if __name__ == "__main__":
    main()
