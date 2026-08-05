# [XRF](../../) / CLI / TEST

The project uses Jest for unit tests. Run the full suite with:

```sh
npm test
```

Pass Jest arguments after `--` to run a focused test or pattern:

```sh
npm test -- utils
npm test -- src/engine/core
```

Use `npm run test:coverage` to write a coverage report under `target/coverage_report`.
