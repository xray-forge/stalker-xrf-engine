# [XRF](../../) / CLI / CLONE

`clone` fetches an optional resource repository declared in [`cli/config.json`](../config.json).

```sh
npm run cli -- clone [repository] [options]
```

Use `--list` to print the repository names available in the current configuration. A repository name is optional only
when listing options.

## Options

- `-l, --list` lists configured repositories.
- `-f, --force` replaces an existing clone before cloning. It conflicts with `--safe`.
- `-s, --safe` treats an already-cloned destination as a successful result. It conflicts with `--force`.
- `-v, --verbose` prints detailed clone logs.

## Examples

```sh
npm run cli -- clone --list
npm run cli -- clone extended
npm run cli -- clone locale-ukr --safe
```
