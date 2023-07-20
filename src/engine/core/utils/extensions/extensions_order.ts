import { FS, getFS } from "xray16";

import { IExtensionsDescriptor } from "@/engine/core/utils/extensions/extensions_types";
import { loadObjectFromFile, saveObjectToFile } from "@/engine/core/utils/fs";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { roots } from "@/engine/lib/constants/roots";
import { LuaArray, Optional, TName, TPath } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Create dynamic save of extensions order preference.
 *
 * @param extensions - list of extensions to save order
 */
export function saveExtensionsOrder(extensions: LuaArray<IExtensionsDescriptor>): void {
  const fs: FS = getFS();
  const savesFolder: TPath = fs.update_path(roots.gameSaves, "");
  const orderFile: TPath = fs.update_path(roots.gameSaves, gameConfig.GAME_SAVE_EXTENSIONS_ORDER_FILE);

  saveObjectToFile(savesFolder, orderFile, $fromArray($fromLuaArray(extensions).map((it) => it.name)));
}

/**
 * Create dynamic game save based on stringified binary data.
 *
 * @returns order preferences
 */
export function loadExtensionsOrder(): LuaArray<TName> {
  const orderFile: TPath = getFS().update_path(roots.gameSaves, gameConfig.GAME_SAVE_EXTENSIONS_ORDER_FILE);
  const order: Optional<LuaArray<TName>> = loadObjectFromFile(orderFile);

  return order ? order : new LuaTable();
}

/**
 * Synchronize extensions order and return new one based on existing extensions and saved preferences.
 */
export function syncExtensionsOrder(
  extensions: LuaArray<IExtensionsDescriptor>,
  order: LuaArray<TName>
): LuaArray<IExtensionsDescriptor> {
  const list: LuaArray<IExtensionsDescriptor> = new LuaTable();
  const unordered: LuaArray<IExtensionsDescriptor> = new LuaTable();

  // Filter sorted first.
  for (const [, name] of order) {
    const existing: Optional<IExtensionsDescriptor> = $fromLuaArray(extensions).find(
      (it) => it.name === name
    ) as Optional<IExtensionsDescriptor>;

    if (existing) {
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
