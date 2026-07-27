# [XRF](../../../) / ENGINE / CHECKS

On-demand in-game checks for behavior that unit tests cannot cover: Lua, INI parsing, tasks, and engine bindings.
They are excluded from the normal build and enter gamedata only after an explicit build.

| Kind  | Source       | Purpose                                            |
| ----- | ------------ | -------------------------------------------------- |
| Check | `*.check.ts` | Sets up and verifies isolated behavior in one run. |
| Flow  | `*.flow.ts`  | Observes an ordered game progression across saves. |

Flows do not change quest state. They verify each reached step, stop at the first pending one, and preserve progress in
the actor save. Load an earlier save to observe a flow again.

## Writing checks

Source files declare themselves at module scope and import from `@/engine/checks/framework`.

- Use `requires`, `beforeAll`, and `it` for a check.
- Use `requires` and ordered `step` calls for a flow. Each step needs `reached`; `verify`, `travel`, and `handOff` are
  optional.

## Commands

```text
npm run cli checks list
npm run cli checks build
npm run cli checks clean
npm run typecheck:checks
```

After building, run a launcher from the game console:

```text
run_script check_<name>
run_script flow_<name>
run_script check_all
```

Use the `mixed` or `release` engine variant and load a level first. `check_all` runs checks only; flows are excluded.
