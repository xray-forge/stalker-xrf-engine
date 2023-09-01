# 🎮 [Stalker XRF](README.md)

[![book](https://img.shields.io/badge/docs-book-blue.svg?style=flat)](https://xray-forge.github.io/stalker-xrf-book)
[![types](https://img.shields.io/badge/docs-types-blue.svg?style=flat)](https://xray-forge.github.io/xray-16-types/index.html)
[![language-ts](https://img.shields.io/badge/language-typescript-blue.svg?style=flat)](https://github.com/xray-forge/stalker-xrf-template/search?l=typescript)
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/Neloreck/dreamstate/blob/master/LICENSE)
<br/>
![status](https://github.com/xray-forge/stalker-xrf-template/actions/workflows/build_and_test.yml/badge.svg)

<p>
Fully rewritten stalker script engine with typescript. <br/>
Template for stalker mods and modded game packages. <br/>
</p>

## 📦 In short

- [Faster development](https://xray-forge.github.io/stalker-xrf-book/xrf/developing/developing.html)
- Custom [CLI](https://xray-forge.github.io/stalker-xrf-book/xrf/cli/cli.html) and [build pipeline](https://xray-forge.github.io/stalker-xrf-book/xrf/building/building.html)
  - Scripts engine rewritten with typescript ([tstl](https://typescripttolua.github.io/docs/getting-started))
  - [Generation UI forms from JSX](https://xray-forge.github.io/stalker-xrf-book/xrf/building/building_forms.html)
  - [Game configs from dynamic typescript](https://xray-forge.github.io/stalker-xrf-book/xrf/building/building_configs.html)
  - [Simple translations generation](https://xray-forge.github.io/stalker-xrf-book/xrf/building/building_translations.html)
- [Creation of custom modded game packages](https://xray-forge.github.io/stalker-xrf-book/xrf/packaging.html)
- [Modular extensions](https://xray-forge.github.io/stalker-xrf-book/extensions/extensions.html)
- [Debugging tools](https://xray-forge.github.io/stalker-xrf-book/xrf/debugging.html)
- [Unit testing](https://xray-forge.github.io/stalker-xrf-book/xrf/testing.html)
- [Consistent formatted and linted codebase](https://xray-forge.github.io/stalker-xrf-book/xrf/formatting_and_linting.html)

## 📍 Purpose

- Provide shared template for mods development
- Produce documented and readable code, document xray SDK
- Simplify development and building process, involve more people

---

## 🌓 Links

- [Starting work](https://xray-forge.github.io/stalker-xrf-book/xrf/installation.html)
- [CLI commands](https://xray-forge.github.io/stalker-xrf-book/xrf/cli/commands.html)
- [Docs](https://xray-forge.github.io/stalker-xrf-book/general/general.html)
- [Types](https://xray-forge.github.io/xray-16-types/modules.html), [source](https://github.com/xray-forge/xray-16-types)

## 📌What is used

- [NodeJS](https://nodejs.org/en/)
- [Typescript](https://www.typescriptlang.org/)
- [TypeScriptToLua](https://typescripttolua.github.io/docs/getting-started)
- [Jest](https://jestjs.io/)
- [Fengari Lua VM](https://github.com/fengari-lua/fengari)
- [Open-X-Ray](https://github.com/OpenXRay/xray-16)

## 📦 Main differences from original

The intention of this engine template is to allow easier mod development without introducing breaking changes to the original plot. <br/>
Optimizations, quality and logics updates are welcome.

## 🧰 State / bugs

It took 3 months just to migrate all the 20 years of LUA codebase to typescript and create custom transformers to support luabind. <br/>
Further game testing and re-architecture produces new bugs and issues which are easier to prevent with unit tests. <br/>
As for now, main focus is separation and clarification of logics and unit testing coverage.

## 🌓 TODOs / tasks

- [cli and tooling](https://github.com/orgs/xray-forge/projects/3)
- [core](https://github.com/orgs/xray-forge/projects/4)
- [documentation](https://github.com/orgs/xray-forge/projects/5)
- [game engine (open xray)](https://github.com/orgs/xray-forge/projects/6)
