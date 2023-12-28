import { ini_file } from "xray16";

import { readIniGenericDialogs } from "@/engine/core/managers/dialogs/utils/dialog_read";
import { communities } from "@/engine/lib/constants/communities";
import type { GameObject, IniFile, Optional, TName, TNumberId } from "@/engine/lib/types";

let GENERIC_PHRASE_ID_COUNTER: TNumberId = 5;

export const DIALOG_MANAGER_CONFIG_LTX: IniFile = new ini_file("managers\\dialog_manager.ltx");

export const dialogConfig = {
  NEXT_PHRASE_ID(): TNumberId {
    return ++GENERIC_PHRASE_ID_COUNTER;
  },
  PHRASES: readIniGenericDialogs(DIALOG_MANAGER_CONFIG_LTX, () => ++GENERIC_PHRASE_ID_COUNTER),
  // Currently active speaker in dialogs.
  ACTIVE_SPEAKER: null as Optional<GameObject>,
  // Communities allowing universal dialogs.
  UNIVERSAL_DIALOGS_COMMUNITIES: $fromObject<TName, boolean>({
    [communities.bandit]: true,
    [communities.dolg]: true,
    [communities.freedom]: true,
    [communities.stalker]: true,
  }),
};
