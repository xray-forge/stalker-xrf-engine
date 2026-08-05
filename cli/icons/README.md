# [XRF](../../) / CLI / ICONS

`icons` packs and unpacks equipment icon sprites and XML texture-description sprites.

```sh
npm run cli -- icons <command> [options]
```

## Commands

- `unpack-equipment` extracts equipment icons from the equipment sprite.
- `pack-equipment` creates the equipment sprite from separate icon files.
- `unpack-descriptions` extracts icons described by an XML texture-description file.
- `pack-descriptions` creates the sprite described by an XML texture-description file.

`pack-descriptions` and `unpack-descriptions` accept `-d, --description <name>`. All icon commands accept
`-v, --verbose`; strict validation is enabled by default with `-s, --strict`.

## Examples

```sh
npm run cli -- icons unpack-equipment
npm run cli -- icons pack-equipment --verbose
npm run cli -- icons unpack-descriptions --description ui_actor_armor.xml
npm run cli -- icons pack-descriptions --description ui_actor_armor.xml
```
