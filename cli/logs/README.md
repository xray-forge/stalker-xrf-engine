# [XRF](../../) / CLI / LOGS

`logs` prints the last lines of the linked engine log. It requires the log junction created by `link`.

```sh
npm run cli -- logs [lines]
```

`lines` defaults to `15`.

## Examples

```sh
npm run cli -- logs
npm run cli -- logs 50
```
