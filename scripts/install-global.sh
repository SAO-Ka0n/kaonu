#!/usr/bin/env bash
# Installs this repo's Claude Code skill setup into ~/.claude so it applies in every project.
# Safe to re-run: anything already identical is left alone, anything replaced is backed up first.
set -euo pipefail

SRC="$(cd "$(dirname "$0")/.." && pwd -P)"
DEST="$HOME/.claude"
# Paths under .claude/, each copied as a whole unit. Other entries in ~/.claude are never touched.
ITEMS='skills/* agents/*.md docs/*'

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

# A rules file, not ~/.claude/CLAUDE.md, which other runtimes share and this script must never edit.
rules_new="$TMP/kaonu-skills.md"
sed -E 's#(^|[^/])\.claude/(skills|docs)/#\1~/.claude/\2/#g' "$SRC/CLAUDE.md" > "$rules_new"
install_item "$rules_new" rules/kaonu-skills.md
rules_status="$STATUS"

# Writes the merged settings to argv[3] and prints "deny <count>" or "plugin <name> <value>" lines, only when something changes.
PY='
import json, sys
src, dst, out = sys.argv[1:4]
with open(src, encoding="utf-8") as f:
    want = json.load(f)
try:
    with open(dst, encoding="utf-8") as f:
        cur = json.load(f)
except FileNotFoundError:
    cur = {}
changes = []
deny = cur.setdefault("permissions", {}).setdefault("deny", [])
add = [d for d in want["permissions"]["deny"] if d not in deny]
if add:
    deny.extend(add)
    changes.append("deny %d" % len(add))
for name, value in want.get("enabledPlugins", {}).items():
    plugins = cur.setdefault("enabledPlugins", {})
    if name not in plugins or plugins[name] != value:
        plugins[name] = value
        changes.append("plugin %s %s" % (name, json.dumps(value)))
if changes:
    with open(out, "w", encoding="utf-8") as f:
        json.dump(cur, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print("\n".join(changes))
'
JS='
const fs = require("fs");
const [src, dst, out] = process.argv.slice(1);
const want = JSON.parse(fs.readFileSync(src, "utf8"));
const cur = fs.existsSync(dst) ? JSON.parse(fs.readFileSync(dst, "utf8")) : {};
const changes = [];
cur.permissions = cur.permissions || {};
const deny = (cur.permissions.deny = cur.permissions.deny || []);
const add = want.permissions.deny.filter((d) => !deny.includes(d));
if (add.length) {
  deny.push(...add);
  changes.push(`deny ${add.length}`);
}
for (const [name, value] of Object.entries(want.enabledPlugins || {})) {
  const plugins = (cur.enabledPlugins = cur.enabledPlugins || {});
  if (plugins[name] !== value) {
    plugins[name] = value;
    changes.push(`plugin ${name} ${JSON.stringify(value)}`);
  }
}
if (changes.length) {
  fs.writeFileSync(out, JSON.stringify(cur, null, 2) + "\n");
  process.stdout.write(changes.join("\n") + "\n");
}
'
settings_src="$SRC/.claude/settings.json"
settings_new="$TMP/settings.json"
merge_settings() {
  if command -v python3 >/dev/null 2>&1; then python3 -I -c "$PY" "$@"; else node -e "$JS" "$@"; fi
}
if ! command -v python3 >/dev/null 2>&1 && ! command -v node >/dev/null 2>&1; then
  settings_status=manual
elif ! settings_changes="$(merge_settings "$settings_src" "$DEST/settings.json" "$settings_new")"; then
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
case "$rules_status" in
  same) echo "rules/kaonu-skills.md: 변경 없음" ;;
  *) echo "rules/kaonu-skills.md: 규칙을 썼습니다 ($DEST/CLAUDE.md 는 건드리지 않습니다)" ;;
esac
case "$settings_status" in
  same) echo "settings.json: 변경 없음" ;;
  failed) echo "settings.json: $DEST/settings.json 을 읽지 못해 건드리지 않았습니다. JSON 형식을 확인하세요." ;;
  manual)
    echo "settings.json: python3 와 node 가 없어 자동으로 합치지 못했습니다."
    echo "  $DEST/settings.json 의 permissions.deny 에 아래 항목을 직접 추가하세요:"
    sed -n '/"deny"/,/\]/p' "$settings_src"
    echo "  enabledPlugins 에는 아래 값을 직접 넣으세요:"
    sed -n '/"enabledPlugins"/,/}/p' "$settings_src"
    ;;
  *)
    echo "$settings_changes" | while read -r kind name value; do
      case "$kind:$value" in
        deny:*) echo "settings.json: permissions.deny 에 ${name}개 항목을 추가했습니다" ;;
        plugin:false) echo "settings.json: 겹치는 플러그인 $name 을 껐습니다" ;;
        plugin:*) echo "settings.json: 플러그인 $name 을 $value 로 맞췄습니다" ;;
      esac
    done
    ;;
esac
if [ -d "$BACKUP" ]; then echo "백업: $BACKUP"; fi
echo
echo "새 Claude Code 세션을 여세요. 처음 한 번 /setup-pstack 을 실행하세요."
