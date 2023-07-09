import { FS, getFS } from "xray16";

import { IExtensionsDescriptor } from "@/engine/core/utils/extensions/extensions_types";
import { roots } from "@/engine/lib/constants/roots";
import { AnyObject, LuaArray, Optional, TName, TPath } from "@/engine/lib/types";

/**
 * Get list of possible extension modules.
 * Finds entry-points and validates them for further execution.
 *
 * @returns list of possible extensions descriptors
 */
export function getAvailableExtensions(): LuaArray<IExtensionsDescriptor> {
  const fs: FS = getFS();

  if (fs.exist(roots.gameData, "extensions", FS.FS_ListFolders)) {
    const list: LuaArray<IExtensionsDescriptor> = new LuaTable();
    const extensionsFolder: TPath = fs.update_path(roots.gameData, "extensions");

    const [, directory] = lfs.dir(extensionsFolder);
    let directoryItem: Optional<TName> = directory.next();

    while (directoryItem) {
      const extensionPath: TPath = fs.update_path(
        roots.gameData,
        string.format("extensions/%s/main.script", directoryItem)
      );

      // If entry exists and has register callback, collect descriptor.
      if (lfs.attributes(extensionPath)) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const module: Optional<AnyObject> = require(string.format("extensions.%s.main", directoryItem));

        if (module && type(module.register) === "function") {
          table.insert(list, {
            isEnabled: true,
            name: directoryItem,
            path: extensionPath,
            module: module,
          });
        }
      }

      directoryItem = directory.next();
    }

    return list;
  }

  return new LuaTable();
}
