# [XRF](../../) / CLI / ENGINE

`engine` manages the bundled engine variants in `cli/bin/engines`. Selecting a variant replaces the configured game's
`bin` directory with a junction and preserves an unlinked original directory as an XRF backup.

```sh
npm run cli -- engine <command>
```

Use this command only for the game installation configured in [`cli/config.json`](../config.json).

## Commands

- `list` prints available engine variants.
- `use <engine>` switches the game to an available variant.
- `info` prints information about the active engine.
- `rollback` restores the default game engine from the saved backup.

## Examples

```sh
npm run cli -- engine list
npm run cli -- engine use gold
npm run cli -- engine info
npm run cli -- engine rollback
```
