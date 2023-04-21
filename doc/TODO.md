# [XRF](../README.md) / [DOCS](./README.md)

## 🧰 Main todos

- Create xrf.ltx config and place extended game configs in it
- Scripts to unpack raw_gamedata for observation / usage
- Rework acdc perl script and add all.spawn editing utils
- Interop with level editor tools etc
- Add linux/windows custom CLI script

## 🧰 Requests to open x-ray

- With lua bindings generation include all call overrides when output TXT
- Export actor menu and actor menu item classes for overriding with lua
- Fix numerous calls to disk with menu, implement caching for character menu and fix lags when opening inventory
- XR_CPhraseScript -> allow function references as preconditions, not only string values
- XR_CPhraseScript -> allow function references to update text and react to dialogs
- Fix saving game / game encoding checks when system is using RU version of the game without installed locale OS / windows-1251 encoding
- For net packets add w_ctime and r_ctime methods
- map_has_object_spot -> add has one of
