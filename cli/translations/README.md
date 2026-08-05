# [XRF](../../) / CLI / TRANSLATIONS

`translations` initializes translation JSON, converts XML translation files to JSON, and validates built translations.

```sh
npm run cli -- translations <command> [options]
```

## Commands

- `init <path>` adds the configured language keys to a JSON file or directory.
- `to_json <path>` converts an XML translation file or directory to JSON.
- `check` lists missing or invalid entries in the built translation directory.

`init` supports `-v, --verbose`. `to_json` supports `-l, --language <locale>`, `-c, --clean`, `-o, --output <path>`,
`-e, --encoding <encoding>`, and `-v, --verbose`. `check` supports `-l, --language <locale>`, `-s, --strict`, and
`-v, --verbose`.

## Examples

```sh
npm run cli -- translations init src/engine/translations
npm run cli -- translations to_json locales/configs/text/pol --language pol --encoding windows-1250
npm run cli -- translations check --language eng --strict
```
