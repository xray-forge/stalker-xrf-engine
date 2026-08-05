# [XRF](../../) / CLI / LINK

`link` creates development junctions for the configured game installation, the built `target/gamedata`, and engine
logs. `unlink` removes only junctions; `relink` removes and recreates them.

```sh
npm run cli -- link [options]
npm run cli -- unlink
npm run cli -- relink [options]
```

The game location is resolved from [`cli/config.json`](../config.json). `--force` can recursively remove an existing
game `gamedata`, game-link, or log-link destination before creating a junction. Review those locations carefully before
using it.

## Options

- `-f, --force` replaces existing destinations while linking or relinking.

## Examples

```sh
npm run cli -- link
npm run cli -- relink --force
npm run cli -- unlink
```
