import { JSXNode, JSXXML } from "jsx-xml";

/**
 * todo;
 */
export function OptionsGameplay(): JSXNode {
  return (
    <tab_gameplay>
      <templ_item width="360" height="30" />

      <scroll_v
        x="-4"
        y="0"
        width="360"
        height="320"
        right_ident="0"
        left_ident="0"
        top_indent="0"
        bottom_indent="0"
        vert_interval="0"
        always_show_scroll="0"
      />

      <cap_difficulty x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_difficulty
        </text>
      </cap_difficulty>

      <list_difficulty x="144" y="5" width="188" height="20">
        <options_item entry="g_game_difficulty" group="mm_opt_gameplay" />
        <list_font r="170" g="170" b="170" font="letterica16" />
        <text_color>
          <e r="170" g="170" b="170" />
          <d r="70" g="70" b="70" />
        </text_color>
      </list_difficulty>

      <cap_localization x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_localization
        </text>
      </cap_localization>
      <list_localization x="144" y="5" width="188" height="20">
        <options_item entry="g_language" group="mm_opt_gameplay" />
        <list_font r="170" g="170" b="170" font="letterica16" />
        <text_color>
          <e r="170" g="170" b="170" />
          <d r="70" g="70" b="70" />
        </text_color>
      </list_localization>

      <cap_check_crosshair x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_show_crosshair
        </text>
      </cap_check_crosshair>
      <check_crosshair x="133" y="0" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="hud_crosshair" group="mm_opt_gameplay" />
      </check_crosshair>

      <cap_check_dyn_crosshair x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_dyn_crosshair
        </text>
      </cap_check_dyn_crosshair>

      <check_dyn_crosshair x="133" y="0" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="cl_dynamiccrosshair" group="mm_opt_gameplay" />
      </check_dyn_crosshair>

      <cap_check_show_weapon x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_show_weapon
        </text>
      </cap_check_show_weapon>

      <check_show_weapon x="133" y="0" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="hud_weapon" group="mm_opt_gameplay" />
      </check_show_weapon>

      <cap_check_dist x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_crosshair_distance
        </text>
      </cap_check_dist>

      <check_dist x="133" y="0" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="hud_crosshair_dist" group="mm_opt_gameplay" />
      </check_dist>

      <cap_check_tips x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_tips
        </text>
      </cap_check_tips>

      <check_tips x="133" y="0" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="hud_info" group="mm_opt_gameplay" />
      </check_tips>

      <cap_check_crouch_toggle x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_crouch_toggle
        </text>
      </cap_check_crouch_toggle>

      <check_crouch_toggle x="133" y="0" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="g_crouch_toggle" group="mm_opt_gameplay" />
      </check_crouch_toggle>

      <cap_check_important_save x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_important_save
        </text>
      </cap_check_important_save>

      <check_important_save x="133" y="0" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="g_important_save" group="mm_opt_gameplay" />
      </check_important_save>

      <cap_check_hud_draw x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_st_disable_hud
        </text>
      </cap_check_hud_draw>

      <check_hud_draw x="133" y="0" width="35" height="29" stretch="1">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="hud_draw" group="mm_opt_gameplay" />
      </check_hud_draw>

      <cap_check_simplified_item_pickup x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_simplified_item_pickup
        </text>
      </cap_check_simplified_item_pickup>

      <check_simplified_item_pickup x="133" y="0" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="cl_cod_pickup_mode" group="mm_opt_gameplay" is_integer="1" />
      </check_simplified_item_pickup>

      <cap_check_multi_item_pickup x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          ui_mm_multi_item_pickup
        </text>
      </cap_check_multi_item_pickup>

      <check_multi_item_pickup x="133" y="0" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="g_multi_item_pickup" group="mm_opt_gameplay" />
      </check_multi_item_pickup>

      <cap_unload_after_pickup x="16" y="3" width="108" height="24">
        <text r="170" g="170" b="170" font="letterica16" align="r" vert_align="c">
          st_unload_magazine_after_pickup
        </text>
      </cap_unload_after_pickup>

      <unload_after_pickup x="133" y="0" width="35" stretch="1" height="29">
        <texture>ui_inGame2_checkbox</texture>
        <options_item entry="g_unload_ammo_after_pick_up" group="mm_opt_gameplay" is_integer="1" />
      </unload_after_pickup>
    </tab_gameplay>
  );
}
