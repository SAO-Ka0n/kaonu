#!/usr/bin/env python3
"""Search Reddit posts via the public JSON endpoint (no login).

Exit codes: 0 ok, 1 other error, 2 blocked by network policy.
"""
import argparse
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

UA = "social-search-skill/1.0"


def parse(data):
    rows = []
    for child in data.get("data", {}).get("children", []):
        p = child.get("data", {})
        rows.append({
            "title": p.get("title", ""),
            "subreddit": p.get("subreddit", ""),
            "author": p.get("author", ""),
            "score": p.get("score", 0),
            "comments": p.get("num_comments", 0),
            "date": datetime.fromtimestamp(p.get("created_utc", 0), timezone.utc).strftime("%Y-%m-%d"),
            "url": "https://www.reddit.com" + p.get("permalink", ""),
        })
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("query")
    ap.add_argument("--sort", default="relevance", choices=["relevance", "hot", "top", "new", "comments"])
    ap.add_argument("--time", default="all", choices=["hour", "day", "week", "month", "year", "all"])
    ap.add_argument("--limit", type=int, default=10)
    ap.add_argument("--subreddit")
    args = ap.parse_args()

    base = f"https://www.reddit.com/r/{args.subreddit}/search.json" if args.subreddit else "https://www.reddit.com/search.json"
    params = {"q": args.query, "sort": args.sort, "t": args.time, "limit": min(args.limit, 100)}
    if args.subreddit:
        params["restrict_sr"] = "1"
    req = urllib.request.Request(base + "?" + urllib.parse.urlencode(params), headers={"User-Agent": UA})

    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.load(resp)
    except urllib.error.HTTPError as e:
        print(f"ERROR: reddit returned HTTP {e.code}", file=sys.stderr)
        sys.exit(1)
    except urllib.error.URLError as e:
        msg = str(e)
        if "tunnel" in msg.lower():
            print(f"BLOCKED: network policy denied www.reddit.com ({msg})", file=sys.stderr)
            sys.exit(2)
        print(f"ERROR: {msg}", file=sys.stderr)
        sys.exit(1)

    for r in parse(data):
        print(json.dumps(r, ensure_ascii=False))


if __name__ == "__main__":
    main()
