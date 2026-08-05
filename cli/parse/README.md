# [XRF](../../) / CLI / PARSE

`parse dir_as_json` walks a directory recursively and writes its sorted file tree as JSON under `target/parsed`.
The command resolves the supplied path from the repository root.

```sh
npm run cli -- parse dir_as_json <path> [options]
```

## Options

- `-e, --no-extension` omits file extensions from JSON values.

## Examples

```sh
npm run cli -- parse dir_as_json src/resources/textures
npm run cli -- parse dir_as_json src/resources/anims --no-extension
```
