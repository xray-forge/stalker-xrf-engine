# [XRTS](../README.md) / [DOCS](./README.md)

## Development utils

- https://github.com/revolucas/AXRToolset - set of utilities for mod development (unpack gamedata)
- https://github.com/OpenXRay/xray-16 - open x-ray project
- https://apps.microsoft.com/store/detail/windows-terminal/9N0DX20HK701 - windows terminal
- https://developer.nvidia.com/nvidia-texture-tools-exporter- nvidia texture tools exported, useful for work with textures

## Command line flags for xr-engine

Engine command line flags: [link](https://github.com/OpenXRay/xray-16/wiki/%5BEN%5D-Engine's-command-line-keys)

## What is 'class' and 'super' in lua

- `https://github.com/OpenXRay/luabind-deboostified/blob/xray/src/open.cpp#L138`

It is 'luabind' part defined as globals

```c++
lua_setglobal(L, "class");

lua_pushcclosure(L, &make_property, 0);
lua_setglobal(L, "property");

lua_pushlightuserdata(L, &main_thread_tag);
lua_pushlightuserdata(L, L);
lua_rawset(L, LUA_REGISTRYINDEX);

lua_pushcclosure(L, &deprecated_super, 0);
lua_setglobal(L, "super");
```
