#!/usr/bin/env python3
"""Search Instagram posts by hashtag via the official Instagram Graph API.

Needs env IG_ACCESS_TOKEN and IG_USER_ID (an Instagram business/creator account
connected to a Meta app). Meta allows 30 unique hashtags per 7 days per account.
Exit codes: 0 ok, 1 other error, 2 blocked by network policy, 3 missing token.
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

VERSION = os.environ.get("IG_GRAPH_VERSION", "v23.0")
BASE = f"https://graph.facebook.com/{VERSION}"
FIELDS = "id,caption,like_count,comments_count,permalink,timestamp,media_type"


def get(path, params):
    req = urllib.request.Request(BASE + path + "?" + urllib.parse.urlencode(params),
                                 headers={"User-Agent": "social-search-skill/1.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.load(resp)


def parse(data):
    rows = []
    for p in data.get("data", []):
        rows.append({
            "caption": (p.get("caption") or "").replace("\n", " ")[:200],
            "likes": p.get("like_count"),
            "comments": p.get("comments_count", 0),
            "type": p.get("media_type", ""),
            "date": p.get("timestamp", "")[:10],
            "url": p.get("permalink", ""),
        })
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("hashtag", help="one word, with or without #")
    ap.add_argument("--sort", default="top", choices=["top", "recent"])
    ap.add_argument("--limit", type=int, default=10)
    args = ap.parse_args()

    token, user_id = os.environ.get("IG_ACCESS_TOKEN"), os.environ.get("IG_USER_ID")
    if not token or not user_id:
        print("MISSING: env IG_ACCESS_TOKEN and IG_USER_ID must both be set", file=sys.stderr)
        sys.exit(3)

    tag = args.hashtag.lstrip("#").replace(" ", "").lower()
    try:
        found = get("/ig_hashtag_search", {"user_id": user_id, "q": tag, "access_token": token})
        if not found.get("data"):
            print(f"ERROR: hashtag #{tag} not found", file=sys.stderr)
            sys.exit(1)
        tag_id = found["data"][0]["id"]
        data = get(f"/{tag_id}/{args.sort}_media", {
            "user_id": user_id, "fields": FIELDS, "limit": min(args.limit, 50), "access_token": token,
        })
    except urllib.error.HTTPError as e:
        print(f"ERROR: Graph API returned HTTP {e.code}: {e.read()[:300].decode(errors='replace')}", file=sys.stderr)
        sys.exit(1)
    except urllib.error.URLError as e:
        msg = str(e)
        if "tunnel" in msg.lower():
            print(f"BLOCKED: network policy denied graph.facebook.com ({msg})", file=sys.stderr)
            sys.exit(2)
        print(f"ERROR: {msg}", file=sys.stderr)
        sys.exit(1)

    for r in parse(data):
        print(json.dumps(r, ensure_ascii=False))


if __name__ == "__main__":
    main()
