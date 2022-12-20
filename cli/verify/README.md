# [XRTS](../../README.md) / CLI / VERIFY

### Description

Script performing project state checks. Verifies whether custom engine is active, config is correct and symlinks are activated.

### Example

- `npm run verify`

### Example output

```text
> stalker-xrts-template@1.0.0 verify
> ts-node -P ./cli/tsconfig.json cli/verify/verify.ts

00:05:35:442 [VERIFY] Verifying project state
00:05:35:457 [VERIFY] Project cli/config.json: OK
00:05:35:457 [VERIFY] Game folder: OK
00:05:35:458 [VERIFY] Game engine: OK
00:05:35:458 [VERIFY] Gamedata link: OK
00:05:35:458 [VERIFY] Logs link: OK
```

```text
> stalker-xrts-template@1.0.0 verify
> ts-node -P ./cli/tsconfig.json cli/verify/verify.ts

00:06:45:971 [VERIFY] Verifying project state
00:06:45:984 [VERIFY] Project cli/config.json: OK
00:06:45:985 [VERIFY] Game folder: OK
00:06:45:985 [VERIFY] Game engine: OK
00:06:45:985 [VERIFY] Gamedata link: FAIL
00:06:45:986 [VERIFY] Logs link: FAIL
```
