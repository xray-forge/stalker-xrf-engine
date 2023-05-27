import { LTX_ROOT } from "#/utils";

import { drugs } from "@/engine/lib/constants/items/drugs";
import { food } from "@/engine/lib/constants/items/food";

export const IS_LTX: boolean = true;

/**
 * Create config entry to bind keys.
 */
function newKeyBind(action: string, key: string): string {
  return `bind ${action} ${key}`;
}

/**
 * Create config entry to bind quick slots.
 */
function newQuickSlotBind(index: number, item: string): string {
  return `slot_${index} ${item}`;
}

/**
 * todo;
 */
export const config = {
  [LTX_ROOT]: [
    // Quick slots:
    newQuickSlotBind(0, drugs.medkit),
    newQuickSlotBind(1, drugs.bandage),
    newQuickSlotBind(2, drugs.antirad),
    newQuickSlotBind(3, food.conserva),

    // Keys:
    newKeyBind("accel", "kLSHIFT"),
    newKeyBind("active_jobs", "kP"),
    newKeyBind("artefact", "k7"),
    newKeyBind("back", "kS"),
    newKeyBind("buy_menu", "kB"),
    newKeyBind("cam_zoom_in", "kADD"),
    newKeyBind("cam_zoom_out", "kSUBTRACT"),
    newKeyBind("chat", "kCOMMA"),
    newKeyBind("chat_team", "kPERIOD"),
    newKeyBind("console", "kGRAVE"),
    newKeyBind("crouch", "kLCONTROL"),
    newKeyBind("down", "kDOWN"),
    newKeyBind("drop", "kG"),
    newKeyBind("forward", "kW"),
    newKeyBind("inventory", "kI"),
    newKeyBind("jump", "kSPACE"),
    newKeyBind("left", "kLEFT"),
    newKeyBind("llookout", "kQ"),
    newKeyBind("lstrafe", "kA"),
    newKeyBind("pause", "kPAUSE"),
    newKeyBind("quick_use_1", "kF1"),
    newKeyBind("quick_use_2", "kF2"),
    newKeyBind("quick_use_3", "kF3"),
    newKeyBind("quick_use_4", "kF4"),
    newKeyBind("quit", "kESCAPE"),
    newKeyBind("right", "kRIGHT"),
    newKeyBind("rlookout", "kE"),
    newKeyBind("rstrafe", "kD"),
    newKeyBind("scores", "kTAB"),
    newKeyBind("screenshot", "kF12"),
    newKeyBind("skin_menu", "kO"),
    newKeyBind("speech_menu_0", "kC"),
    newKeyBind("speech_menu_1", "kZ"),
    newKeyBind("sprint_toggle", "kX"),
    newKeyBind("quick_save", "kF5"),
    newKeyBind("quick_load", "kF9"),
    newKeyBind("team_menu", "kU"),
    newKeyBind("torch", "kL"),
    newKeyBind("show_detector", "kO"),
    newKeyBind("up", "kUP"),
    newKeyBind("use", "kF"),
    newKeyBind("vote", "kF6"),
    newKeyBind("vote_begin", "kF5"),
    newKeyBind("vote_no", "kF8"),
    newKeyBind("vote_yes", "kF7"),
    newKeyBind("wpn_1", "k1"),
    newKeyBind("wpn_2", "k2"),
    newKeyBind("wpn_3", "k3"),
    newKeyBind("wpn_4", "k4"),
    newKeyBind("wpn_5", "k5"),
    newKeyBind("wpn_6", "k6"),
    newKeyBind("wpn_fire", "mouse1"),
    newKeyBind("wpn_firemode_next", "k0"),
    newKeyBind("wpn_firemode_prev", "k9"),
    newKeyBind("wpn_func", "kV"),
    newKeyBind("wpn_next", "kY"),
    newKeyBind("wpn_reload", "kR"),
    newKeyBind("wpn_zoom", "mouse2"),
    newKeyBind("night_vision", "kN"),
  ],
};
