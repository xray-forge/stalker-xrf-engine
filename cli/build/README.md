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
- `--clean` - clean up `target/gamedata` folder before build
- `--no-lua-logs` - strip LuaLogger calls and creation from built code
- `--resources` - add static resources copy
- `--no-resources` - skip static resources copy
- `--ui` - add UI building/copy steps
- `--no-ui` - skip UI building/copy steps
- `--scripts` - add lua scripts building/copy steps
- `--no-scripts` - skip lua scripts building/copy steps
- `--configs` - add configs building/copy steps
- `--no-configs` - skip configs building/copy steps
- `--translations` - add translations building/copy steps
- `--no-translations` - skip translations building/copy steps

### Example

- `npm run build -- --all --clean`
- `npm run build -- --all --clean --no-lua-logs`
- `npm run build -- --all --verbose`
- `npm run build -- --resources --ui`
- `npm run build -- --all --no-resources --no-ui`

### Example output

```text
> stalker-xrf-template@1.0.0 build:clean
> ts-node -P cli/tsconfig.json ./cli/build/build.ts --all --clean --no-scripts --no-ui

23:23:11:667 [BUILD_ALL] XRF build: xrf-template 12/20/2022, 11:23:11 PM
23:23:11:669 [BUILD_ALL] Perform target cleanup
23:23:11:720 [BUILD_ALL] Scripts build steps skipped
23:23:11:720 [BUILD_ALL] UI build steps skipped
23:23:11:721 [BUILD_CONFIGS_DYNAMIC] Build dynamic configs
23:23:11:721 [BUILD_CONFIGS_STATICS] Copy static configs
23:23:11:722 [BUILD_CONFIGS_STATICS] Found static configs:
23:23:11:722 [BUILD_CONFIGS_STATICS] MKDIR: F:\Documents\Projects\stalker-xrf-template\target\gamedata\configs
23:23:11:722 [BUILD_CONFIGS_STATICS] CP: F:\Documents\Projects\stalker-xrf-template\target\gamedata\configs\example.ltx
23:23:11:723 [BUILD_CONFIGS_STATICS] Configs processed: 1
23:23:11:724 [BUILD_ASSET_STATICS] Copy raw assets
23:23:11:724 [BUILD_ASSET_STATICS] Copy assets folders
23:23:11:724 [BUILD_ASSET_STATICS] CP -R: F:\Documents\Projects\stalker-xrf-template\target\gamedata\shaders
23:23:11:893 [BUILD_ASSET_STATICS] Resource folders processed: 1
23:23:11:893 [META] Build metadata
23:23:11:897 [META] Collecting gamedata meta: F:\Documents\Projects\stalker-xrf-template\target\gamedata
23:23:11:897 [META] Collected files count: 446
23:23:11:897 [META] Collected files size: 0.463 MB
23:23:11:901 [META] Included engine mod metadata
23:23:11:901 [BUILD_ALL] Successfully executed build command, took: 0.237 sec
23:23:11:902 [BUILD_COLLECT_LOG] File log collect
```
