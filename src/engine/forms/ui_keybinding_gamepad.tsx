import { JSXNode, JSXXML } from "jsx-xml";

/**
 * Create kebindings form for gamepad.
 */
export function create(): JSXNode {
  return (
    <keybinding>
      <group name={"kb_grp_direction"}>
        <command id={"gp_look_around"} exe={"look_around"} />
      </group>
      <group name={"kb_grp_movement"}>
        <command id={"gp_move_around"} exe={"move_around"} />
        <command id={"kb_jump"} exe={"jump"} />
        <command id={"kb_crouch"} exe={"crouch_toggle"} />
      </group>
      <group name={"kb_grp_weapons"}>
        <command id={"kb_fire"} exe={"wpn_fire"} />
        <command id={"kb_zoom"} exe={"wpn_zoom"} />
        <command id={"kb_reload"} exe={"wpn_reload"} />
        <command id={"kb_firemode_next"} exe={"wpn_firemode_next"} />
        <command id={"kb_firemode_prev"} exe={"wpn_firemode_prev"} />
        <command id={"kb_func"} exe={"wpn_func"} />
      </group>
      <group name={"kb_grp_inventory"}>
        <command id={"kb_inventory"} exe={"inventory"} />
        <command id={"kb_active_jobs"} exe={"active_jobs"} />
        <command id={"kb_torch"} exe={"torch"} />
        <command id={"kb_detector"} exe={"show_detector"} />
        <command id={"kb_quick_use_1"} exe={"quick_use_1"} />
        <command id={"kb_quick_use_2"} exe={"quick_use_2"} />
        <command id={"kb_quick_use_3"} exe={"quick_use_3"} />
        <command id={"kb_quick_use_4"} exe={"quick_use_4"} />
        <command id={"kb_drop"} exe={"drop"} />
      </group>
      <group name={"kb_grp_common"}>
        <command id={"kb_use"} exe={"use"} />
        <command id={"kb_screenshot"} exe={"screenshot"} />
        <command id={"kb_enter"} exe={"enter"} />
        <command id={"kb_quit"} exe={"quit"} />
        <command id={"ui_mm_save_game"} exe={"quick_save"} />
        <command id={"ui_mm_load_game"} exe={"quick_load"} />
      </group>
      <group name={"kb_grp_multiplayer"}>
        <command id={"kb_artefact"} exe={"artefact"} />
        <command id={"kb_scores"} exe={"scores"} />
        <command id={"kb_chat"} exe={"chat"} />
        <command id={"kb_chat_team"} exe={"chat_team"} />
        <command id={"kb_buy_menu"} exe={"buy_menu"} />
        <command id={"kb_skin_menu"} exe={"skin_menu"} />
        <command id={"kb_team_menu"} exe={"team_menu"} />
        <command id={"kb_vote_begin"} exe={"vote_begin"} />
        <command id={"kb_vote_menu"} exe={"vote"} />
        <command id={"kb_vote_yes"} exe={"vote_yes"} />
        <command id={"kb_vote_no"} exe={"vote_no"} />
        <command id={"speech_menu_group"} exe={"speech_menu_0"} />
        <command id={"speech_menu_personal"} exe={"speech_menu_1"} />
      </group>
    </keybinding>
  );
}
