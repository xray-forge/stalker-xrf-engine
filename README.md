# Stalker XRay-TS modding utilities
Enabling power of typescript for scripting and dynamic configuration.

## Starting work

### Pre-requirements
- NodeJS
- config.ini file should be edited, paths matched to your local system

### Startup
- npm install - install all the dependencies
- npm run build - build gamedata to the destination
- npm run link - link gamedata to the game folder
- npm run start_game - start game in debug mode and test changes

### Commands

#### NPM
- link - link target/gamedata folder and stalker folder for faster development
- unlink - unlink target/gamedata folder and stalker folder
- open_game_folder - open game folder in explorer
- start_game - start game with debug flag, admin permissions may be required
- build - build project gamedata with all assets
- build:clean - same as build, but cleans directory before emitting assets
- build_scripts - build dynamic/static scripts and configs
- format - reformat TS code and lint it
- lint - lint TS code with eslint utils
