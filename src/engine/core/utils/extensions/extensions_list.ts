import { FS, getFS } from "xray16";
import { AnyObject, LuaArray, Nillable, TName, TPath } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { IExtensionCheckResult, IExtensionsDescriptor } from "@/engine/core/utils/extensions/extensions_types";
import { roots } from "@/engine/lib/constants/roots";

/**
 * Get list of possible extension modules.
 * Finds entry-points and validates them for further execution.
 *
 * @returns List of possible extensions descriptors.
 */
export function getAvailableExtensions(): LuaArray<IExtensionsDescriptor> {
  const fs: FS = getFS();

  const extensionsFolder: TPath = fs.update_path(roots.gameData, "extensions");
  const extensionsFolderAttributes: Nillable<LuaTable> = $isNotNil(lfs) ? lfs.attributes(extensionsFolder) : null;

  if (extensionsFolderAttributes?.get("mode") === "directory") {
    const list: LuaArray<IExtensionsDescriptor> = new LuaTable();
    const extensionsFolder: TPath = fs.update_path(roots.gameData, "extensions");

    const [, directory] = lfs.dir(extensionsFolder);
    let directoryItem: Nillable<TName> = directory.next();

    while (directoryItem) {
      const extensionPath: TPath = fs.update_path(roots.gameData, string.format("extensions\\%s", directoryItem));
      const extensionEntryPath: TPath = string.format("%s\\main.script", extensionPath);
      const extensionCheckPath: TPath = string.format("%s\\check.script", extensionPath);

      // If entry exists and has register callback, collect descriptor.
      if (lfs.attributes(extensionEntryPath)) {
        let isAvailable: boolean = true;
        let availabilityReason: Nillable<string> = null;
        let metadata: AnyObject = {};

        if (lfs.attributes(extensionCheckPath)?.get("mode") === "file") {
          metadata = require(string.format("extensions.%s.check", directoryItem));

          const result: unknown = (metadata.check as () => unknown)();

          if (type(result) !== "table" || type((result as IExtensionCheckResult).enabled) !== "boolean") {
            isAvailable = false;
            availabilityReason = "Compatibility check returned an invalid result.";
          } else {
            isAvailable = (result as IExtensionCheckResult).enabled;
            availabilityReason = (result as IExtensionCheckResult).reason ?? null;
          }
        }

        const module: Nillable<AnyObject> = isAvailable
          ? require(string.format("extensions.%s.main", directoryItem))
          : null;

        metadata = module ?? metadata;

        if (!isAvailable || (module && type(module.register) === "function")) {
          table.insert(list, {
            isEnabled: type(metadata.enabled) === "boolean" ? metadata.enabled : true,
            isAvailable: isAvailable,
            availabilityReason: availabilityReason,
            canToggle: isAvailable && type(metadata.canToggle) === "boolean" ? metadata.canToggle : isAvailable,
            name: type(metadata.name) === "string" ? metadata.name : directoryItem,
            path: extensionPath,
            entry: extensionEntryPath,
            module: module ?? {},
          });
        }
      }

      directoryItem = directory.next();
    }

    return list;
  }

  return new LuaTable();
}
