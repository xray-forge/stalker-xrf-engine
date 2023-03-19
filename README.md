# 🎮 [Stalker XR-TS template](README.md)

<p>
XRTS template for STALKER provides foundation for creating mods.
The template uses TypeScript and custom build tools to ensure type safety,
simplify development, automated builds, and provide shared template for mods development.
</p>

## 📦 In short

- Game scripts engine rewritten with typescript
- Custom build pipeline to add verification steps and simplify development
- Tools to generate UI forms from JSX
- Tools to generate configs from dynamic typescript
- Tools to generate simple translations
- Tools to debug the game

## 📍 Purpose

- Provide a shared template for mods development
- Produce documented and readable code
- Simplify development process

---

## 📦 Main differences with original

The intention of this engine template is to allow easier mod development without introducing breaking changes to the original. <br/>
Everything else can be added in your own mod extending the template.

## 📌What is used

- [NodeJS](https://nodejs.org/en/)
- [Typescript](https://www.typescriptlang.org/)
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

## 🏗️ Project scripts

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

---

## 🧰 Docs

- Development and game documentation: [docs](doc/README.md)
- Types and game bindings: [source](https://github.com/stalker-xrts/xray-16-types), [docs](https://stalker-xrts.github.io/xray-16-types/modules.html)
