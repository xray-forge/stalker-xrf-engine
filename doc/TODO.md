# [XRTS](../README.md) / [DOCS](./README.md)

## 🧰 Main todos

- Finish translation generation tools
- Scripts to unpack raw_gamedata for observation / usage
- Script to verify integrity of assets and defined constants
- Rework acdc perl script and add all.spawn editing utils
- Add scripts to handle xrEngine tools
- Interop with level editor tools etc
- Re-architecture lua core of the game, use external lua libs for serialization of LUA tables
- Implement OXR versions window and other script additions
- Separate debug menu and profiling section in it

## 🧰 Requests to open x-ray

- With lua bindings generation include all call overrides when output TXT
- Export actor menu and actor menu item classes for overriding with lua
- Fix numerous calls to disk with menu, implement caching for character menu and fix lags when opening inventory
- XR_CPhraseScript -> allow function references as preconditions, not only string values
- XR_CPhraseScript -> allow function references to update text and react to dialogs
