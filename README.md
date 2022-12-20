# 🎮 Stalker XRay-TS template

Enabling power of typescript for scripting and dynamic configuration.

## 📌What is used:

- [Typescript](https://www.typescriptlang.org/) to write custom scripts
- [TypeScriptToLua](https://typescripttolua.github.io/docs/getting-started) to compile typescript to lua
- [Open-X-Ray](https://github.com/OpenXRay/xray-16) to improve core game performance and APIs
- Custom build system to collect 'gamedata' mod packages
- Custom tools and JSX to emit XML files from typescript
- (todo) Custom tools to generate .ltx config files based on typescript files

## 📍 Purposes

Main goals of the project are:

- type safety
- unified tools for mod development
- automated builds steps and versioning system
- build-level globals to reduce amount of magical constants in codebase
- shared template for mods development
- documented code that can be used by others without searching forums from 2000s
- creating development tools to simplify life
- fun

---

## 🌓 Starting work

### 🧰 Pre-requirements

- [NodeJS](https://nodejs.org/en/)
- `cli/config.json` file should be edited, paths matched to your local system

### 💿 Start development

- DOWNLOAD the game (stalker call of pripyat)
- DOWNLOAD and INSTALL the latest release version of open x-ray
- EDIT `cli/config.json` - correct paths to match your local system
- RUN `cd stalker-xrts-modding` - cd to project folder
- RUN `npm install` - install all the dependencies
- RUN `npm run link` - link gamedata to the game folder
- RUN `npm run build` - build gamedata to the destination
- RUN `npm run engine use release` - link open xray with game
- RUN `npm run start_game` - start game in debug mode and test changes

### 🧰 Check issues

`$ npm run verify` - will check whether project is setup and ready to start developing

## 🛠 Commands

### NPM

`$ npm run COMMAND_NAME`

- [info](cli/info/README.md) - print general information about project and configuration
- [verify](cli/verify/README.md) - verify project settings and readiness
- [link](cli/link/README.md) - link target/gamedata and logs folder and stalker folder for faster development
- [unlink](cli/build/README.md) - unlink target/gamedata and logs folder and stalker folder
- [engine](cli/build/README.md) - engine management commands to use open-xray
- [open_game_folder](cli/build/README.md) - open game folder in explorer
- [start_game](cli/build/README.md) - start game with debug flag
- [build](cli/build/README.md) - build project gamedata with all assets
- [build:clean](cli/build/README.md) - same as build, but with `--clean` flag
- `format` - reformat TS code and lint it
- `lint` - lint TS code with eslint utils

## 🧰 Developing

### 🧰 Typescript

Typescript to lua compilation does not do tree shaking and has its specifics. <br/>

- To prevent bloated codebase avoid index files usage and re-exporting
- Do not use window/dom/document/global APIs in lua scripts / shared mod libs, they are not transpiled to Lua

### 🧰 gamedata folder structure

todo: Describe structure of gamedata and intention of every folder

### 🧰 project folder structure

todo: Describe structure of src and intention of every folder

- [bin](bin/README.md)
- [cli](cli/README.md)
  - [build](cli/build/README.md)
  - [engine](cli/engine/README.md)
  - [info](cli/info/README.md)
  - [link](cli/link/README.md)
  - [open_game_folder](cli/open_game_folder/README.md)
  - [start_game](cli/start_game/README.md)
  - [utils](cli/utils/README.md)
  - [verify](cli/verify/README.md)
- [src](src/README.md)
  - [mod](src/mod/README.md)
  - [resources](src/resources/README.md)
  - [typedefs](src/typedefs/README.md)

### 🧰 x-ray SDK / global type declarations

To use typescript together with xray SDK you will need correct type declarations.

- [xray 16 typedefs](src/typedefs/xray16)
  - [xray ui](src/typedefs/xray16/c_ui)
  - [xray core](src/typedefs/xray16/c_core)
  - [xray constants](src/typedefs/xray16/c_constants.d.ts)
- [LuaJIT typedefs](src/typedefs/luaJIT.d.ts)

### 🧰 Custom forms and windows

Notes:

- When creating forms with xml, here we use [JSX](https://www.typescriptlang.org/docs/handbook/jsx.html)
- When mod compilation happens we transform JSX into valid XML files
- All coordinates with (x, y) are based on parent (not XML child, rather script register parent) and are not absolute

### 🧰 Code style

For code style unification and validation prettier and eslint are used. <br/>
Line endings are set to CRLF to match windows system.
