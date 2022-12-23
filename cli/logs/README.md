# [XRTS](../../) / CLI / LOGS

### Description

Read X-Ray logs trace if folder is linked.

### Example

- `npm run logs`
- `npm run logs 50`

### Arguments

List of arguments:

- `%n%` - number of lines for printing from log

### Example output

```text
> stalker-xrts-template@1.0.0 logs
> ts-node -P cli/tsconfig.json cli/logs/logs.ts

15:23:14:820 [LOGS] Printing logs lines: 15
15:23:14:836 [LOGS] Open x-ray engine usage detected: mixed 1.6.0.2 December 2021 RC1
15:23:14:836 [LOGS] Checking logs in: F:\Applications\Steam\steamapps\common\Stalker Call of Pripyat\_appdata_\logs\openxray_neloreck.log
15:23:14:848 [LOGS]

[LUA]  [XRTS-DL][DebugDialog][INFO] Init
[LUA]  [XRTS-DL][DebugDialog][INFO] Init controls
[LUA]  [XRTS-DL][utils/rendering][INFO] Resolving XML form file: debug\DebugDialog.component false

FATAL ERROR

[error] Expression    : !fatal
[error] Function      : CUIXmlInitBase::InitWindow
[error] File          : C:\projects\xray-16\src\xrUICore\XML\UIXmlInitBase.cpp
[error] Line          : 69
[error] Description   : XML node not found
[error] Argument 0    : background
[error] Argument 1    : ui\debug\DebugDialog.component.xml

```
