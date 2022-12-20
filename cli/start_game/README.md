# [XRTS](../../README.md) / CLI / START_GAME

### Description

Open game exe file configured in `cli/config.json`. <br/>

Main goal is simple game testing after each rebuild / change.

### Example

- `npm run start_game`

### Example output

```text
> stalker-xrts-template@1.0.0 start_game
> ts-node -P ./cli/tsconfig.json cli/start_game/start_game.ts

00:03:41:323 [START_GAME] Starting game
00:03:41:336 [START_GAME] Starting game exe: "F:\Applications\Steam\steamapps\common\Stalker Call of Pripyat\Stalker-COP.exe"
00:03:41:354 [START_GAME] Failed to start process: null
```
