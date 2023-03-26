# [XRF](../README.md) / [DOCS](./README.md)

## 🧰 Scripts execution flow

### -> Game .exe start

- Game files and core initialize
- Main menu forms and scripts initialized, instance of main menu is created

### -> New game start

- Loading assets
- Resolving globals, registering callbacks
- Registering game server classes bindings
- Registering and calling 'start' game callbacks
- Registering scheme implementations
- Reading all.spawn file, start spawning and creating items
- Execute main game update loop

- When items appear on client side, use ini files binders path and create new binder classes
