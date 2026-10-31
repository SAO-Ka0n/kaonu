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

To get the same skills, agents, docs, `CLAUDE.md` rules and deny list in every project on your Mac:

```sh
git clone https://github.com/SAO-Ka0n/kaonu.git ~/kaonu && ~/kaonu/scripts/install-global.sh
```

To update later: `cd ~/kaonu && git pull && ./scripts/install-global.sh`.

The script copies `.claude/{skills,agents,docs}` into `~/.claude/`, writes the root `CLAUDE.md` rules into a
`<!-- kaonu-skills:start -->` block in `~/.claude/CLAUDE.md`, and adds the `permissions.deny` list to
`~/.claude/settings.json`. Re-running it changes nothing that is already current. Anything it replaces is moved
to `~/.claude/backups/kaonu-<timestamp>/` first. Other skills and settings are left alone.
