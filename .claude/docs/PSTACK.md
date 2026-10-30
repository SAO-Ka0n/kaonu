# pstack (vendored)

`.claude/skills/` (except `social-search`), `.claude/agents/` and `.claude/docs/{guide,harness}` are a copy of
[pstack](https://github.com/cursor/plugins/tree/main/pstack) by Lauren Tan, MIT license (`PSTACK-LICENSE`).

- Source: `cursor/plugins` at commit `4dd1d05`, path `harness/pstack/claude-code` (plugin version 0.15.36)
- Why vendored: cloud sessions on claude.ai/code do not install plugins declared in `.claude/settings.json`,
  but they do load skills committed under `.claude/skills/`.
- Installed as project skills, commands have no `pstack:` prefix: use `/poteto-mode`, not `/pstack:poteto-mode`.
- `.claude/settings.json` denies the synced claude.ai skills that pstack replaces.

To update, copy `harness/pstack/claude-code/{skills,agents,docs}` from a newer `cursor/plugins` commit over these folders.
