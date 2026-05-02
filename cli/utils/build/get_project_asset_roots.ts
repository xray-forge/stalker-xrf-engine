import * as path from "node:path";

import { default as config } from "#/config.json";
import { CLI_DIR } from "#/globals";
import { normalizeParameterPath } from "#/utils/fs/normalize_parameter_path";
import { Optional } from "#/utils/types";

/**
 * @param language - locale to use for additional assets
 * @returns list of additional assets based on XRF config and locale
 */
export function getProjectAssetsRoots(language?: string): Array<string> {
  const assetRoots: Array<string> = config.resources.mod_assets_override_folders.map((it) => {
    return path.resolve(CLI_DIR, normalizeParameterPath(it));
  });

  const languageAssets: Optional<Array<string>> = language
    ? config.resources.mod_assets_locales[language as keyof typeof config.resources.mod_assets_locales]
    : null;

  if (languageAssets) {
    languageAssets.forEach((it: string) => {
      assetRoots.push(path.resolve(CLI_DIR, normalizeParameterPath(it)));
    });
  }

  return assetRoots;
}
