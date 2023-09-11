import { JSXNode, JSXXML } from "jsx-xml";

import { MapMultiplayerSpots } from "@/engine/forms/game/map/spots/MapMultiplayerSpots";
import { MapRelationSpots } from "@/engine/forms/game/map/spots/MapRelationSpots";
import { SmartTerrainSpots } from "@/engine/forms/game/map/spots/SmartTerrainSpots";
import { SquadSpots } from "@/engine/forms/game/map/spots/SquadSpots";
import { TaskSpots } from "@/engine/forms/game/map/spots/TaskSpots";
import { TreasureSpots } from "@/engine/forms/game/map/spots/TreasureSpots";

/**
 * todo;
 */
export function MapSpots(): JSXNode {
  return (
    <map_spots>
      <MapMultiplayerSpots />
      <MapRelationSpots />
      <SmartTerrainSpots />
      <SquadSpots />
      <TaskSpots />
      <TreasureSpots />

      <quest_pointer x="0" y="0" width="11" height="24" heading="1" alignment="c">
        <texture a="255" r="255" g="255" b="255">
          ui_hud_map_arrow
        </texture>
      </quest_pointer>
      <quest_pointer2 x="0" y="0" width="11" height="24" heading="1" alignment="c">
        <texture a="255" r="242" g="231" b="11">
          ui_hud_map_arrow
        </texture>
      </quest_pointer2>

      <quest_pointer_small x="0" y="0" width="5" height="12" heading="1" alignment="c">
        <texture a="255">ui_hud_map_arrow</texture>
      </quest_pointer_small>
      <combat_pointer x="0" y="0" width="11" height="24" heading="1" alignment="c">
        <texture a="255" color="red">
          ui_hud_map_arrow
        </texture>
      </combat_pointer>

      <crlc_big>
        <level_map spot="crlc_big_spot" pointer="quest_pointer" />
      </crlc_big>
      <crlc_big_spot
        x="0"
        y="0"
        width="115"
        height="115"
        alignment="c"
        scale="1"
        scale_min="1"
        scale_max="3"
        stretch="1"
      >
        <texture x="730" y="456" width="115" height="115">
          ui\ui_common
        </texture>
      </crlc_big_spot>

      <crlc_mdl>
        <level_map spot="crlc_mdl_spot" pointer="quest_pointer" />
      </crlc_mdl>
      <crlc_mdl_spot x="0" y="0" width="62" height="62" alignment="c" scale="1" scale_min="1" scale_max="3" stretch="1">
        <texture x="858" y="392" width="62" height="62">
          ui\ui_common
        </texture>
      </crlc_mdl_spot>

      <crlc_small>
        <level_map spot="crlc_small_spot" pointer="quest_pointer" />
      </crlc_small>
      <crlc_small_spot
        x="0"
        y="0"
        width="31"
        height="31"
        alignment="c"
        scale="1"
        scale_min="1"
        scale_max="3"
        stretch="1"
      >
        <texture x="633" y="789" width="31" height="31">
          ui\ui_common
        </texture>
      </crlc_small_spot>

      <blue_location>
        <level_map spot="blue_spot" pointer="quest_pointer" />
        <mini_map spot="blue_mini_spot" pointer="quest_pointer" />
      </blue_location>
      <blue_spot
        x="0"
        y="0"
        width="32"
        height="32"
        stretch="1"
        alignment="c"
        xform_anim="map_spot_new_xform"
        xform_anim_cyclic="0"
      >
        <texture>ui_icons_mapPDA_persBig_e</texture>
      </blue_spot>
      <blue_mini_spot
        x="0"
        y="0"
        width="11"
        height="11"
        stretch="1"
        alignment="c"
        xform_anim="map_spot_new_xform"
        xform_anim_cyclic="0"
      >
        <texture>ui_icons_newPDA_SmallBlue</texture>
        <texture_below r="255" g="255" b="255">
          ui_mini_sn_spot_below
        </texture_below>
        <texture_above r="255" g="255" b="255">
          ui_mini_sn_spot_above
        </texture_above>
      </blue_mini_spot>

      <green_location>
        <level_map spot="green_spot" pointer="quest_pointer" />
        <mini_map spot="green_mini_spot" pointer="quest_pointer" />
      </green_location>
      <green_spot
        x="0"
        y="0"
        width="32"
        height="32"
        stretch="1"
        alignment="c"
        xform_anim="map_spot_new_xform"
        xform_anim_cyclic="0"
      >
        <texture>ui_icons_mapPDA_persBig_h</texture>
      </green_spot>
      <green_mini_spot
        x="0"
        y="0"
        width="11"
        height="11"
        stretch="1"
        alignment="c"
        xform_anim="map_spot_new_xform"
        xform_anim_cyclic="0"
      >
        <texture>ui_icons_newPDA_SmallGreen</texture>
        <texture_below r="0" g="255" b="0">
          ui_mini_sn_spot_below
        </texture_below>
        <texture_above r="0" g="255" b="0">
          ui_mini_sn_spot_above
        </texture_above>
      </green_mini_spot>

      <red_location>
        <level_map spot="red_spot" pointer="quest_pointer" />
        <mini_map spot="red_mini_spot" pointer="quest_pointer" />
      </red_location>
      <red_spot
        x="0"
        y="0"
        width="32"
        height="32"
        stretch="1"
        alignment="c"
        xform_anim="map_spot_new_xform"
        xform_anim_cyclic="0"
      >
        <texture>ui_icons_mapPDA_mark_t</texture>
      </red_spot>
      <red_mini_spot
        x="0"
        y="0"
        width="11"
        height="11"
        stretch="1"
        alignment="c"
        xform_anim="map_spot_new_xform"
        xform_anim_cyclic="0"
      >
        <texture>ui_icons_newPDA_SmallRed</texture>
        <texture_below r="255" g="0" b="0">
          ui_mini_sn_spot_below
        </texture_below>
        <texture_above r="255" g="0" b="0">
          ui_mini_sn_spot_above
        </texture_above>
      </red_mini_spot>

      <level_map_spot_border
        x="0"
        y="0"
        width="37"
        height="37"
        alignment="c"
        stretch="1"
        xform_anim="map_spot_border_xform"
        xform_anim_cyclic="1"
      >
        <texture a="0">ui_pda2_hl_quest_base</texture>
      </level_map_spot_border>

      <mini_map_spot_border
        x="0"
        y="0"
        width="18"
        height="18"
        alignment="c"
        stretch="1"
        xform_anim="map_spot_border_xform"
        xform_anim_cyclic="1"
      >
        <texture a="0">ui_pda2_hl_quest_base</texture>
      </mini_map_spot_border>

      <complex_map_spot_border
        x="0"
        y="0"
        width="37"
        height="37"
        alignment="c"
        stretch="1"
        xform_anim="map_spot_border_xform"
        xform_anim_cyclic="1"
      >
        <texture a="0">ui_pda2_hl_quest_base</texture>
      </complex_map_spot_border>

      <actor_location hint="disable_hint">
        <level_map spot="actor_level_spot" />
      </actor_location>
      <actor_level_spot x="0" y="0" width="25" height="25" alignment="c" location_level="-1">
        <texture>ui_icons_newPDA_man</texture>
      </actor_level_spot>

      <actor_location_p hint="disable_hint">
        <level_map spot="actor_level_spot_p" />
      </actor_location_p>
      <actor_level_spot_p x="0" y="0" width="49" height="49" heading="1" alignment="c" location_level="-2">
        <texture>ui_icons_newPDA_manArrow</texture>
      </actor_level_spot_p>

      <level_changer_up>
        <level_map spot="level_changer_up_spot" pointer="quest_pointer" />
      </level_changer_up>
      <level_changer_up_spot x="0" y="0" width="19" height="21" alignment="c" location_level="1" heading_angle="1">
        <texture r="10" g="250" b="250">
          ui_pda2_exit_point
        </texture>
      </level_changer_up_spot>

      <level_changer_up_right>
        <level_map spot="level_changer_up_right_spot" pointer="quest_pointer" />
      </level_changer_up_right>
      <level_changer_up_right_spot
        x="0"
        y="0"
        width="19"
        height="21"
        alignment="c"
        location_level="1"
        heading_angle="-45"
      >
        <texture r="10" g="250" b="250">
          ui_pda2_exit_point
        </texture>
      </level_changer_up_right_spot>

      <level_changer_right>
        <level_map spot="level_changer_right_spot" pointer="quest_pointer" />
      </level_changer_right>
      <level_changer_right_spot x="0" y="0" width="19" height="21" alignment="c" location_level="1" heading_angle="-90">
        <texture r="10" g="250" b="250">
          ui_pda2_exit_point
        </texture>
      </level_changer_right_spot>

      <level_changer_right_down>
        <level_map spot="level_changer_right_down_spot" pointer="quest_pointer" />
      </level_changer_right_down>
      <level_changer_right_down_spot
        x="0"
        y="0"
        width="19"
        height="21"
        alignment="c"
        location_level="1"
        heading_angle="-135"
      >
        <texture r="10" g="250" b="250">
          ui_pda2_exit_point
        </texture>
      </level_changer_right_down_spot>

      <level_changer_down>
        <level_map spot="level_changer_down_spot" pointer="quest_pointer" />
      </level_changer_down>
      <level_changer_down_spot x="0" y="0" width="19" height="21" alignment="c" location_level="1" heading_angle="180">
        <texture r="10" g="250" b="250">
          ui_pda2_exit_point
        </texture>
      </level_changer_down_spot>

      <level_changer_down_left>
        <level_map spot="level_changer_down_left_spot" pointer="quest_pointer" />
      </level_changer_down_left>
      <level_changer_down_left_spot
        x="0"
        y="0"
        width="19"
        height="21"
        alignment="c"
        location_level="1"
        heading_angle="135"
      >
        <texture r="10" g="250" b="250">
          ui_pda2_exit_point
        </texture>
      </level_changer_down_left_spot>

      <level_changer_left>
        <level_map spot="level_changer_left_spot" pointer="quest_pointer" />
      </level_changer_left>
      <level_changer_left_spot x="0" y="0" width="19" height="21" alignment="c" location_level="1" heading_angle="90">
        <texture r="10" g="250" b="250">
          ui_pda2_exit_point
        </texture>
      </level_changer_left_spot>

      <level_changer_left_up>
        <level_map spot="level_changer_left_up_spot" pointer="quest_pointer" />
      </level_changer_left_up>
      <level_changer_left_up_spot
        x="0"
        y="0"
        width="19"
        height="21"
        alignment="c"
        location_level="1"
        heading_angle="45"
      >
        <texture r="10" g="250" b="250">
          ui_pda2_exit_point
        </texture>
      </level_changer_left_up_spot>

      <alife_combat_fight>
        <level_map spot="alife_combat_fight_spot" pointer="combat_pointer" />
        <mini_map spot="alife_combat_fight_spot_mini" />
      </alife_combat_fight>
      <alife_combat_fight_spot
        x="0"
        y="0"
        width="5"
        height="5"
        alignment="c"
        stretch="1"
        scale="1"
        scale_min="1"
        scale_max="3"
      >
        <texture>ui_mapQuest_gold</texture>
      </alife_combat_fight_spot>
      <alife_combat_fight_spot_mini
        x="0"
        y="0"
        width="15"
        height="15"
        alignment="c"
        stretch="1"
        scale="1"
        scale_min="1"
        scale_max="3"
      >
        <texture>ui_sm_mapQuest_gold</texture>
      </alife_combat_fight_spot_mini>

      <alife_combat_help>
        <level_map spot="alife_combat_help_spot" pointer="combat_pointer" />
        <mini_map spot="alife_combat_help_spot_mini" />
      </alife_combat_help>
      <alife_combat_help_spot
        x="0"
        y="0"
        width="5"
        height="5"
        alignment="c"
        stretch="1"
        scale="1"
        scale_min="1"
        scale_max="3"
      >
        <texture>ui_mapQuest_gold</texture>
      </alife_combat_help_spot>
      <alife_combat_help_spot_mini
        x="0"
        y="0"
        width="15"
        height="15"
        alignment="c"
        stretch="1"
        scale="1"
        scale_min="1"
        scale_max="3"
      >
        <texture>ui_sm_mapQuest_gold</texture>
      </alife_combat_help_spot_mini>

      <alife_combat_attack>
        <level_map spot="alife_combat_attack_spot" pointer="combat_pointer" />
        <mini_map spot="alife_combat_attack_spot_mini" />
      </alife_combat_attack>
      <alife_combat_attack_spot
        x="0"
        y="0"
        width="5"
        height="5"
        alignment="c"
        stretch="1"
        scale="1"
        scale_min="1"
        scale_max="3"
      >
        <texture>ui_mapQuest_gold</texture>
      </alife_combat_attack_spot>
      <alife_combat_attack_spot_mini
        x="0"
        y="0"
        width="15"
        height="15"
        alignment="c"
        stretch="1"
        scale="1"
        scale_min="1"
        scale_max="3"
      >
        <texture>ui_sm_mapQuest_gold</texture>
      </alife_combat_attack_spot_mini>

      {/** <!-- Новые мапспоты для симуляции --> */}
      <alife_combat>
        <level_map spot="alife_combat_spot" />
      </alife_combat>
      <alife_combat_spot
        x="0"
        y="0"
        width="32"
        height="32"
        alignment="c"
        stretch="1"
        scale_min="1"
        scale_max="3"
        scale="1"
      >
        <texture>ui_alife_combat</texture>
      </alife_combat_spot>

      <debug_stalker hint="invalid hint">
        <level_map spot="debug_stalker_spot" />
      </debug_stalker>

      <debug_stalker_spot width="3" height="3" alignment="c">
        <texture r="50" g="255" b="0">
          ui_minimap_point
        </texture>
      </debug_stalker_spot>

      {/** <!-- Группировки --> */}
      <alife_presentation_faction_duty>
        <level_map spot="alife_presentation_faction_duty_spot" />
      </alife_presentation_faction_duty>
      <alife_presentation_faction_duty_spot
        x="0"
        y="0"
        width="27"
        height="27"
        alignment="c"
        stretch="1"
        scale_min="1"
        scale_max="3"
        scale="1"
      >
        <texture x="720" y="630" width="128" height="128" r="0" g="0" b="255">
          ui\ui_common
        </texture>
      </alife_presentation_faction_duty_spot>

      <alife_presentation_faction_dolg>
        <level_map spot="alife_presentation_faction_dolg_spot" />
      </alife_presentation_faction_dolg>
      <alife_presentation_faction_dolg_spot
        x="0"
        y="0"
        width="27"
        height="27"
        alignment="c"
        stretch="1"
        scale_min="1"
        scale_max="3"
        scale="1"
      >
        <texture x="720" y="630" width="128" height="128" r="0" g="0" b="255">
          ui\ui_common
        </texture>
      </alife_presentation_faction_dolg_spot>

      <alife_presentation_faction_freedom>
        <level_map spot="alife_presentation_faction_freedom_spot" />
      </alife_presentation_faction_freedom>
      <alife_presentation_faction_freedom_spot
        x="0"
        y="0"
        width="27"
        height="27"
        alignment="c"
        stretch="1"
        scale_min="1"
        scale_max="3"
        scale="1"
      >
        <texture x="720" y="630" width="128" height="128" r="128" g="255" b="0">
          ui\ui_common
        </texture>
      </alife_presentation_faction_freedom_spot>

      <alife_presentation_faction_bandit>
        <level_map spot="alife_presentation_faction_bandit_spot" />
      </alife_presentation_faction_bandit>
      <alife_presentation_faction_bandit_spot
        x="0"
        y="0"
        width="27"
        height="27"
        alignment="c"
        stretch="1"
        scale_min="1"
        scale_max="3"
        scale="1"
      >
        <texture x="720" y="630" width="128" height="128" r="255" g="255" b="0">
          ui\ui_common
        </texture>
      </alife_presentation_faction_bandit_spot>

      <alife_presentation_faction_killer>
        <level_map spot="alife_presentation_faction_killer_spot" />
      </alife_presentation_faction_killer>
      <alife_presentation_faction_killer_spot
        x="0"
        y="0"
        width="27"
        height="27"
        alignment="c"
        stretch="1"
        scale_min="1"
        scale_max="3"
        scale="1"
      >
        <texture x="720" y="630" width="128" height="128" r="0" g="128" b="128">
          ui\ui_common
        </texture>
      </alife_presentation_faction_killer_spot>

      <alife_presentation_faction_army>
        <level_map spot="alife_presentation_faction_army_spot" />
      </alife_presentation_faction_army>
      <alife_presentation_faction_army_spot
        x="0"
        y="0"
        width="27"
        height="27"
        alignment="c"
        stretch="1"
        scale_min="1"
        scale_max="3"
        scale="1"
      >
        <texture x="720" y="630" width="128" height="128" r="128" g="128" b="0">
          ui\ui_common
        </texture>
      </alife_presentation_faction_army_spot>

      <alife_presentation_faction_monster>
        <level_map spot="alife_presentation_faction_monster_spot" />
      </alife_presentation_faction_monster>
      <alife_presentation_faction_monster_spot
        x="0"
        y="0"
        width="27"
        height="27"
        alignment="c"
        stretch="1"
        scale_min="1"
        scale_max="3"
        scale="1"
      >
        <texture x="720" y="630" width="128" height="128" r="255" g="0" b="0">
          ui\ui_common
        </texture>
      </alife_presentation_faction_monster_spot>

      <alife_presentation_faction_zombied>
        <level_map spot="alife_presentation_faction_zombied_spot" />
      </alife_presentation_faction_zombied>
      <alife_presentation_faction_zombied_spot
        x="0"
        y="0"
        width="27"
        height="27"
        alignment="c"
        stretch="1"
        scale_min="1"
        scale_max="3"
        scale="1"
      >
        <texture x="720" y="630" width="128" height="128" r="255" g="128" b="0">
          ui\ui_common
        </texture>
      </alife_presentation_faction_zombied_spot>

      <alife_presentation_faction_stalker>
        <level_map spot="alife_presentation_faction_stalker_spot" />
      </alife_presentation_faction_stalker>
      <alife_presentation_faction_stalker_spot
        x="0"
        y="0"
        width="27"
        height="27"
        alignment="c"
        stretch="1"
        scale_min="1"
        scale_max="3"
        scale="1"
      >
        <texture x="720" y="630" width="128" height="128" r="255" g="128" b="255">
          ui\ui_common
        </texture>
      </alife_presentation_faction_stalker_spot>

      <alife_presentation_faction_monolith>
        <level_map spot="alife_presentation_faction_digger_spot" />
      </alife_presentation_faction_monolith>

      {/** <!-- level_spot --> */}
      <ui_pda2_mechanic_location hint="st_ui_pda_legend_mechanic">
        <level_map spot="ui_pda2_mechanic_location_spot" />
        <mini_map spot="ui_pda2_mechanic_location_mini_spot" />
      </ui_pda2_mechanic_location>
      <ui_pda2_mechanic_location_spot
        x="0"
        y="0"
        width="19"
        height="19"
        stretch="1"
        alignment="c"
        location_level="-1"
        scale_min="3"
      >
        <texture>ui_inGame2_PDA_icon_Stalker_machanik</texture>
      </ui_pda2_mechanic_location_spot>
      <ui_pda2_mechanic_location_mini_spot
        x="0"
        y="0"
        width="14"
        height="14"
        stretch="1"
        alignment="c"
        location_level="-1"
      >
        <texture>ui_inGame2_PDA_icon_Stalker_machanik_small</texture>
      </ui_pda2_mechanic_location_mini_spot>

      <ui_pda2_trader_location hint="st_ui_pda_legend_trader">
        <level_map spot="ui_pda2_trader_location_spot" />
        <mini_map spot="ui_pda2_trader_location_mini_spot" pointer="quest_pointer" />
      </ui_pda2_trader_location>
      <ui_pda2_trader_location_spot
        x="0"
        y="0"
        width="19"
        height="19"
        stretch="1"
        alignment="c"
        location_level="-1"
        scale_min="3"
      >
        <texture>ui_inGame2_PDA_icon_Stalker_Trader</texture>
      </ui_pda2_trader_location_spot>
      <ui_pda2_trader_location_mini_spot
        x="0"
        y="0"
        width="14"
        height="14"
        stretch="1"
        alignment="c"
        location_level="-1"
      >
        <texture>ui_inGame2_PDA_icon_Stalker_Trader_small</texture>
      </ui_pda2_trader_location_mini_spot>

      <ui_pda2_scout_location hint="st_ui_pda_legend_scout">
        <level_map spot="ui_pda2_scout_location_spot" />
        <mini_map spot="ui_pda2_scout_location_mini_spot" />
      </ui_pda2_scout_location>
      <ui_pda2_scout_location_spot
        x="0"
        y="0"
        width="19"
        height="19"
        stretch="1"
        alignment="c"
        location_level="-1"
        scale_min="3"
      >
        <texture>ui_inGame2_PDA_icon_Stalker_guide</texture>
      </ui_pda2_scout_location_spot>
      <ui_pda2_scout_location_mini_spot
        x="0"
        y="0"
        width="14"
        height="14"
        stretch="1"
        alignment="c"
        location_level="-1"
      >
        <texture>ui_inGame2_PDA_icon_Stalker_guide_small</texture>
      </ui_pda2_scout_location_mini_spot>

      <ui_pda2_quest_npc_location hint="st_ui_pda_legend_vip">
        <level_map spot="ui_pda2_quest_npc_location_spot" />
        <mini_map spot="ui_pda2_quest_npc_location_mini_spot" />
      </ui_pda2_quest_npc_location>
      <ui_pda2_quest_npc_location_spot
        x="0"
        y="0"
        width="19"
        height="19"
        stretch="1"
        alignment="c"
        location_level="-1"
        scale_min="3"
      >
        <texture>ui_inGame2_PDA_icon_Stalker_VIP</texture>
      </ui_pda2_quest_npc_location_spot>
      <ui_pda2_quest_npc_location_mini_spot
        x="0"
        y="0"
        width="14"
        height="14"
        stretch="1"
        alignment="c"
        location_level="-1"
      >
        <texture>ui_inGame2_PDA_icon_Stalker_VIP</texture>
      </ui_pda2_quest_npc_location_mini_spot>

      <ui_pda2_medic_location hint="st_ui_pda_legend_medic">
        <level_map spot="ui_pda2_medic_location_spot" />
        <mini_map spot="ui_pda2_medic_location_mini_spot" />
      </ui_pda2_medic_location>

      <ui_pda2_medic_location_spot
        x="0"
        y="0"
        width="19"
        height="19"
        stretch="1"
        alignment="c"
        location_level="-1"
        scale_min="3"
      >
        <texture>ui_inGame2_PDA_icon_Stalker_Medic</texture>
      </ui_pda2_medic_location_spot>
      <ui_pda2_medic_location_mini_spot
        x="0"
        y="0"
        width="14"
        height="14"
        stretch="1"
        alignment="c"
        location_level="-1"
      >
        <texture>ui_inGame2_PDA_icon_Stalker_Medic_small</texture>
      </ui_pda2_medic_location_mini_spot>

      <ui_pda2_actor_box_location hint="st_ui_pda_actor_box">
        <level_map spot="ui_pda2_actor_box_location_spot" />
        <mini_map spot="ui_pda2_actor_box_location_mini_spot" />
      </ui_pda2_actor_box_location>
      <ui_pda2_actor_box_location_spot
        width="19"
        height="19"
        stretch="1"
        alignment="c"
        location_level="-1"
        scale_min="3"
      >
        <texture>ui_inGame2_PDA_icon_Actor_Box</texture>
      </ui_pda2_actor_box_location_spot>
      <ui_pda2_actor_box_location_mini_spot width="14" height="14" stretch="1" alignment="c" location_level="-1">
        <texture>ui_inGame2_PDA_icon_Actor_Box_small</texture>
      </ui_pda2_actor_box_location_mini_spot>

      <ui_pda2_actor_sleep_location hint="st_ui_pda_sleep_place">
        <level_map spot="ui_pda2_actor_sleep_location_spot" />
        <mini_map spot="ui_pda2_actor_sleep_location_mini_spot" />
      </ui_pda2_actor_sleep_location>
      <ui_pda2_actor_sleep_location_spot
        width="19"
        height="19"
        stretch="1"
        alignment="c"
        location_level="-1"
        scale_min="3"
      >
        <texture>ui_inGame2_PDA_icon_Place_to_rest</texture>
      </ui_pda2_actor_sleep_location_spot>
      <ui_pda2_actor_sleep_location_mini_spot width="14" height="14" stretch="1" alignment="c" location_level="-1">
        <texture>ui_inGame2_PDA_icon_Place_to_rest_small</texture>
      </ui_pda2_actor_sleep_location_mini_spot>

      <primary_object>
        <level_map spot="primary_object_spot" />
        {/** <!--                <mini_map spot="primary_object_spot_mini"/> --> */}
      </primary_object>
      <primary_object_spot
        width="15"
        height="15"
        stretch="1"
        alignment="c"
        location_level="-3"
        scale="1"
        scale_min="1"
        scale_max="6"
      >
        <texture>ui_inGame2_PDA_icon_location</texture>
      </primary_object_spot>
      {/**
        <!--
       <primary_object_spot_mini  x="0" y="0" width="15" height="15" stretch="1" alignment="c" location_level="5">
       <texture r="242" g="15" b="11">ui_mmap_quest</texture>
       </primary_object_spot_mini>
       -->
        */}
      <storyline_task_on_guider>
        <mini_map spot="storyline_task_on_guider_spot" />
      </storyline_task_on_guider>
      <storyline_task_on_guider_spot x="0" y="0" width="21" height="21" stretch="1" alignment="c" location_level="-1">
        <texture r="242" g="231" b="11">
          ui_pda2_stask_last_01
        </texture>
      </storyline_task_on_guider_spot>

      <secondary_task_on_guider>
        <mini_map spot="secondary_task_on_guider_spot" />
      </secondary_task_on_guider>
      <secondary_task_on_guider_spot x="0" y="0" width="21" height="21" stretch="1" alignment="c" location_level="-1">
        <texture>ui_pda2_stask_last_01</texture>
      </secondary_task_on_guider_spot>
    </map_spots>
  );
}
