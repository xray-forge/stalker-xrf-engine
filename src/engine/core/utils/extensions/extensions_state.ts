import { FS, getFS } from "xray16";

import { IExtensionsDescriptor } from "@/engine/core/utils/extensions/extensions_types";
import { loadObjectFromFile, saveObjectToFile } from "@/engine/core/utils/fs";
import { forgeConfig } from "@/engine/lib/configs/ForgeConfig";
import { roots } from "@/engine/lib/constants/roots";
import { LuaArray, Optional, TPath } from "@/engine/lib/types";

/**
 * Create dynamic save of extensions order and other state preferences.
 *
 * @param extensions - list of extensions to save order
 */
export function saveExtensionsState(extensions: LuaArray<IExtensionsDescriptor>): void {
  const fs: FS = getFS();
  const savesFolder: TPath = fs.update_path(roots.gameSaves, "");
  const orderFile: TPath = fs.update_path(roots.gameSaves, forgeConfig.EXTENSIONS.ORDER_FILE);

  saveObjectToFile(savesFolder, orderFile, $fromArray($fromLuaArray(extensions).map(({ module, ...rest }) => rest)));
}

/**
 * Load synchronized state of game extension modules.
 *
 * @returns order preferences
 */
export function loadExtensionsState(): LuaArray<IExtensionsDescriptor> {
  const orderFile: TPath = getFS().update_path(roots.gameSaves, forgeConfig.EXTENSIONS.ORDER_FILE);
  const order: Optional<LuaArray<IExtensionsDescriptor>> = loadObjectFromFile(orderFile);

  return order ? order : new LuaTable();
}

/**
 * Synchronize extensions order and return new one based on existing extensions and saved preferences.
 */
export function syncExtensionsState(
  extensions: LuaArray<IExtensionsDescriptor>,
  stored: LuaArray<IExtensionsDescriptor>
): LuaArray<IExtensionsDescriptor> {
  const list: LuaArray<IExtensionsDescriptor> = new LuaTable();
  const unordered: LuaArray<IExtensionsDescriptor> = new LuaTable();

  // Filter sorted first.
  for (const [, descriptor] of stored) {
    const existing: Optional<IExtensionsDescriptor> = $fromLuaArray(extensions).find(
      (it) => it.name === descriptor.name
    ) as Optional<IExtensionsDescriptor>;

    if (existing) {
      existing.isEnabled = descriptor.isEnabled;
      table.insert(list, existing);
    }
  }

  // Filter others as next step.
  for (const [, extension] of extensions) {
    const existing: Optional<IExtensionsDescriptor> = $fromLuaArray(list).find(
      (it) => it.name === extension.name
    ) as Optional<IExtensionsDescriptor>;

    if (!existing) {
      table.insert(unordered, extension);
    }
  }

  // Sort unordered by name and insert in general list.
  table.sort(unordered, (left, right) => left.name < right.name);

  for (const [, extension] of unordered) {
    table.insert(list, extension);
  }

  return list;
}
