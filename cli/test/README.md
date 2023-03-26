# [XRF](../../) / CLI / TEST

### Description

Testing scripts and configs.

### Example

- `npm run test`
- `npm run test utils`

### Example output

```text
> stalker-xrf-template@1.0.0 test
> jest --detectOpenHandles --config cli/test/jest.config.ts number

 PASS  src/engine/scripts/utils/number.test.ts
  'number' utils
    √ 'clamp' should correctly limit numbers (3 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.452 s, estimated 2 s
Ran all test suites matching /number/i.
```
