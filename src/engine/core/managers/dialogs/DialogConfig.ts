import { ini_file } from "xray16";

import { readIniGenericDialogs } from "@/engine/core/managers/dialogs/utils/dialog_init";
import type { IniFile, TNumberId } from "@/engine/lib/types";

export const DIALOG_MANAGER_CONFIG_LTX: IniFile = new ini_file("managers\\dialog_manager.ltx");

let GENERIC_PHRASE_ID_COUNTER: TNumberId = 5;

export const dialogConfig = {
  NEXT_PHRASE_ID(): TNumberId {
    return ++GENERIC_PHRASE_ID_COUNTER;
  },
  PHRASES: readIniGenericDialogs(DIALOG_MANAGER_CONFIG_LTX, () => ++GENERIC_PHRASE_ID_COUNTER),
};
