"""Capture unmodified prototype screens for the approved promo."""

import argparse
import json
from pathlib import Path

from playwright.sync_api import sync_playwright


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://127.0.0.1:5178")
    args = parser.parse_args()
    target = Path(__file__).resolve().parent / "assets"
    target.mkdir(exist_ok=True)
    metadata = {}
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(args=["--force-color-profile=srgb"])
        page = browser.new_page(
            viewport={"width": 900, "height": 2100}, device_scale_factor=3
        )
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        for state in ["form", "pending", "accepted"]:
            suffix = "" if state == "form" else f"&state={state}"
            page.goto(f"{args.url}/auction?role=buyer{suffix}")
            page.evaluate("document.fonts.ready")
            page.wait_for_function(
                "[...document.images].every(image => image.complete && image.naturalWidth)"
            )
            shell = page.locator('[class*="mobileShell"]').first
            page.add_style_tag(content="* { animation: none !important; transition: none !important; caret-color: transparent !important; }")
            metadata[state] = shell.evaluate("""shell => {
                const root = shell.getBoundingClientRect();
                const box = selector => {
                    const element = shell.querySelector(selector);
                    if (!element) return null;
                    const r = element.getBoundingClientRect();
                    return {x:r.x-root.x,y:r.y-root.y,w:r.width,h:r.height};
                };
                const styles = getComputedStyle(document.body);
                const tokens = Object.fromEntries([
                    'control-main-primary-default','text-primary-default',
                    'text-secondary-default','background-primary',
                    'background-secondary','surface-main-default',
                    'stroke-divider-default'
                ].map(name => [name,styles.getPropertyValue('--'+name).trim()]));
                return {width:root.width,height:root.height,
                    gallery:box('[class*="listingGallery"]'),
                    summary:box('[aria-label="Условия аукциона"]'),
                    form:box('[class*="bidBox"]'),
                    input:box('input'),
                    button:box('[class*="bidBox"] > button:not([class*="errorDemo"])'),
                    accepted:box('[role="status"]'),tokens};
            }""")
            shell.screenshot(path=str(target / f"{state}.png"))
        if errors:
            raise RuntimeError(errors)
        browser.close()
    (target / "screens.json").write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2) + "\n"
    )
    print(json.dumps(metadata, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
