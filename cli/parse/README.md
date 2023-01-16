# [XRTS](../../) / CLI / PARSE

### Description

Script to parse folder files recursively. <br/>
Useful for parsing of textures/animations for usage in globals files.

### Arguments

List of arguments:

- `--no-ext` - do not include extension for JSON values

### Example

- `npm run parse_dir_as_json ../gamedata_original/anims`
- `npm run parse_dir_as_json ../gamedata_original/textures -- --no-ext`

### Example output

```text
> stalker-xrts-template@1.0.0 parse_dir_as_json
> ts-node -P cli/tsconfig.json ./cli/parse/parse_dir_as_json.ts ..\gamedata_raw\textures\ --no-ext

02:57:51:929 [PARSE_DIR_AS_JSON] Parsing game dir as json: F:\Documents\Projects\gamedata_raw\textures
02:57:51:955 [PARSE_DIR_AS_JSON] Writing parsed tree to: F:\Documents\Projects\stalker-xrts-template\target\parsed\textures.json
02:57:51:964 [PARSE_DIR_AS_JSON] Result: OK, entries parsed: 6275
```

```text
> .\target\parsed\textures.json

{
  "$alphadxt1": "$alphadxt1",
  "$noalphadxt5": "$noalphadxt5",
  "$shadertest": "$shadertest",
  "act_act_arm_1": "act\\act_arm_1",
  "act_act_arm_1_bump#": "act\\act_arm_1_bump#",
  "act_act_arm_1_bump": "act\\act_arm_1_bump",
  "act_act_arm_1_exo": "act\\act_arm_1_exo",
  ...
}
```
