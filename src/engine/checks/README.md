# [XRF](../../../) / ENGINE / CHECKS

### Description

On demand in-game checks. <br/>

Checks verify behaviour unit tests cannot reach: real Lua semantics, the real ini reader, the real
task manager and the real engine bindings. They are deliberately excluded from the regular script
build, so nothing here affects `npm run build` or `npm run watch:scripts` timings, and no check code
exists in gamedata until it is explicitly built.

There are two kinds:

| kind  | source       | console                   | lifecycle                                        |
| ----- | ------------ | ------------------------- | ------------------------------------------------ |
| check | `*.check.ts` | `run_script check_<name>` | runs to completion in a single invocation        |
| flow  | `*.flow.ts`  | `run_script flow_<name>`  | one step per invocation, cursor kept in the save |

A check establishes every precondition itself, so it reaches the same conclusion on any save. A flow
is semi-manual: an invocation arms one step, you play, and running the launcher again advances to the
next one. Progression is driven by re-running the command, so the whole chain is walked by repeating
it; each step's `advanceWhen` is asserted on the way out rather than waited for, and reports a
failure when the expected state was not reached. Use a check to prove a gate in isolation, and a flow
when the thing worth verifying is the progression itself, including the parts only real play
produces.

### Commands

- `npm run cli checks list` - print checks and flows with the console command for each
- `npm run cli checks build` - transpile both into gamedata and emit console launchers
- `npm run cli checks clean` - remove all check and flow artifacts from gamedata
- `npm run typecheck:checks` - typecheck this directory, not covered by `npm run typecheck`

### Running

Both kinds are triggered from the game console:

```
run_script check_quests_zat_b29
run_script flow_quests_zat_b29
run_script flow_quests_zat_b29_reset
```

Notes:

- Requires the `mixed` or `release` engine variant. `run_script` and `run_string` are compiled out
  of `gold` builds by `MASTER_GOLD`, and so is the `log` binding output goes through. Switch with
  `npm run cli engine use mixed`.
- A level must be loaded. The console command targets the level script processor, so nothing happens
  at the main menu. Flows additionally need the actor registered, since the cursor lives on it.
- `run_script` supports tab completion, so `run_script check_` and `run_script flow_` list what is
  available.
- Execution is deferred by a frame. `run_script X` queues the script, and the level script process
  loads it on its next update, so output appears a frame after the command rather than during it.
- Rebuilding does not need a game restart. Launchers clear `package.loaded` for their module, and
  `run_script` reloads the launcher itself, so the next invocation always runs freshly built code.
- `npm run build -c` wipes gamedata, which removes these artifacts. Re-run `checks build` afterwards.
  A plain `npm run build` leaves them in place.
