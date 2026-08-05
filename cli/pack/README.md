# [XRF](../../) / CLI / PACK

`pack` creates either a mod package or a full game package from the current project configuration.

```sh
npm run cli -- pack <mod|game> [options]
```

By default, packaging runs the build and compression steps first.

## Options

- `--nb, --no-build` skips the build step.
- `--nc, --no-compress` skips compression.
- `--na, --no-asset-overrides` skips additional asset overrides during the build.
- `-e, --engine <type>` selects an engine variant for the package.
- `--se, --skip-engine` excludes the engine files.
- `-o, --optimize` enables build optimizations.
- `-c, --clean` removes the previous package destination.
- `-v, --verbose` prints detailed logs.

## Examples

```sh
npm run cli -- pack mod --optimize
npm run cli -- pack game --engine gold
npm run cli -- pack mod --no-build --no-compress
```
