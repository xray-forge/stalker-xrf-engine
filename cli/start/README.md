# [XRF](../../) / CLI / START_GAME

### Description

Open game exe file configured in `cli/config.json`. <br/>

Main goal is simple game testing after each rebuild / change.

With `--new` / `--load` game world is started from command line, so main menu, difficulty selection and save
picking are skipped and game is playable right after loading screen.

### Arguments

List of available arguments:

- `-n, --new` - start new game world instantly (`all` spawn), skipping main menu
- `-l, --load <save>` - load game save by name instantly, skipping main menu
- `-d, --difficulty <difficulty>` - game difficulty to use with instant start, one of
  `gd_novice`, `gd_stalker`, `gd_veteran`, `gd_master`; when not provided difficulty from `user.ltx` is used
- `--ni, --no-intro` - skip intro videos on instant start; note that new game intro also gives
  `zat_a1_tutorial_end` info portion, so skipping it is not fully matching normal new game start

### Example

- `npm run cli start_game`
- `npm run cli start_game -- --new`
- `npm run cli start_game -- --new --difficulty gd_master`
- `npm run cli start_game -- --load my_save`
