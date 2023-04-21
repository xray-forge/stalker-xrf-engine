import { Fragment, JSXNode, JSXXML } from "jsx-xml";

export function SquadSpots(): JSXNode {
  return (
    <Fragment>
      <alife_presentation_squad_friend>
        <mini_map spot="alife_presentation_squad_friend_spot_mini" />
      </alife_presentation_squad_friend>

      <alife_presentation_squad_friend_debug>
        <level_map spot="alife_presentation_squad_friend_spot" />
        <mini_map spot="alife_presentation_squad_friend_spot_mini" />
      </alife_presentation_squad_friend_debug>

      <alife_presentation_squad_friend_spot
        x="0"
        y="0"
        width="11"
        height="11"
        alignment="c"
        stretch="1"
        location_level="10"
        scale_min="3.0"
        scale_max="5.1"
        scale="0"
      >
        <texture r="0" g="255" b="0">
          ui_pda2_squad_leader
        </texture>
      </alife_presentation_squad_friend_spot>
      <alife_presentation_squad_friend_spot_mini
        x="0"
        y="0"
        width="9"
        height="9"
        alignment="c"
        stretch="1"
        location_level="10"
        scale_min="3.0"
        scale_max="5.1"
        scale="0"
      >
        <texture r="0" g="255" b="0">
          ui_minimap_squad_leader
        </texture>
      </alife_presentation_squad_friend_spot_mini>

      <alife_presentation_squad_neutral>
        <mini_map spot="alife_presentation_squad_neutral_spot_mini" />
      </alife_presentation_squad_neutral>

      <alife_presentation_squad_neutral_debug>
        <level_map spot="alife_presentation_squad_neutral_spot" />
        <mini_map spot="alife_presentation_squad_neutral_spot_mini" />
      </alife_presentation_squad_neutral_debug>

      <alife_presentation_squad_neutral_spot
        x="0"
        y="0"
        width="11"
        height="11"
        alignment="c"
        stretch="1"
        location_level="10"
        scale_min="3.0"
        scale_max="5.1"
        scale="0"
      >
        <texture r="255" g="240" b="0">
          ui_pda2_squad_leader
        </texture>
      </alife_presentation_squad_neutral_spot>
      <alife_presentation_squad_neutral_spot_mini
        x="0"
        y="0"
        width="9"
        height="9"
        alignment="c"
        stretch="1"
        location_level="10"
        scale_min="3.0"
        scale_max="5.1"
        scale="0"
      >
        <texture r="255" g="240" b="0">
          ui_minimap_squad_leader
        </texture>
      </alife_presentation_squad_neutral_spot_mini>

      <alife_presentation_squad_enemy>
        <mini_map spot="alife_presentation_squad_enemy_spot_mini" />
      </alife_presentation_squad_enemy>

      <alife_presentation_squad_enemy_debug>
        <level_map spot="alife_presentation_squad_enemy_spot" />
        <mini_map spot="alife_presentation_squad_enemy_spot_mini" />
      </alife_presentation_squad_enemy_debug>

      <alife_presentation_squad_enemy_spot
        x="0"
        y="0"
        width="11"
        height="11"
        alignment="c"
        stretch="1"
        location_level="10"
        scale_min="3.0"
        scale_max="5.1"
        scale="0"
      >
        <texture r="237" g="28" b="36">
          ui_pda2_squad_leader
        </texture>
      </alife_presentation_squad_enemy_spot>
      <alife_presentation_squad_enemy_spot_mini
        x="0"
        y="0"
        width="9"
        height="9"
        alignment="c"
        stretch="1"
        location_level="10"
        scale_min="3.0"
        scale_max="5.1"
        scale="0"
      >
        <texture r="237" g="28" b="36">
          ui_minimap_squad_leader
        </texture>
      </alife_presentation_squad_enemy_spot_mini>

      <alife_presentation_squad_monster>
        <mini_map spot="alife_presentation_squad_monster_spot_mini" />
      </alife_presentation_squad_monster>

      <alife_presentation_squad_monster_debug>
        <level_map spot="alife_presentation_squad_monster_spot" />
        <mini_map spot="alife_presentation_squad_monster_spot_mini" />
      </alife_presentation_squad_monster_debug>

      <alife_presentation_squad_monster_spot
        x="0"
        y="0"
        width="11"
        height="11"
        alignment="c"
        stretch="1"
        location_level="10"
        scale_min="3.0"
        scale_max="5.1"
        scale="0"
      >
        <texture r="153" g="51" b="255">
          ui_pda2_squad_leader
        </texture>
      </alife_presentation_squad_monster_spot>
      <alife_presentation_squad_monster_spot_mini
        x="0"
        y="0"
        width="9"
        height="9"
        alignment="c"
        stretch="1"
        location_level="10"
        scale_min="3.0"
        scale_max="5.1"
        scale="0"
      >
        <texture r="153" g="51" b="255">
          ui_mmap_squad_leader
        </texture>
      </alife_presentation_squad_monster_spot_mini>

      {/** <!--
     <alife_presentation_squad_attack_point>
     <level_map spot="alife_presentation_squad_attack_point_spot"/>
     <mini_map spot="alife_presentation_squad_attack_point_spot_mini"/>
     </alife_presentation_squad_attack_point>
     <alife_presentation_squad_attack_point_spot x="0" y="0" width="11" height="11" alignment="c" stretch="1"
     scale_min="3.0" scale_max="5.1" scale="0" location_level="10">
     <texture r="0" g="0" b="255">ui_pda2_squad_leader</texture>
     </alife_presentation_squad_attack_point_spot>
     <alife_presentation_squad_attack_point_spot_mini x="0" y="0" width="9" height="9" alignment="c" stretch="1"
     scale_min="3.0" scale_max="5.1" scale="0" location_level="10">
     <texture r="0" g="0" b="255">ui_minimap_squad_leader</texture>
     </alife_presentation_squad_attack_point_spot_mini>

     <alife_presentation_enemy_squad_attack_point>
     <level_map spot="alife_presentation_enemy_squad_attack_point_spot"/>
     <mini_map spot="alife_presentation_enemy_squad_attack_point_spot_mini"/>
     </alife_presentation_enemy_squad_attack_point>
     <alife_presentation_enemy_squad_attack_point_spot x="0" y="0" width="11" height="11" alignment="c" stretch="1"
     scale_min="3.0" scale_max="5.1" scale="0" location_level="10">
     <texture r="255" g="100" b="100">ui_pda2_squad_leader</texture>
     </alife_presentation_enemy_squad_attack_point_spot>
     <alife_presentation_enemy_squad_attack_point_spot_mini x="0" y="0" width="9" height="9" alignment="c" stretch="1"
     scale_min="3.0" scale_max="5.1" scale="0" location_level="10">
     <texture r="255" g="100" b="100">ui_minimap_squad_leader</texture>
     </alife_presentation_enemy_squad_attack_point_spot_mini>

     <alife_presentation_neutral_squad_attack_point>
     <level_map spot="alife_presentation_neutral_squad_attack_point_spot"/>
     <mini_map spot="alife_presentation_neutral_squad_attack_point_spot_mini"/>
     </alife_presentation_neutral_squad_attack_point>
     <alife_presentation_neutral_squad_attack_point_spot x="0" y="0" width="11" height="11" alignment="c" stretch="1"
     scale_min="3.0" scale_max="5.1" scale="0" location_level="10">
     <texture r="255" g="255" b="100">ui_pda2_squad_leader</texture>
     </alife_presentation_neutral_squad_attack_point_spot>
     <alife_presentation_neutral_squad_attack_point_spot_mini x="0" y="0" width="9" height="9" alignment="c"
     stretch="1" scale_min="3.0" scale_max="5.1" scale="0" location_level="10">
     <texture r="255" g="255" b="100">ui_minimap_squad_leader</texture>
     </alife_presentation_neutral_squad_attack_point_spot_mini>

     <alife_presentation_friend_squad_attack_point>
     <level_map spot="alife_presentation_friend_squad_attack_point_spot"/>
     <mini_map spot="alife_presentation_friend_squad_attack_point_spot_mini"/>
     </alife_presentation_friend_squad_attack_point>
     <alife_presentation_friend_squad_attack_point_spot x="0" y="0" width="11" height="11" alignment="c" stretch="1"
     scale_min="3.0" scale_max="5.1" scale="0" location_level="10">
     <texture r="170" g="255" b="170">ui_pda2_squad_leader</texture>
     </alife_presentation_friend_squad_attack_point_spot>
     <alife_presentation_friend_squad_attack_point_spot_mini x="0" y="0" width="9" height="9" alignment="c" stretch="1"
     scale_min="3.0" scale_max="5.1" scale="0" location_level="10">
     <texture r="170" g="255" b="170">ui_minimap_squad_leader</texture>
     </alife_presentation_friend_squad_attack_point_spot_mini>
     -->*/}
    </Fragment>
  );
}
