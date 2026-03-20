#!/usr/bin/env python3

import json
import pathlib
import time
import sys
import urllib.error
import urllib.request


ROOT = pathlib.Path(__file__).resolve().parent
MANIFEST_PATH = ROOT / "seed_image_manifest.json"
OUTPUT_DIR = ROOT / "seed-images"


def main() -> int:
    manifest = json.loads(MANIFEST_PATH.read_text())
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    failures = []
    for item in manifest:
        target = OUTPUT_DIR / item["localFilename"]
        if target.exists():
            print(f"Skipping {target.name} (already downloaded)")
            continue
        print(f"Downloading {item['listingTitle']} -> {target.name}")
        for attempt in range(1, 5):
            try:
                request = urllib.request.Request(
                    item["downloadUrl"],
                    headers={"User-Agent": "BoxDrop seed image downloader"},
                )
                with urllib.request.urlopen(request) as response:
                    target.write_bytes(response.read())
                break
            except urllib.error.HTTPError as exc:
                if exc.code == 429 and attempt < 4:
                    time.sleep(5 * attempt)
                    continue
                failures.append((item["listingTitle"], str(exc)))
                break
            except urllib.error.URLError as exc:
                failures.append((item["listingTitle"], str(exc)))
                break
        time.sleep(1)

    if failures:
        for title, error in failures:
            print(f"FAILED: {title}: {error}", file=sys.stderr)
        return 1

    print(f"Downloaded {len(manifest)} files to {OUTPUT_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
