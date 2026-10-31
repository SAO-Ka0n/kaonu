#!/usr/bin/env python3
"""Search Reddit posts via the official API with an app-only OAuth token.

Needs env REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET (a "script" app from reddit.com/prefs/apps).
Exit codes: 0 ok, 1 other error, 2 blocked by network policy, 3 missing credentials.
"""
import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

UA = "script:social-search-skill:1.0"
TOKEN_URL = "https://www.reddit.com/api/v1/access_token"


def fetch(req, host):
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as e:
        print(f"ERROR: {host} returned HTTP {e.code}: {e.read()[:300].decode(errors='replace')}", file=sys.stderr)
        sys.exit(1)
    except urllib.error.URLError as e:
        msg = str(e)
        if "tunnel" in msg.lower():
            print(f"BLOCKED: network policy denied {host} ({msg})", file=sys.stderr)
            sys.exit(2)
        print(f"ERROR: {msg}", file=sys.stderr)
        sys.exit(1)


def get_token(client_id, client_secret):
    basic = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
    req = urllib.request.Request(
        TOKEN_URL,
        data=urllib.parse.urlencode({"grant_type": "client_credentials"}).encode(),
        headers={"Authorization": f"Basic {basic}", "User-Agent": UA},
    )
    data = fetch(req, "www.reddit.com")
    if "access_token" not in data:
        print(f"ERROR: no access_token in reddit response: {json.dumps(data)[:300]}", file=sys.stderr)
        sys.exit(1)
    return data["access_token"]


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

    client_id = os.environ.get("REDDIT_CLIENT_ID")
    client_secret = os.environ.get("REDDIT_CLIENT_SECRET")
    if not client_id or not client_secret:
        print("MISSING: env REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET is not set", file=sys.stderr)
        sys.exit(3)
    token = get_token(client_id, client_secret)

    base = f"https://oauth.reddit.com/r/{args.subreddit}/search" if args.subreddit else "https://oauth.reddit.com/search"
    params = {"q": args.query, "sort": args.sort, "t": args.time, "limit": min(args.limit, 100)}
    if args.subreddit:
        params["restrict_sr"] = "1"
    req = urllib.request.Request(
        base + "?" + urllib.parse.urlencode(params),
        headers={"Authorization": f"Bearer {token}", "User-Agent": UA},
    )

    for r in parse(fetch(req, "oauth.reddit.com")):
        print(json.dumps(r, ensure_ascii=False))


if __name__ == "__main__":
    main()
