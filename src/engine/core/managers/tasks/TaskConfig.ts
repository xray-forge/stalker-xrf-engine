import { ini_file } from "xray16";

import { readIniSectionsAsSet } from "@/engine/core/utils/ini";
import { IniFile } from "@/engine/lib/types";

export const TASK_MANAGER_CONFIG_LTX: IniFile = new ini_file("managers\\task_manager.ltx");

export const taskConfig = {
  AVAILABLE_TASKS: readIniSectionsAsSet(TASK_MANAGER_CONFIG_LTX),
};
