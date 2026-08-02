import { FS, getFS } from "xray16";
import { FSFileList } from "xray16/alias";
import { LuaArray, TName, TPath } from "xray16/lib";

import { roots } from "@/engine/constants/roots";

const DECLARATIONS_DIRECTORY: TPath = "declarations\\";
const DECLARATION_MODULE_PREFIX: TName = "scripts.declarations.";
const SCRIPT_EXTENSION: string = ".script";

export type TDeclarationModuleLoader = (moduleId: TName) => void;

/**
 * Check whether an emitted declaration script is a runtime payload.
 */
export function isDeclarationPayload(path: TPath): boolean {
  if (string.sub(path, -string.len(SCRIPT_EXTENSION)) !== SCRIPT_EXTENSION) {
    return false;
  }

  const withoutExtension: TPath = string.sub(path, 1, -string.len(SCRIPT_EXTENSION) - 1);

  return (
    withoutExtension !== "index" &&
    string.sub(withoutExtension, -string.len(".index")) !== ".index" &&
    withoutExtension !== "roots" &&
    string.sub(withoutExtension, -string.len(".roots")) !== ".roots" &&
    withoutExtension !== "generated_loader" &&
    string.sub(withoutExtension, -string.len(".generated_loader")) !== ".generated_loader" &&
    string.sub(withoutExtension, -string.len(".test")) !== ".test" &&
    string.sub(withoutExtension, -string.len(".spec")) !== ".spec"
  );
}

/**
 * Convert a declaration path relative to `gamedata/scripts/declarations` into an OpenXRay module ID.
 */
export function declarationPathToModuleId(path: TPath): TName {
  let [normalized] = string.gsub(string.lower(path), "\\", ".");

  [normalized] = string.gsub(normalized, "/", ".");

  return DECLARATION_MODULE_PREFIX + string.sub(normalized, 1, -string.len(SCRIPT_EXTENSION) - 1);
}

/**
 * Discover emitted declaration payload modules through OpenXRay's archive-aware virtual filesystem.
 */
export function discoverDeclarationModules(): LuaArray<TName> {
  const modules: LuaArray<TName> = new LuaTable();
  const fs: FS = getFS();

  // Native `file_list_open` returns a null-backed wrapper for a missing directory, so guard it before opening.
  if (!fs.exist(roots.gameScripts, DECLARATIONS_DIRECTORY)) {
    return modules;
  }

  const files: FSFileList = fs.file_list_open(roots.gameScripts, DECLARATIONS_DIRECTORY, FS.FS_ListFiles);

  try {
    for (let index: number = 0; index < files.Size(); index += 1) {
      // The native binding returns LPCSTR here, although the TypeScript declaration currently says FSItem.
      const path: TPath = files.GetAt(index) as unknown as TPath;
      let [normalized] = string.gsub(string.lower(path), "\\", ".");

      [normalized] = string.gsub(normalized, "/", ".");

      if (isDeclarationPayload(normalized)) {
        table.insert(modules, declarationPathToModuleId(normalized));
      }
    }
  } finally {
    files.Free();
  }

  table.sort(modules, (left: TName, right: TName): boolean => left < right);

  return modules;
}

/**
 * Load declaration modules in the order supplied by discovery.
 */
export function loadDeclarationModules(
  modules: LuaArray<TName>,
  loadModule: TDeclarationModuleLoader = (moduleId: TName): void => {
    require(moduleId);
  }
): void {
  for (let index: number = 1; index <= modules.length(); index += 1) {
    loadModule(modules.get(index));
  }
}
