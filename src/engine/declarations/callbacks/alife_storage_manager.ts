import { extern, TName } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { SaveManager } from "@/engine/core/managers/save";

/** Save-storage callbacks. */
extern("alife_storage_manager", {
  CALifeStorageManager_load: (saveName: TName): void => getManager(SaveManager).onGameLoad(saveName),
  CALifeStorageManager_after_load: (saveName: TName): void => getManager(SaveManager).onAfterGameLoad(saveName),
  CALifeStorageManager_before_save: (saveName: TName): void => getManager(SaveManager).onBeforeGameSave(saveName),
  CALifeStorageManager_save: (saveName: TName): void => getManager(SaveManager).onGameSave(saveName),
});
