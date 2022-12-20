# [XRTS](../../README.md) / CLI / INFO

### Description

Prints project configuration information and list of available scripts.

### Example

- `npm run info`

### Example output

```text
> stalker-xrts-template@1.0.0 info
> ts-node -P ./cli/tsconfig.json cli/info/info.ts

23:23:38:661 [INFO] Current project info
23:23:38:674 [INFO] --------------------------------------
23:23:38:674 [INFO] Project name: stalker-xrts-template
23:23:38:674 [INFO] --------------------------------------
23:23:38:674 [INFO] Game folder: F:\Applications\Steam\steamapps\common\Stalker Call of Pripyat
23:23:38:674 [INFO] Game exe: Stalker-COP.exe
23:23:38:674 [INFO] --------------------------------------
23:23:38:674 [INFO] Target build folder: F:\Documents\Projects\stalker-xrts-template\target\gamedata
23:23:38:675 [INFO] Target build meta-info: F:\Documents\Projects\stalker-xrts-template\target\gamedata\metadata.json
23:23:38:675 [INFO] --------------------------------------
23:23:38:675 [INFO] Available scripts:
23:23:38:675 [INFO] npm run info
23:23:38:675 [INFO] npm run verify
23:23:38:675 [INFO] npm run link
23:23:38:675 [INFO] npm run unlink
23:23:38:675 [INFO] npm run engine
23:23:38:675 [INFO] npm run open_game_folder
23:23:38:676 [INFO] npm run start_game
23:23:38:676 [INFO] npm run build
23:23:38:676 [INFO] npm run build:clean
23:23:38:676 [INFO] npm run build:no-resources
23:23:38:676 [INFO] npm run build:resources-only
23:23:38:676 [INFO] npm run typecheck:lua
23:23:38:676 [INFO] npm run format
23:23:38:676 [INFO] npm run lint
23:23:38:676 [INFO] --------------------------------------
```
