# Vendored skills

Cloud sessions on claude.ai/code do not install plugins declared in `.claude/settings.json`, but they do load
skills committed under `.claude/skills/`. So third-party skills are copied here instead of installed as plugins.
Installed as project skills, commands have no plugin prefix (`/poteto-mode`, not `/pstack:poteto-mode`).

| Source | Commit | What was copied | License |
|---|---|---|---|
| [pstack](https://github.com/cursor/plugins/tree/main/pstack) (Lauren Tan) | `cursor/plugins@4dd1d05`, v0.15.36 | `harness/pstack/claude-code/{skills,agents,docs}` → `.claude/{skills,agents,docs}` | MIT, `PSTACK-LICENSE` |
| [Matt Pocock skills](https://github.com/mattpocock/skills) | `mattpocock/skills@a496f55` | `grill-me`, `grilling`, `grill-with-docs`, `to-spec`, `to-tickets`, `triage`, `setup-matt-pocock-skills` | MIT, `MATT-POCOCK-SKILLS-LICENSE` |
| [Compound Engineering](https://github.com/EveryInc/compound-engineering-plugin) (Every) | `EveryInc/compound-engineering-plugin@f1b2499` | `ce-compound`, `ce-compound-refresh` | MIT, `COMPOUND-ENGINEERING-LICENSE` |

`social-search` is our own skill.

## Notes

- Matt's `to-spec`, `to-tickets` and `triage` need `/setup-matt-pocock-skills` once. Cloud sessions have no `gh` CLI,
  so pick the local (markdown) issue tracker there.
- Left out on purpose: skills that duplicate pstack, and Compound's PR skills (`ce-babysit-pr`,
  `ce-resolve-pr-feedback`), which depend on the `gh` CLI and on other Compound skills.
- `.claude/settings.json` denies the claude.ai synced skills that pstack replaces.
- The root `CLAUDE.md` routes every request through poteto-mode, so the flow starts from a plain chat message.
  Most pstack and Matt skills set `disable-model-invocation: true`, so `CLAUDE.md` tells Claude to read their
  `SKILL.md` instead of calling them with the Skill tool.

To update the vendored copies, copy the same folders from a newer upstream commit over these and update the table.

## 다른 프로젝트에서도 쓰기 (맥북 로컬)

To get the same skills, agents, docs, rules, deny list and plugin settings in every project on your Mac:

```sh
git clone https://github.com/SAO-Ka0n/kaonu.git ~/kaonu && ~/kaonu/scripts/install-global.sh
```

To update later: `cd ~/kaonu && git pull && ./scripts/install-global.sh`.

The script copies `.claude/{skills,agents,docs}` into `~/.claude/` and writes the root `CLAUDE.md` rules, with paths
pointed at `~/.claude/`, to `~/.claude/rules/kaonu-skills.md`. Claude Code loads that file in every project. The file says
pstack wins over any conflicting instruction, because user rules and `CLAUDE.md` files do not override each other on
their own. The script never modifies `~/.claude/CLAUDE.md`, which other runtimes may share. In
`~/.claude/settings.json` it adds the `permissions.deny` list and sets the repo's `enabledPlugins` entries, which
disable the plugins that overlap pstack (`superpowers`, `ponytail`, `feature-dev`). Other plugins and settings are
left alone. Re-running it changes nothing that is already current. Anything it replaces is moved to
`~/.claude/backups/kaonu-<timestamp>/` first.

Let local Claude do it. Paste this into Claude Code on the Mac:

```text
~/kaonu가 없으면 https://github.com/SAO-Ka0n/kaonu.git 을 ~/kaonu로 clone하고, 있으면 git pull 한 뒤 ~/kaonu/scripts/install-global.sh 를 실행해. 출력 결과를 그대로 보여줘.
```
