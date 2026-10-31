#!/usr/bin/env bash
# Installs this repo's Claude Code skill setup into ~/.claude so it applies in every project.
# Safe to re-run: anything already identical is left alone, anything replaced is backed up first.
set -euo pipefail

SRC="$(cd "$(dirname "$0")/.." && pwd -P)"
DEST="$HOME/.claude"
# Paths under .claude/, each copied as a whole unit. Other entries in ~/.claude are never touched.
ITEMS='skills/* agents/*.md docs/*'
START='<!-- kaonu-skills:start -->'
END='<!-- kaonu-skills:end -->'

BACKUP="$DEST/backups/kaonu-$(date +%Y%m%d-%H%M%S)"
if [ -e "$BACKUP" ]; then BACKUP="$BACKUP-$$"; fi
NEW=0
UPDATED=0
SAME=0
UPDATED_LIST=''
STATUS=''

[ -d "$SRC/.claude/skills" ] || { echo "오류: $SRC/.claude/skills 가 없습니다." >&2; exit 1; }
mkdir -p "$DEST"
TMP="$(mktemp -d "$DEST/.kaonu-tmp.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT

# Makes $DEST/<rel> identical to <src>; sets STATUS to new, updated or same.
install_item() {
  local src="$1" rel="$2" dst="$DEST/$2"
  if [ -e "$dst" ] && diff -r -q "$src" "$dst" >/dev/null 2>&1; then
    STATUS=same; SAME=$((SAME + 1)); return
  fi
  if [ -e "$dst" ] || [ -L "$dst" ]; then
    mkdir -p "$(dirname "$BACKUP/$rel")"
    mv "$dst" "$BACKUP/$rel"
    STATUS=updated; UPDATED=$((UPDATED + 1)); UPDATED_LIST="$UPDATED_LIST $rel"
  else
    STATUS=new; NEW=$((NEW + 1))
  fi
  mkdir -p "$(dirname "$dst")"
  cp -R "$src" "$dst"
}

cd "$SRC/.claude"
# shellcheck disable=SC2086 # ITEMS is a list of globs relative to .claude/
for rel in $ITEMS; do
  [ -e "$rel" ] || { echo "오류: $SRC/.claude/$rel 가 없습니다." >&2; exit 1; }
  install_item "$SRC/.claude/$rel" "$rel"
done

block="$TMP/block"
{
  echo "$START"
  sed -E 's#(^|[^/])\.claude/(skills|docs)/#\1~/.claude/\2/#g' "$SRC/CLAUDE.md"
  echo "$END"
} > "$block"
md="$DEST/CLAUDE.md"
md_new="$TMP/CLAUDE.md"
start_line=''
if [ -f "$md" ]; then start_line="$(awk -v m="$START" '$0 == m { print NR; exit }' "$md")"; fi
if [ -n "$start_line" ]; then
  end_line="$(awk -v m="$END" -v s="$start_line" 'NR > s && $0 == m { print NR; exit }' "$md")"
  [ -n "$end_line" ] || { echo "오류: $md 에 '$START' 는 있는데 '$END' 가 없습니다. 직접 고친 뒤 다시 실행하세요." >&2; exit 1; }
  # tail, not awk, so a missing final newline after the block survives byte-for-byte.
  { awk -v s="$start_line" 'NR < s' "$md"; cat "$block"; tail -n "+$((end_line + 1))" "$md"; } > "$md_new"
elif [ -s "$md" ]; then
  { cat "$md"; if [ -n "$(tail -c 1 "$md")" ]; then echo; fi; echo; cat "$block"; } > "$md_new"
else
  cp "$block" "$md_new"
fi
install_item "$md_new" CLAUDE.md
md_status="$STATUS"

PY='
import json, sys
src, dst = sys.argv[1], sys.argv[2]
with open(src, encoding="utf-8") as f:
    want = json.load(f)["permissions"]["deny"]
try:
    with open(dst, encoding="utf-8") as f:
        cur = json.load(f)
except FileNotFoundError:
    cur = {}
deny = cur.setdefault("permissions", {}).setdefault("deny", [])
add = [d for d in want if d not in deny]
if add:
    deny.extend(add)
    json.dump(cur, sys.stdout, indent=2, ensure_ascii=False)
    print()
'
JS='
const fs = require("fs");
const [src, dst] = process.argv.slice(1);
const want = JSON.parse(fs.readFileSync(src, "utf8")).permissions.deny;
const cur = fs.existsSync(dst) ? JSON.parse(fs.readFileSync(dst, "utf8")) : {};
cur.permissions = cur.permissions || {};
const deny = (cur.permissions.deny = cur.permissions.deny || []);
const add = want.filter((d) => !deny.includes(d));
if (add.length) {
  deny.push(...add);
  process.stdout.write(JSON.stringify(cur, null, 2) + "\n");
}
'
settings_src="$SRC/.claude/settings.json"
settings_new="$TMP/settings.json"
merge_deny() {
  if command -v python3 >/dev/null 2>&1; then python3 -I -c "$PY" "$@"; else node -e "$JS" "$@"; fi
}
if ! command -v python3 >/dev/null 2>&1 && ! command -v node >/dev/null 2>&1; then
  settings_status=manual
elif ! merge_deny "$settings_src" "$DEST/settings.json" > "$settings_new"; then
  settings_status=failed
elif [ -s "$settings_new" ]; then
  install_item "$settings_new" settings.json
  settings_status="$STATUS"
else
  settings_status=same
fi

echo
echo "설치 위치: $DEST (원본: $SRC)"
echo "항목: 새로 설치 $NEW개, 갱신 $UPDATED개, 그대로 $SAME개"
if [ -n "$UPDATED_LIST" ]; then echo "갱신한 항목:$UPDATED_LIST"; fi
case "$md_status" in
  same) echo "CLAUDE.md: 변경 없음" ;;
  *) echo "CLAUDE.md: kaonu-skills 블록을 썼습니다" ;;
esac
case "$settings_status" in
  same) echo "settings.json: 변경 없음" ;;
  failed) echo "settings.json: $DEST/settings.json 을 읽지 못해 건드리지 않았습니다. JSON 형식을 확인하세요." ;;
  manual)
    echo "settings.json: python3 와 node 가 없어 자동으로 합치지 못했습니다."
    echo "  $DEST/settings.json 의 permissions.deny 에 아래 항목을 직접 추가하세요:"
    sed -n '/"deny"/,/\]/p' "$settings_src"
    ;;
  *) echo "settings.json: permissions.deny 항목을 추가했습니다" ;;
esac
if [ -d "$BACKUP" ]; then echo "백업: $BACKUP"; fi
echo
echo "새 Claude Code 세션을 여세요. 처음 한 번 /setup-pstack 을 실행하세요."
