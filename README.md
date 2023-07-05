# 🎮 [Stalker XRF](README.md)

![status](https://github.com/xray-forge/stalker-xrf-template/actions/workflows/build_and_test.yml/badge.svg)
[![language-ts](https://img.shields.io/badge/language-typescript-blue.svg?style=flat)](https://github.com/xray-forge/stalker-xrf-template/search?l=typescript)
[![types](https://img.shields.io/badge/docs-types-blue.svg?style=flat)](https://xray-forge.github.io/xray-16-types/index.html)
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/Neloreck/dreamstate/blob/master/LICENSE)

<p>
Fully rewritten stalker script engine with typescript. <br/>
Template for stalker mods and modded game packages. <br/>
</p>

## 📦 In short

- Scripts engine rewritten with typescript
- Custom build pipeline
- Generation UI forms from JSX
- Game configs from dynamic typescript
- Simple translations generation
- Game profiling / debugging tools
- Creation of custom modded game package
- Unit tests coverage

## 📍 Purpose

- Provide shared template for mods development
- Produce documented and readable code, document xray SDK
- Simplify development and building process, involve more people

---

## 📦 Main differences from original

The intention of this engine template is to allow easier mod development without introducing breaking changes to the original plot. <br/>
Optimizations, quality and logics updates are welcome.

## 📌What is used

- [NodeJS](https://nodejs.org/en/)
- [Typescript](https://www.typescriptlang.org/)
- [TypeScriptToLua](https://typescripttolua.github.io/docs/getting-started)
- [Jest](https://jestjs.io/)
- [Fengari Lua VM](https://github.com/fengari-lua/fengari)
- [Open-X-Ray](https://github.com/OpenXRay/xray-16)

# 🌓 Starting work

## 🧰 Pre-requirements

- [NodeJS](https://nodejs.org/en/) 14 or later
- [Stalker-COP](https://store.steampowered.com/app/41700/STALKER_Call_of_Pripyat/) game

## 💿 Start development

- DOWNLOAD [the game](https://store.steampowered.com/app/41700/STALKER_Call_of_Pripyat/)
- RUN `git clone https://github.com/xray-forge/stalker-xrf-template.git` - clone repository
- RUN `cd stalker-xrf-template` - cd to project folder
- RUN `npm install` - install all the dependencies
- RUN `npm run setup` - set up the project, install submodules
- RUN `npm run cli link` - link gamedata to the game folder
- RUN `npm run cli engine use release` - link open xray with game
- RUN `npm run cli build` - build gamedata to the destination
- RUN `npm run cli start_game` - start game and test changes

## 🧰 Check issues

`$ npm run cli verify` - will check whether project is set up and ready to start developing

## 🏗️ Project scripts

`$ npm run COMMAND_NAME`

- [cli](cli/README.md) - run cli scripts
- [setup](cli/info/README.md) - setup project and submodules
- [verify](cli/verify/README.md) - verify project configuration and integrity
- [build](cli/build/README.md) - build project gamedata with all assets
- [pack:mod](cli/pack/README.md) - build complete mod package in target/mod_package folder
- [watch:scripts](cli/build/README.md) - build scripts in watch mode, recompile on changes
- [test](cli/test/README.md) - run jest tests
- `typecheck` - verify typescript types
- `format` - reformat TS code and lint it
- `lint` - lint TS code with eslint utils

`$ npm run cli COMMAND_NAME`

- [verify](cli/verify/README.md) - verify project settings and readiness
- [link](cli/link/README.md) - link target/gamedata and logs folder and stalker folder for faster development
- [unlink](cli/build/README.md) - unlink target/gamedata and logs folder and stalker folder
- [engine](cli/build/README.md) - engine management commands to use open-xray
- [open_game_folder](cli/build/README.md) - open game folder in explorer
- [start_game](cli/build/README.md) - start game with debug flag
- [build](cli/build/README.md) - build project gamedata with all assets
- [pack](cli/pack/README.md) - build complete mod or game package depending on provided arguments
- [clone](cli/clone/README.md) - clone additional resources
- [parse](cli/parse/README.md) - parsing utils to collect documentation or JSON summaries
- `help` - print list of commands and information about them

---

## 🧰 Docs

- Development and game documentation: [docs](doc/README.md)
- Types and game bindings: [source](https://github.com/xray-forge/xray-16-types), [docs](https://xray-forge.github.io/xray-16-types/modules.html)

## 🏗️ Assets

- Extended assets: [https://gitlab.com/xray-forge/stalker-xrf-resources-extended](https://gitlab.com/xray-forge/stalker-xrf-resources-extended)
- EN locale assets: [https://gitlab.com/xray-forge/stalker-xrf-resources-locale-eng](https://gitlab.com/xray-forge/stalker-xrf-resources-locale-eng)
- UA locale assets: [https://gitlab.com/xray-forge/stalker-xrf-resources-locale-ukr](https://gitlab.com/xray-forge/stalker-xrf-resources-locale-ukr)
- RU locale assets: [https://gitlab.com/xray-forge/stalker-xrf-resources-locale-rus](https://gitlab.com/xray-forge/stalker-xrf-resources-locale-rus)
