import { ini_file } from "xray16";

import { IniFile } from "@/engine/lib/types";

export const SQUAD_BEHAVIOURS_LTX: IniFile = new ini_file("managers\\simulation\\squad_behaviours.ltx");

export const squadConfig = {
  STAY_POINT_IDLE_MIN: 90 * 60,
  STAY_POINT_IDLE_MAX: 240 * 60,
};
