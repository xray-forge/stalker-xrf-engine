import { console_commands } from "@/engine/lib/constants/console_commands";

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
