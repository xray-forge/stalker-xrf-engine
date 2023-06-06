import * as fs from "fs";
import * as fsp from "fs/promises";
import * as path from "path";

import { green, red, yellow, yellowBright } from "chalk";
import { XMLParser } from "fast-xml-parser";

import { default as config } from "#/config.json";
import { TARGET_PARSED_DIR } from "#/globals";
import {
  AnyObject,
  createDirIfNoExisting,
  exists,
  IJsonTranslationSchema,
  IXmlTranslationSchema,
  NodeLogger,
} from "#/utils";

const log: NodeLogger = new NodeLogger("PARSE_TRANSLATION_AS_JSON");

interface IParseTranslationParameters {
  language?: string;
  verbose?: boolean;
}

/**
 * Parse provided file path as JSON.
 */
export async function parseTranslationAsJson(file: string, parameters: IParseTranslationParameters): Promise<void> {
  NodeLogger.IS_VERBOSE = Boolean(parameters.verbose);

  const locale: string = getTargetLocale(parameters);

  log.info("Parsing translation:", yellow(file), green(locale));
  log.debug("Running with parameters:", parameters);

  if (await exists(file)) {
    const data: IJsonTranslationSchema = await parseXmlToJson(file);

    await saveResult(file, JSON.stringify(transformXmlToJSON(data, locale), null, 2));

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
      translation[lang] = lang === locale ? it.text : it["@_id"];

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
async function parseXmlToJson(file: string): Promise<Record<string, any>> {
  const parser: XMLParser = new XMLParser({ ignoreAttributes: false, isArray: (tag) => tag === "string" });
  const data: Buffer = fs.readFileSync(file);

  return parser.parse(data);
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

  await fsp.writeFile(target, content);
}

/**
 * Get locale to use as key.
 */
function getTargetLocale(parameters: IParseTranslationParameters): string {
  const locale: string = parameters.language ?? config.locale;

  if (config.available_locales.includes(locale)) {
    return locale;
  } else {
    return config.locale;
  }
}
