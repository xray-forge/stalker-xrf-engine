import * as fs from "fs";
import * as fsp from "fs/promises";
import * as path from "path";

import { green, red, yellow, yellowBright } from "chalk";
import { XMLParser } from "fast-xml-parser";
import { decode, encodingExists } from "iconv-lite";

import { default as config } from "#/config.json";
import { TARGET_PARSED_DIR } from "#/globals";
import {
  AnyObject,
  createDirIfNoExisting,
  EAssetExtension,
  EEncoding,
  exists,
  IJsonTranslationSchema,
  isDirectory,
  IXmlTranslationSchema,
  NodeLogger,
  Optional,
  readDirContentFlat,
} from "#/utils";

const log: NodeLogger = new NodeLogger("PARSE_TRANSLATION_AS_JSON");

const DEFAULT_TARGET_ENCODING: EEncoding = EEncoding.WINDOWS_1251;
const DEFAULT_TARGET_ENCODING_CHECK_LIMIT: number = 64;

interface IParseTranslationParameters {
  encoding?: string;
  output?: string;
  clean?: boolean;
  language?: string;
  verbose?: boolean;
}

/**
 * Parse provided file path as JSON.
 */
export async function parseTranslationAsJson(target: string, parameters: IParseTranslationParameters): Promise<void> {
  NodeLogger.IS_VERBOSE = Boolean(parameters.verbose);

  const locale: string = getTargetLocale(parameters);
  const encoding: string = parameters.encoding;
  const output: string = parameters.output ?? TARGET_PARSED_DIR;

  const isCustomOutput: boolean = output !== TARGET_PARSED_DIR;

  log.info("Parsing translation:", yellow(target), green(locale));
  log.debug("Running with parameters:", parameters);

  // Throw, no path exists.
  if (!(await exists(target))) {
    log.error("Cannot find path for parsing:", red(target));

    throw new Error("Provided path does not exist.");
  }

  const isSourceDirectory: boolean = await isDirectory(target);
  const isOutputDirectory: boolean = await isDirectory(output);

  if (isCustomOutput && isSourceDirectory && !isOutputDirectory) {
    throw new Error(`Trying to write whole translations directory to a single file: '${target}' -> '${output}'.`);
  }

  const files: Array<string> = isSourceDirectory
    ? (await readDirContentFlat(target)).filter((it) => path.extname(it) === EAssetExtension.XML)
    : [target];

  if (parameters.clean) {
    log.info("Clean target output:", yellow(output));
    fs.rmSync(output, isOutputDirectory ? { recursive: true, force: true } : { force: true });
  }

  for (const it of files) {
    const data: IJsonTranslationSchema = await parseXmlToJson(it, encoding);
    const fileDetails: path.ParsedPath = path.parse(it);
    const destination: string = isOutputDirectory
      ? path.resolve(output, `${fileDetails.name}${EAssetExtension.JSON}`)
      : path.resolve(output);

    if (createDirIfNoExisting(output)) {
      log.debug("MKDIR:", yellowBright(output));
    }

    log.debug("Write file:", yellow(destination));
    await fsp.writeFile(destination, JSON.stringify(transformXmlToJSON(data, locale), null, 2) + "\n");

    log.info("Saved resulting file to:", yellow(destination));
  }
}

/**
 * Transform XML to JSON translation.
 */
function transformXmlToJSON(schema: AnyObject, locale: string): IJsonTranslationSchema {
  if (!isValidSchema(schema)) {
    throw new Error("Invalid XML schema file provided, expected XRay translations XML file.");
  }

  return schema["string_table"]["string"].reduce((acc, it) => {
    acc[it["@_id"]] = config.available_locales.reduce((translation, lang) => {
      if (lang === locale) {
        translation[lang] = it.text.includes("\\n") ? it.text.split("\\n") : it.text;
      } else {
        translation[lang] = it["@_id"];
      }

      return translation;
    }, {});

    return acc;
  }, {});
}

/**
 * Check whether provided XML is valid.
 */
function isValidSchema(record: AnyObject): record is IXmlTranslationSchema {
  return (
    record["string_table"] &&
    typeof record["string_table"] === "object" &&
    Array.isArray(record["string_table"]["string"])
  );
}

/**
 * Parse provided file content to JSON.
 */
async function parseXmlToJson(file: string, encoding?: string): Promise<Record<string, any>> {
  const parser: XMLParser = new XMLParser({ ignoreAttributes: false, isArray: (tag) => tag === "string" });
  const data: Buffer = fs.readFileSync(file);
  const usedEncoding: string = encoding ?? readEncodingFromBuffer(data) ?? DEFAULT_TARGET_ENCODING;

  log.info("Parsing file with encoding:", green(usedEncoding), yellowBright(file));

  return parser.parse(decode(data, usedEncoding));
}

/**
 * Get locale to use as key.
 */
function getTargetLocale(parameters: IParseTranslationParameters): string {
  const locale: string = parameters.language ?? config.locale;

  if (config.available_locales.includes(locale)) {
    log.debug("Using parameter locale:", locale);

    return locale;
  } else {
    throw new Error(`Unknown locale supplied with --language parameter: '${locale}'.`);
  }
}

/**
 * Try to guess encoding from XML file.
 */
function readEncodingFromBuffer(buffer: Buffer): Optional<string> {
  const beginning: string = buffer.toString(EEncoding.UTF_8, 0, DEFAULT_TARGET_ENCODING_CHECK_LIMIT);
  const matches: RegExpMatchArray = beginning.match(/encoding="(.+)"/);

  if (matches && matches.length > 1 && encodingExists(matches[1])) {
    log.debug("Guessed encoding from XML heading:", matches[1]);

    return matches[1];
  } else {
    log.debug("No matching encoding found in parsed file", buffer.length);

    return null;
  }
}
