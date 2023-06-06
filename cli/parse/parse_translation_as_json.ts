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
  exists,
  IJsonTranslationSchema,
  IXmlTranslationSchema,
  NodeLogger,
  Optional,
} from "#/utils";

const log: NodeLogger = new NodeLogger("PARSE_TRANSLATION_AS_JSON");

const DEFAULT_TARGET_ENCODING: string = "windows-1251";
const DEFAULT_TARGET_ENCODING_CHECK_LIMIT: number = 64;

interface IParseTranslationParameters {
  encoding?: string;
  language?: string;
  verbose?: boolean;
}

/**
 * Parse provided file path as JSON.
 */
export async function parseTranslationAsJson(file: string, parameters: IParseTranslationParameters): Promise<void> {
  NodeLogger.IS_VERBOSE = Boolean(parameters.verbose);

  const locale: string = getTargetLocale(parameters);
  const encoding: string = parameters.encoding;

  log.info("Parsing translation:", yellow(file), green(locale));
  log.debug("Running with parameters:", parameters);

  if (await exists(file)) {
    const data: IJsonTranslationSchema = await parseXmlToJson(file, encoding);

    await saveResult(file, JSON.stringify(transformXmlToJSON(data, locale), null, 2) + "\n");

    log.info("Saved resulting file to:", yellow(TARGET_PARSED_DIR));
  } else {
    log.error("Cannot find file:", red(file));

    throw new Error("Provided file path does not exist.");
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

  log.info("Parsing file with encoding:", green(usedEncoding));

  return parser.parse(decode(data, usedEncoding));
}

/**
 * Save resulting content.
 */
async function saveResult(file: string, content: string): Promise<void> {
  const fileDetails: path.ParsedPath = path.parse(file);
  const target: string = path.resolve(TARGET_PARSED_DIR, `${fileDetails.name}.json`);

  if (createDirIfNoExisting(TARGET_PARSED_DIR)) {
    log.debug("MKDIR:", yellowBright(TARGET_PARSED_DIR));
  }

  log.debug("Write file:", yellow(target));

  await fsp.writeFile(target, content);
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
    log.debug("Fallback to default config locale:", config.locale);

    return config.locale;
  }
}

/**
 * Try to guess encoding from XML file.
 */
function readEncodingFromBuffer(buffer: Buffer): Optional<string> {
  const beginning: string = buffer.toString("utf-8", 0, DEFAULT_TARGET_ENCODING_CHECK_LIMIT);
  const matches: RegExpMatchArray = beginning.match(/encoding="(.+)"/);

  if (matches && matches.length > 1 && encodingExists(matches[1])) {
    log.debug("Guessed encoding from XML heading:", matches[1]);

    return matches[1];
  } else {
    log.debug("No matching encoding found in parsed file", buffer.length);

    return null;
  }
}
