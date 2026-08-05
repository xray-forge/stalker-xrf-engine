# [XRF](../../.) / CLI / BUILD

`build` assembles the engine sources into `target/gamedata`. With no target options, it builds configs, externs,
resources, scripts, translations, and UI assets.

```sh
npm run cli -- build [options]
```

## Options

- `-i, --include <targets...>` builds only the named targets: `configs`, `externs`, `resources`, `scripts`,
  `translations`, or `ui`.
- `-e, --exclude <targets...>` skips named targets. It cannot be combined with `--include`.
- `-c, --clean` removes the previous target before building.
- `-l, --language <language>` selects the locale; it defaults to `cli/config.json`'s `locale` value.
- `-f, --filter <targets...>` limits built files with the supplied regular-expression filters.
- `-v, --verbose` prints detailed build logs.
- `--nl, --no-lua-logs` removes Lua logging from generated scripts.
- `--na, --no-asset-overrides` skips additional asset overrides.
- `--itz, --inject-tracy-zones` instruments generated scripts with Tracy profiling zones.

## Examples

```sh
npm run cli -- build --clean
npm run cli -- build --include scripts ui --clean
npm run cli -- build --exclude resources
npm run cli -- build --include externs
```
