import { console_commands } from "@/mod/globals/console_commands";

export enum EDebugSection {
  GENERAL = "general",
  COMMANDS = "commands",
  ITEMS = "items",
  POSITION = "position",
  PLAYER = "player",
  SOUND = "sound",
  SPAWN = "spawn",
  UI = "ui",
  WORLD = "world",
}

export const on_off_cmds = [
  console_commands.g_god,
  console_commands.g_unlimitedammo,
  console_commands.g_autopickup,
  console_commands.hud_weapon,
  console_commands.hud_info,
  console_commands.hud_crosshair_dist,
  console_commands.hud_crosshair,
  console_commands.hud_draw,
] as Array<string>;

export const zero_one_cmds = [console_commands.wpn_aim_toggle] as Array<string>;
