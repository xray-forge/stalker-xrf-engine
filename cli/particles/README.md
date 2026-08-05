# [XRF](../../) / CLI / PARTICLES

`particles` converts between a packed `particles.xr` file and separate LTX configurations.

```sh
npm run cli -- particles <pack|unpack> [options]
```

## Options

- `-p, --path <path>` selects the source file for `unpack` or source directory for `pack`.
- `-d, --dest <dest>` selects the output directory for `unpack` or output file for `pack`.
- `-f, --force` removes an existing unpacked destination when needed.
- `-v, --verbose` prints detailed logs.

## Examples

```sh
npm run cli -- particles unpack --path src/resources/particles.xr
npm run cli -- particles pack --path target/particles --dest target/particles.xr
```
