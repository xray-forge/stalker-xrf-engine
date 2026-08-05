# [XRF](../../) / CLI / COMPRESS

`compress` converts an existing `target/gamedata` build into game archives. Run `build` first.

```sh
npm run cli -- compress [options]
```

## Options

- `-i, --include <targets...>` compresses only named archive targets. Valid names are defined in
  `cli/compress/configs/compress.json`.
- `-c, --clean` removes the previous compression destination before writing archives.
- `-v, --verbose` prints detailed compression logs.

## Examples

```sh
npm run cli -- compress --clean
npm run cli -- compress --include scripts
```
