# List of useful tools for mod development
 - https://github.com/revolucas/AXRToolset - set of utilities for mod development (unpack gamedata)
 - https://github.com/OpenXRay/xray-16 - open x-ray project
 - https://apps.microsoft.com/store/detail/windows-terminal/9N0DX20HK701 - windows terminal

## Command line flags for xr-engine
- `-depth16`
- `-designer`
- `-demomode`
- `-disasm`
- `-dsound`
- `-file_activity`
- `-fsltx`
- `-gloss`
- `-gpu_nopure`
- `-gpu_ref`
- `-gpu_sw`
- `-launcher`
- `-load`
- `-ltx`
- `-mblur`
- `-no_occq`
- `-nodistort`
- `-nointro`
- `-nojit`
- `-nolog`
- `-noprefetch`
- `-noshadows`
- `-nosound`
- `-overlay`
- `-psp`
- `-r2`
- `-r2a`
- `-r4xx`
- `-silent_error_mode`
- `-skip_memtest`
- `-smap1536`
- `-smap2048`
- `-smap2560`
- `-smap3072`
- `-smap4096`
- `-ss_tga`
- `-start`
- `-sunfilter`
- `-tune`

## What is 'class' and 'super' in lua

- `https://github.com/OpenXRay/luabind-deboostified/blob/xray/src/open.cpp#L138`

Seems like it is 'luabind' part defined as globals

```c
lua_setglobal(L, "class");

lua_pushcclosure(L, &make_property, 0);
lua_setglobal(L, "property");

lua_pushlightuserdata(L, &main_thread_tag);
lua_pushlightuserdata(L, L);
lua_rawset(L, LUA_REGISTRYINDEX);

lua_pushcclosure(L, &deprecated_super, 0);
lua_setglobal(L, "super");
```
