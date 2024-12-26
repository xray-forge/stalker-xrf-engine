# [XRF](../../) / CLI / ICONS

### Description

Script performing project icons packing and unpacking. <br/>
Works with equipment file specifically or with generic XML texture descriptions file.

### Arguments

List of arguments:

- `-d, --description` - name of texture description xml file to process (for texture description commands)
- `-s, --strict` - strict mode to enable all checks preventing possible errors and mistakes
- `-h, --help` - display help for command
- `-v, --verbose` - enable verbose logging

### Example

- `npm run cli icons pack-descriptions -d ui_actor_armor.xml`
- `npm run cli icons unpack-descriptions -d ui_actor_armor.xml`
- `npm run cli icons unpack-descriptions --verbose --strict`
- `npm run cli icons pack-equipment --verbose`
- `npm run cli icons unpack-equipment`
