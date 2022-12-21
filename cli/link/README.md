# [XRTS](../../) / CLI / LINK

### Description

Contains commands related to linking and unlinking of game folders.

- Allows linking of gamedata folder and easier rebuilding of mode
- Allows linking of game logs for easier observation directily from IDE

Unlinking removes folders if they are pointing to the project.
If links pointing to other folders, manual involvement will be needed.

### Arguments

List of arguments:

- `--force` - remove links and re-initialize if already existing entries detected

### Example

- `npm run link`
- `npm run link --force`
- `npm run unlink`

### Example output

```text
> stalker-xrts-template@1.0.0 unlink
> ts-node -P ./cli/tsconfig.json cli/link/unlink.ts

23:54:34:535 [UNLINK] Unlinking mod development folders
23:54:34:548 [UNLINK] Unlinking: F:\Applications\Steam\steamapps\common\Stalker Call of Pripyat\gamedata
23:54:34:549 [UNLINK] Unlinked: F:\Applications\Steam\steamapps\common\Stalker Call of Pripyat\gamedata
23:54:34:550 [UNLINK] Unlinking: F:\Documents\Projects\stalker-xrts-template\target\logs
23:54:34:550 [UNLINK] Unlinked: F:\Documents\Projects\stalker-xrts-template\target\logs
```

```text
> stalker-xrts-template@1.0.0 link
> ts-node -P ./cli/tsconfig.json cli/link/link.ts

23:54:51:665 [LINK] Linking mod development folders
23:54:51:678 [LINK] Linking gamedata folders
23:54:51:680 [LINK] Linked folders: F:\Documents\Projects\stalker-xrts-template\target\gamedata -> F:\Applications\Steam\steamapps\common\Stalker Call of Pripyat\gamedata
23:54:51:680 [LINK] Linking logs folders
23:54:51:680 [LINK] Linked folders: F:\Applications\Steam\steamapps\common\Stalker Call of Pripyat\_appdata_\logs -> F:\Documents\Projects\stalker-xrts-template\target\logs
```
