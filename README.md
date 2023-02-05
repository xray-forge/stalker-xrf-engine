# 🎮 [Stalker XR-TS template](README.md)

Enabling power of typescript for mods creation. <br/>

## 📌What is used

- [Typescript](https://www.typescriptlang.org/)
- [Ts-node](https://typestrong.org/ts-node/)
- [TypeScriptToLua](https://typescripttolua.github.io/docs/getting-started)
- [Open-X-Ray](https://github.com/OpenXRay/xray-16)
- Custom [build system](cli/README.md)

## 📍 Purposes

Main goals:

- type safety
- unified development tools
- automated builds and versioning system
- shared template for mods development
- documented and readable code
- simplification

---

## 🥦 Main differences with original

Intention is to create template without introducing breaking changes to the original game plot.

- Game codebase is refactored with typescript
- Separate verification and preparation steps added
- Tools added for easier debugging and development

# 🌓 Starting work

## 🧰 Pre-requirements

- [NodeJS](https://nodejs.org/en/)
- [Stalker-COP](https://store.steampowered.com/app/41700/STALKER_Call_of_Pripyat/)
- `cli/config.json` file should be edited to match your local system

## 💿 Start development

- DOWNLOAD the game (stalker call of pripyat)
- EDIT `cli/config.json` - correct paths to match your local system
- RUN `cd stalker-xrts-template` - cd to project folder
- RUN `npm install` - install all the dependencies
- RUN `npm run link` - link gamedata to the game folder
- RUN `npm run engine use release` - link open xray with game
- RUN `npm run build:clean` - build gamedata to the destination
- RUN `npm run start_game` - start game and test changes

## 🧰 Check issues

`$ npm run verify` - will check whether project is set up and ready to start developing

# 🧰 Development

## 🏗️ Project commands

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

## 🏗️ Codestyle

For code style unification and validation prettier and eslint are used. <br/>
Line endings are set to CRLF to match windows system.

## 🧰 Typescript

Core of this project is [TypeScriptToLua](https://github.com/TypeScriptToLua/TypeScriptToLua). <br/>

---

To work correctly with conflicting keywords and luabind classes custom utils are provided:

- `lua_globals.script` and `_g.script` to supply global functions that can be used from global context by typescript
- Custom [typedefs](src/typedefs) to support functions call from Lua global context (xray engine, lua libs)

---

## 🏗️ Typedefs

To use X-Ray engine globals direct import from "xray16" nodule required. <br/>
After transpiling process import statements will be stripped and transformed to globals.

- [XRay typedefs](src/typedefs/xray16)
- [Lua](https://www.npmjs.com/package/lua-types)
- [TSTL language extension](https://www.npmjs.com/package/@typescript-to-lua/language-extensions)

For types correction and validation: [Open X-Ray source code](https://github.com/OpenXRay/xray-16)

---

## 🏗️ Mod gamedata folder structure

todo: Describe structure of gamedata and intention of every folder

- `ai`
- `anims`
- `configs`
- `levels`
- `meshes`
- `scripts`
- `shaders`
- `sounds`
- `spawns`
- `textures`

## 🧰 Project structure

- [bin](bin/README.md)
- [cli](cli/README.md)
  - [build](cli/build/README.md)
  - [engine](cli/engine/README.md)
  - [info](cli/info/README.md)
  - [link](cli/link/README.md)
  - [logs](cli/logs/README.md)
  - [open_game_folder](cli/open/README.md)
  - [preview](cli/preview/README.md)
  - [start_game](cli/start_game/README.md)
  - [utils](cli/utils/README.md)
  - [verify](cli/verify/README.md)
- [src](src/README.md)
  - [mod](src/mod/README.md)
    - [configs](src/mod/cfg_b/README.md)
    - [globals](src/mod/globals/README.md)
    - [lib](src/mod/lib/README.md)
    - [scripts](src/mod/scripts/README.md)
    - [translations](src/mod/translations/README.md)
    - [ui](src/mod/ui/README.md)
  - [resources](src/resources/README.md)
  - [typedefs](src/typedefs/README.md)
- [target](target/README.md)

## 🧰 Custom forms and UI

Notes:

- When creating forms, use [JSX](https://www.typescriptlang.org/docs/handbook/jsx.html)
- When mod compilation happens, JSX is transformed to valid XML
- All coordinates with (x, y) are based on 'attach' parent (not XML child, rather script register parent) and related
- Use `preview` command to preview forms and develop faster, example: `npm run preview menu`

For examples check: `src/mod/ui`.

## ️️🏗️ Debugging game

After following steps you will be able to attach debugger to lua/c++ code:

 - Download visual studio
 - Install [LUA debug](https://github.com/WheretIB/LuaDkmDebugger) extension for visual studio (fixes [A](https://github.com/WheretIB/LuaDkmDebugger/pull/25) + [B](https://github.com/WheretIB/LuaDkmDebugger/pull/26) required)
 - Setup engine project, follow [OpenXray](https://github.com/OpenXRay/xray-16/wiki/%5BEN%5D-How-to-build-and-setup-on-Windows) instructions
 - Link game (npm run link) and target folder of xrts
 - Run game in debug mode directly from visual studio

Note: attach breakpoint and observe transpiled LUA code. There is no way to debug typescript directly.

## 🧰 Development utils

[Can be checked here.](UTILS.md)
