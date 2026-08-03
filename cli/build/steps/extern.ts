import * as fsp from "node:fs/promises";
import * as path from "node:path";

import { blueBright, yellowBright } from "chalk";

import { GAME_DATA_DECLARATIONS_DIR, ROOT_DIR } from "#/globals/paths";
import { getExternDeclarations } from "#/parse/utils/get_extern_docs";
import { getExternSourceFiles } from "#/parse/utils/get_extern_sources";
import { IExternFunction } from "#/parse/utils/types";
import { NodeLogger } from "#/utils/logging";

const log: NodeLogger = NodeLogger.forFile(__filename);

const EXTERN_MANIFEST_PATH: string = path.resolve(GAME_DATA_DECLARATIONS_DIR, "extern.json");

interface IExternManifest {
  exports: Record<
    string,
    {
      source: string;
      doc?: IExternFunction["documentation"];
      params?: Array<{
        name: string;
        type: string;
        optional?: true;
        doc?: string;
      }>;
      returns?: string;
      type?: string;
    }
  >;
}

/**
 * Generate `src/engine/declarations/extern.json` from XRF declaration sources.
 *
 * @returns A promise that resolves after the manifest has been written.
 */
export async function buildExternManifest(): Promise<void> {
  log.info(blueBright("Build extern manifest"));

  const files: Array<string> = await getExternSourceFiles(GAME_DATA_DECLARATIONS_DIR);
  const declarations: Array<IExternFunction> = getExternDeclarations(files, { strict: true }).flatMap(
    (it) => it.extern
  );

  await fsp.writeFile(
    EXTERN_MANIFEST_PATH,
    `${JSON.stringify(renderExternManifest(declarations), null, 2).replace(/\n/g, "\r\n")}\r\n`
  );

  log.info("Built extern manifest:", yellowBright(EXTERN_MANIFEST_PATH), "entries:", declarations.length);
}

/**
 * Render parsed declarations as the tracked manifest payload.
 */
function renderExternManifest(declarations: Array<IExternFunction>): IExternManifest {
  const exports: IExternManifest["exports"] = {};

  declarations
    .sort((left: IExternFunction, right: IExternFunction): number => left.name.localeCompare(right.name))
    .forEach((declaration: IExternFunction) => {
      if (exports[declaration.name]) {
        throw new Error(
          `Duplicate extern '${declaration.name}' declared in '${exports[declaration.name].source}' and '${getSourcePath(declaration.file)}'.`
        );
      }

      exports[declaration.name] = declaration.parameters
        ? {
            ...(declaration.documentation ? { doc: declaration.documentation } : {}),
            params: declaration.parameters.map((parameter) => ({
              ...(parameter.doc ? { doc: parameter.doc } : {}),
              ...(parameter.optional ? { optional: true } : {}),
              name: parameter.parameterName,
              type: parameter.parameterTypeName,
            })),
            returns: declaration.returnTypeName as string,
            source: getSourcePath(declaration.file),
          }
        : {
            ...(declaration.documentation ? { doc: declaration.documentation } : {}),
            source: getSourcePath(declaration.file),
            type: declaration.typeName as string,
          };
    });

  return { exports };
}

function getSourcePath(file: string): string {
  return path.relative(ROOT_DIR, file).split(path.sep).join("/");
}
