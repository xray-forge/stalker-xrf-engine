# 🎮 [Stalker XR-TS template](README.md)

Enabling power of typescript for mods creation. <br/>

## 📌What is used

- [Typescript](https://www.typescriptlang.org/) and [ts-node](https://typestrong.org/ts-node/) for scripting
- [TypeScriptToLua](https://typescripttolua.github.io/docs/getting-started) for transpiling to LUA
- [Open-X-Ray](https://github.com/OpenXRay/xray-16) for better core game performance and APIs
- Custom [build system](cli/README.md) for `gamedata` building
- Custom tools and JSX for XML files generation

## 📍 Purposes

Main goals of the project are:

- type safety
- unified development tools
- automated builds and versioning system
- build-level globals and better build control
- shared template for mods development
- documented code and readable code
- simplification
- fun

---

## 🥦 Main differences with original

Intention is to create base template without breaking changes to the original game.

- Game codebase is unified and refactored with typescript
- Separate verification and preparation steps added instead of direct ltx/xml/script files editing
- Tools added for easier debugging and development, turned off for release versions of mods

# 🌓 Starting work

## 🧰 Pre-requirements

- [NodeJS](https://nodejs.org/en/)
- [Stalker-COP](https://store.steampowered.com/app/41700/STALKER_Call_of_Pripyat/)
- `cli/config.json` file should be edited, paths matched to your local system

## 💿 Start development

- DOWNLOAD the game (stalker call of pripyat)
- EDIT `cli/config.json` - correct paths to match your local system
- RUN `cd stalker-xrts-template` - cd to project folder
- RUN `npm install` - install all the dependencies
- RUN `npm run link` - link gamedata to the game folder
- RUN `npm run build` - build gamedata to the destination
- RUN `npm run engine use release` - link open xray with game
- RUN `npm run start_game` - start game and test changes

## 🧰 Check issues

`$ npm run verify` - will check whether project is set up and ready to start developing

# 🧰 Developing

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

## 🏗️ Code style

For code style unification and validation prettier and eslint are used. <br/>
Line endings are set to CRLF to match windows system.

## 🧰 Typescript

Core of this project is [TypeScriptToLua](https://github.com/TypeScriptToLua/TypeScriptToLua). <br/>
Even if you see simple typescript, in does not mean that it will work as javascript in all cases. It has some specifics.

---

- Typescript to lua compilation does not do tree shaking
- Use LuaTable/LuaMap classes where possible, avoid inline JS arrays and objects
- To prevent bloated codebase avoid index files usage and re-exporting
- Do not use window/dom/document/global APIs in lua scripts / shared mod libs, they are not transpiled to Lua

---

To work correctly with conflicting keywords and luabind classes custom utils are provided:

- Build [plugin](cli/build/plugins) to support keyword `super` as `xr_class_super`
- `lua_globals.script` and `_g.script` to supply global functions that can be used from global context by typescript
- Custom [typedefs](src/typedefs) to support functions call from Lua global context (xray engine, lua libs)

---

## 🏗️ Typedefs

To use X-Ray engine globals direct import from "xray16" nodule required. <br/>
After transpiling process import statements will be stripped and transformed to globals.

- [XRay typedefs](src/typedefs/xray16)

  - [xray core](src/typedefs/xray16/c_core)
  - [xray game objects](src/typedefs/xray16/c_game_objects)
  - [xray logic](src/typedefs/xray16/c_logic)
  - [xray ui](src/typedefs/xray16/c_ui)
  - [xray constants](src/typedefs/xray16/c_constants.d.ts)
  - [xray global](src/typedefs/xray16/c_global.d.ts)
  - [xray utils](src/typedefs/xray16/c_utils.d.ts)

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

## 🏗️ Development utils

[Can be checked here.](UTILS.md)

## 🧰 Main todos

- Move remaining logic and codebase to typescript
- After migration consider simplification and unification of some parts
- Finish LTX generation tools
- Finish translation generation tools
- Create electron application to simplify development of dialogs, labels, translations, asset management etc
- Scripts to unpack raw_gamedata for observation / usage
- Script to verify integrity of assets and defined constants
- Screenshots of some tools
- Declare luaBind classes with TSTL plugin?
- Rework acdc perl script and add all.spawn editing utils
- Unit tests and mocks?
