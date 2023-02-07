## 🧰 Main todos

- Move remaining logic and codebase to typescript
- After migration consider simplification and unification of some parts
- Finish LTX generation tools
- Finish translation generation tools
- Scripts to unpack raw_gamedata for observation / usage
- Script to verify integrity of assets and defined constants
- Screenshots of some tools
- Declare luaBind classes with TSTL plugin, some way to override default TSTL class generation for XR classes declaration with luabind?
- Rework acdc perl script and add all.spawn editing utils
- Unit tests and mocks
- Add scripts to handle xrEngine tools
- Interop with level editor tools etc
- Re-architecture lua core of the game, use external lua libs for serialization of LUA tables
- Implement OXR versions window and other script additions
- Separate debug menu and profiling section in it
- Fix typing for IStoredObject
- Add compile-time macroses support: !filename for logging, !inline for inlining of utils etc

## 🧰 Requests to open x-ray

- With lua bindings generation include all call overrides when output TXT
- Fix profiling hook 'call' part and investigate it?
- Export actor menu and actor menu item classes for overriding with lua
- Fix numerous calls to disk with menu, implement caching for character menu and fix lags when opening inventory
