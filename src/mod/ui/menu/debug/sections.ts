import { console_command } from "@/mod/globals/console_command";

export enum EDebugSection {
  GENERAL = "general",
  COMMANDS = "commands",
  ITEMS = "items",
  POSITION = "position",
  PLAYER = "player",
  SOUND = "sound",
  SPAWN = "spawn",
  UI = "ui",
  WORLD = "world"
}

export const on_off_cmds = [
  console_command.g_god,
  console_command.g_unlimitedammo,
  console_command.g_autopickup,
  console_command.hud_weapon,
  console_command.hud_info,
  console_command.hud_crosshair_dist,
  console_command.hud_crosshair,
  console_command.hud_draw
];

export const zero_one_cmds = [console_command.wpn_aim_toggle];
