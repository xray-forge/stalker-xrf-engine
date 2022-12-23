# [XRTS](../../) / CLI / PREVIEW

### Description

Compile XML form files to HTML to preview them in browser. <br/>
You can find them in `target/preview` folder for observation.

### Arguments

List of arguments:

- `--verbose` - use more verbose logging
- `...filters` - list of space-separated regex patterns for preview generation

### Example

- `npm run preview`
- `npm run preview debug -- --verbose`
- `npm run preview debug menu options`

### Example output

```text
> stalker-xrts-template@1.0.0 preview
> ts-node -P cli/tsconfig.json ./cli/preview/preview.ts debug

22:25:06:716 [PREVIEW] Compiling preview files
22:25:06:729 [PREVIEW] Using filters: [ 'debug' ]
22:25:06:732 [PREVIEW] Found XML configs
22:25:07:096 [PREVIEW] COMPILE JSX: F:\Documents\Projects\stalker-xrts-template\target\preview\debug\DevDebugDialog.component.html
22:25:07:183 [PREVIEW] COMPILE JSX: F:\Documents\Projects\stalker-xrts-template\target\preview\debug\DevDebugGeneralSection.component.html
22:25:07:190 [PREVIEW] COMPILE JSX: F:\Documents\Projects\stalker-xrts-template\target\preview\debug\DevDebugItemsSection.component.html
22:25:07:196 [PREVIEW] COMPILE JSX: F:\Documents\Projects\stalker-xrts-template\target\preview\debug\DevDebugPositionSection.component.html
22:25:07:202 [PREVIEW] COMPILE JSX: F:\Documents\Projects\stalker-xrts-template\target\preview\debug\DevDebugSoundSection.component.html
22:25:07:208 [PREVIEW] COMPILE JSX: F:\Documents\Projects\stalker-xrts-template\target\preview\debug\DevDebugSpawnSection.component.html
22:25:07:214 [PREVIEW] COMPILE JSX: F:\Documents\Projects\stalker-xrts-template\target\preview\debug\DevDebugUiSection.component.html
22:25:07:224 [PREVIEW] COMPILE JSX: F:\Documents\Projects\stalker-xrts-template\target\preview\debug\DevDebugWorldSection.component.html
22:25:07:235 [PREVIEW] XML files processed: 8
22:25:07:235 [PREVIEW] Preview compilation took: 0.519 SEC
```
