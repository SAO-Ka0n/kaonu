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

## Using this outside this repo (local machine)

Copy `.claude/skills`, `.claude/agents` and `.claude/docs` into `~/.claude/` (keep the same layout so the
`../../docs` links resolve), and put the rules from `CLAUDE.md` into `~/.claude/CLAUDE.md` with paths changed
to `~/.claude/skills/`. Deny rules only apply where they are written, so copy the `permissions.deny` list into
`~/.claude/settings.json` or turn those skills off in claude.ai skill settings.

To update, copy the same folders from a newer upstream commit over these and update the table.
