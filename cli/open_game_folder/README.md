## [XRTS](../../README.md) / CLI / OPEN_GAME_FOLDER

### Description

Open game folder configured in `cli/config.json`. <br/>
Uses explorer of operating system.

Main goal is simple access to the engine assets.

### Example

- `npm run open_game_folder`

### Example output

```text
> stalker-xrts-template@1.0.0 open_game_folder
> ts-node -P ./cli/tsconfig.json cli/open_game_folder/open_game_folder.ts

00:03:14:016 [OPEN_GAME_FOLDER] Opening game folder
00:03:14:028 [OPEN_GAME_FOLDER] Open system explorer in: F:\Applications\Steam\steamapps\common\Stalker Call of Pripyat
```
