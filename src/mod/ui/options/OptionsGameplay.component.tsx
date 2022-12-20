import { JSXNode, JSXXML } from "jsx-xml";

export function OptionsGameplay(): JSXNode {
  return (
    <tab_gameplay>
      <cap_difficulty x="12" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_difficulty
        </text>
      </cap_difficulty>

      <list_difficulty x="140" y="5" width="188" height="20">
        <options_item entry="g_game_difficulty" group="mm_opt_gameplay" />
        <list_font r="170" g="170" b="170" font="letterica16" />
        <text_color>
          <e r="170" g="170" b="170" />
          <d r="70" g="70" b="70" />
        </text_color>
      </list_difficulty>

      <cap_check_crosshair x="12" y="33" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_show_crosshair
        </text>
      </cap_check_crosshair>
      <check_crosshair x="129" y="30" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="hud_crosshair" group="mm_opt_gameplay" />
      </check_crosshair>

      <cap_check_dyn_crosshair x="12" y="63" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_dyn_crosshair
        </text>
      </cap_check_dyn_crosshair>
      <check_dyn_crosshair x="129" y="60" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="cl_dynamiccrosshair" group="mm_opt_gameplay" />
      </check_dyn_crosshair>

      <cap_check_show_weapon x="12" y="93" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_show_weapon
        </text>
      </cap_check_show_weapon>
      <check_show_weapon x="129" y="90" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="hud_weapon" group="mm_opt_gameplay" />
      </check_show_weapon>

      <cap_check_dist x="12" y="123" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_crosshair_distance
        </text>
      </cap_check_dist>
      <check_dist x="129" y="120" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="hud_crosshair_dist" group="mm_opt_gameplay" />
      </check_dist>

      <cap_check_tips x="12" y="153" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_tips
        </text>
      </cap_check_tips>
      <check_tips x="129" y="150" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="hud_info" group="mm_opt_gameplay" />
      </check_tips>

      <cap_check_crouch_toggle x="12" y="183" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_crouch_toggle
        </text>
      </cap_check_crouch_toggle>
      <check_crouch_toggle x="129" y="180" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="g_crouch_toggle" group="mm_opt_gameplay" />
      </check_crouch_toggle>

      <cap_check_important_save x="12" y="213" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_important_save
        </text>
      </cap_check_important_save>
      <check_important_save x="129" y="210" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="g_important_save" group="mm_opt_gameplay" />
      </check_important_save>

      <cap_check_hud_draw x="12" y="243" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_st_disable_hud
        </text>
      </cap_check_hud_draw>
      <check_hud_draw x="129" y="240" width="35" height="29" stretch="1">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="hud_draw" group="mm_opt_gameplay" />
      </check_hud_draw>

      <btn_check_updates x="270" y="322" width="86" height="24" stretch="1">
        <text align="c" font="letterica16">
          ui_mm_check_updates
        </text>
        <texture>ui_inGame2_button</texture>
        <text_color>
          <e r="210" g="210" b="210" />
        </text_color>
      </btn_check_updates>
    </tab_gameplay>
  );
}
