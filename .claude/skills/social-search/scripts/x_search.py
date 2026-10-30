#!/usr/bin/env python3
"""Search recent X posts (last 7 days) via the official X API v2.

Needs env X_BEARER_TOKEN. Billed per post read (pay-per-use), so keep --limit small.
Exit codes: 0 ok, 1 other error, 2 blocked by network policy, 3 missing token.
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

BASE = "https://api.x.com/2/tweets/search/recent"


def parse(data):
    users = {u["id"]: u["username"] for u in data.get("includes", {}).get("users", [])}
    rows = []
    for t in data.get("data", []):
        m = t.get("public_metrics", {})
        author = users.get(t.get("author_id"), "")
        rows.append({
            "text": t.get("text", "").replace("\n", " "),
            "author": author,
            "likes": m.get("like_count", 0),
            "retweets": m.get("retweet_count", 0),
            "replies": m.get("reply_count", 0),
            "views": m.get("impression_count"),
            "date": t.get("created_at", "")[:10],
            "url": f"https://x.com/{author or 'i'}/status/{t['id']}",
        })
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("query")
    ap.add_argument("--sort", default="relevancy", choices=["relevancy", "recency"])
    ap.add_argument("--limit", type=int, default=10)
    ap.add_argument("--keep-retweets", action="store_true")
    args = ap.parse_args()

    token = os.environ.get("X_BEARER_TOKEN")
    if not token:
        print("MISSING: env X_BEARER_TOKEN is not set", file=sys.stderr)
        sys.exit(3)

    query = args.query if args.keep_retweets else f"({args.query}) -is:retweet"
    params = {
        "query": query,
        "max_results": max(10, min(args.limit, 100)),  # API minimum is 10
        "sort_order": args.sort,
        "tweet.fields": "created_at,public_metrics,author_id",
        "expansions": "author_id",
        "user.fields": "username",
    }
    req = urllib.request.Request(
        BASE + "?" + urllib.parse.urlencode(params),
        headers={"Authorization": f"Bearer {token}", "User-Agent": "social-search-skill/1.0"},
    )

    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.load(resp)
    except urllib.error.HTTPError as e:
        print(f"ERROR: X API returned HTTP {e.code}: {e.read()[:300].decode(errors='replace')}", file=sys.stderr)
        sys.exit(1)
    except urllib.error.URLError as e:
        msg = str(e)
        if "tunnel" in msg.lower():
            print(f"BLOCKED: network policy denied api.x.com ({msg})", file=sys.stderr)
            sys.exit(2)
        print(f"ERROR: {msg}", file=sys.stderr)
        sys.exit(1)

    for r in parse(data)[: args.limit]:
        print(json.dumps(r, ensure_ascii=False))


if __name__ == "__main__":
    main()
