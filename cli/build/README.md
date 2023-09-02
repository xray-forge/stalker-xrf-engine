# [XRF](../../.) / CLI / BUILD

### Description

Multistep preparation of stalker gamedata built from typescript and other generic tools.

Build includes such steps:

- clean target directory
- build scripts from typescript
- copy static lua scripts
- build dynamic UI configs from JSX
- copy static UI XML files
- build dynamic configs from ts files
- copy static LTX config files
- build dynamic translation files
- copy static translation files
- copy static resources (textures, shaders, models, sounds)
- build engine mod metadata.json

### Arguments

List of arguments:

- `--all` - build all assets
- `--verbose` - use more verbose logging
- `--language <language>` - use language override for building of gamedata
- `--filter <...patterns>` - use filtering for assets building
- `--clean` - clean up `target/gamedata` folder before build
- `--no-lua-logs` - strip LuaLogger calls and creation from built code
- `-h, --help` - display help for command

### Example

- `npm run cli build -- --clean`
- `npm run cli build -- -c --no-lua-logs`
- `npm run cli build -- -i resources ui -c`
- `npm run cli build -- -e resources`
