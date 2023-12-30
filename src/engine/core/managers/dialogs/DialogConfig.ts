import { ini_file } from "xray16";

import { EGenericPhraseCategory } from "@/engine/core/managers/dialogs/dialog_types";
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
  NEW_DIALOG_PHRASE_CATEGORIES: $fromArray<EGenericPhraseCategory>([
    EGenericPhraseCategory.JOB,
    EGenericPhraseCategory.ANOMALIES,
    EGenericPhraseCategory.INFORMATION,
  ]),
  NEW_DIALOG_START_PHRASES: $fromArray([
    "dm_universal_npc_start_0",
    "dm_universal_npc_start_1",
    "dm_universal_npc_start_2",
    "dm_universal_npc_start_3",
  ]),
  NEW_DIALOG_PRECONDITIONS: $fromArray([
    "dialogs.npc_stalker",
    "dialogs.npc_bandit",
    "dialogs.npc_freedom",
    "dialogs.npc_dolg",
  ]),
};
