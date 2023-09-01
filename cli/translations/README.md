# [XRF](../../) / CLI / PARSE

### Description

Script to help with translations generation and observation. <br/>
In most of the cases windows-1250 is used for latin, windows-1251 for cyrillic.

### Arguments

List of arguments:

- `-e, --encoding <encoding>` - target file encoding
- `-l, --language <language>` - target file language
- `-o, --output <path>` - target file or folder to write results into
- `-c, --clean` - whether target destination should be cleaned up before writing into it
- `-h, --help` - display help for command

### Example

- `npm run cli translations to_json ./some/file.xml -- --language eng`
- `npx xrf translations to_json ..\locales\configs\text\pol\ -l pol -o .\src\engine\translations\ -e windows-1250`
