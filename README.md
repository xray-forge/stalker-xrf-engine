# 🎮 [Stalker XR-TS template](README.md)

<sub> Enabling power of typescript for mods creation. </sub>

<p>
XRTS template for STALKER provides a solid foundation for creating mods that are more maintainable,
efficient, and easier to develop. The template uses TypeScript and custom build tools to ensure type safety,
unified development tools, automated builds and versioning systems, and a shared template for mods development.
</p>

<p>
With documented and readable code, the mod template simplifies the development process and streamlines
the creation of complex STALKER mods.
</p>

## 📍 Purpose

- Ensure type safety
- Provide unified development tools
- Enable automated builds and versioning system
- Provide a shared template for mods development
- Produce documented and readable code
- Simplify the development process

---

## 📦 Main differences with original

The intention of this mod template is to allow easier mod development without introducing breaking changes to the original. <br/>
Everything else can be added in your own mod.

- Game codebase is refactored with TypeScript
- Separate verification and preparation steps have been added
- Tools have been added to make debugging and development easier

## 📌What is used

- [Typescript](https://www.typescriptlang.org/)
- [Ts-node](https://typestrong.org/ts-node/)
- [TypeScriptToLua](https://typescripttolua.github.io/docs/getting-started)
- [Open-X-Ray](https://github.com/OpenXRay/xray-16)
- Custom [build system](cli/README.md)

# 🌓 Starting work

## 🧰 Pre-requirements

- [NodeJS](https://nodejs.org/en/) 14 or later
- [Stalker-COP](https://store.steampowered.com/app/41700/STALKER_Call_of_Pripyat/)
- `cli/config.json` file should be edited to match your local system

## 💿 Start development

- DOWNLOAD the game (stalker call of pripyat)
- RUN `git clone https://github.com/stalker-xrts/stalker-xrts-template.git` - clone repository
- RUN `cd stalker-xrts-template` - cd to project folder
- EDIT `cli/config.json` - correct paths to match your local system (game path, logs path, resources path)
- RUN `npm install` - install all the dependencies
- RUN `npm run setup` - set up the project, install submodules
- RUN `npm run link` - link gamedata to the game folder
- RUN `npm run engine use release` - link open xray with game
- RUN `npm run build:clean` - build gamedata to the destination
- RUN `npm run start_game` - start game and test changes

## 🧰 Check issues

`$ npm run verify` - will check whether project is set up and ready to start developing

# 🧰 Development

## 🏗️ Project commands

`$ npm run COMMAND_NAME`

- [setup](cli/info/README.md) - setup project and submodules.
- [info](cli/info/README.md) - print general information about the project and its configuration.
- [verify](cli/verify/README.md) - verify project settings and readiness
- [link](cli/link/README.md) - link target/gamedata and logs folder and stalker folder for faster development
- [unlink](cli/build/README.md) - unlink target/gamedata and logs folder and stalker folder
- [engine](cli/build/README.md) - engine management commands to use open-xray
- [open_game_folder](cli/build/README.md) - open game folder in explorer
- [start_game](cli/build/README.md) - start game with debug flag
- [build](cli/build/README.md) - build project gamedata with all assets
- [build:clean](cli/build/README.md) - same as build, but with `--clean` flag
- [build:scripts](cli/build/README.md) - build scripts only
- [watch:scripts](cli/build/README.md) - build scripts in watch mode, recompile on changes
- [test](cli/test/README.md) - run jest tests
- `format` - reformat TS code and lint it
- `lint` - lint TS code with eslint utils

## 🏗️ Codestyle

To ensure code style unification and validation, we use `prettier` and `eslint`. <br/>
Additionally, we set the line endings to CRLF to match the Windows system.

---

## 🏗️ Typedefs

To use X-Ray engine globals direct import from "xray16" module required. <br/>
After transpiling process import statements will be stripped and transformed to globals.

- [Lua](https://www.npmjs.com/package/lua-types)
- [TSTL language extension](https://www.npmjs.com/package/@typescript-to-lua/language-extensions)
- [X-Ray16 typedefs](https://github.com/stalker-xrts/xray-16-types)

For types correction and validation: [Open X-Ray source code](https://github.com/OpenXRay/xray-16) <br/>
Bindings documentation: [xray-16-types](https://stalker-xrts.github.io/xray-16-types/modules.html)

---

## 🏗️ Mod gamedata folder structure

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

- [bin](https://github.com/stalker-xrts/stalker-xrts-bin) - submodule with binaries for development and testing
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
  - [resources](https://github.com/stalker-xrts/stalker-xrts-resources) - submodule with resources of the mod
  - [typedefs](src/typedefs/README.md)
    - [luaJIT](src/typedefs/luaJIT/README.md)
    - [xray16](https://github.com/stalker-xrts/xray-16-types) - submodule with type definitions for xray engine
- [target](target/README.md)

## 🧰 Custom forms and UI

Notes:

- When creating forms, use [JSX](https://www.typescriptlang.org/docs/handbook/jsx.html)
- When mod compilation happens, JSX is transformed to valid XML
- All coordinates with (x, y) are based on 'attach' parent (not XML child, rather script register parent) and related
- Use `preview` command to preview forms and develop faster, example: `npm run preview menu`

For examples check: `src/mod/ui`.

## ️️🏗️ Debugging game

To attach a debugger to Lua/C++ code, follow these steps:

- Download Visual Studio
- Install the [LUA debug](https://github.com/WheretIB/LuaDkmDebugger) extension for Visual Studio. (fixes [A](https://github.com/WheretIB/LuaDkmDebugger/pull/25) + [B](https://github.com/WheretIB/LuaDkmDebugger/pull/26) required)
- Set up the engine project by following the OpenXray instructions
- Link the game by running npm run link and targeting the folder of xrts
- Run the game in debug/release mode directly from Visual Studio

Note that it is not possible to debug TypeScript directly. <br/>
Instead, attach a breakpoint and observe the transpiled Lua code. <br/>
Additionally, it is not possible to debug luabind declared classes and userdata.

## 🧰 Checking game logs

To enable loggingб make sure the `GameConfig` logging flag is set to true. <br/>

Depending on how you run the game, you can use the following approaches to check the logs:

### With pre-built engine

- Make sure you are using the custom engine. If not, switch to the mixed/release variant: `npm run engine use release`
- Link the application logs folder with the target directory: `npm run link`
- Start the game (`npm run start_game`) and check the log files in `target/logs_link` directory

### With visual studio

- Just run the project and check `Output` window of application

## ️🏗️ Development utils

[Can be checked here.](UTILS.md)
