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

To update, copy the same folders from a newer upstream commit over these and update the table.
