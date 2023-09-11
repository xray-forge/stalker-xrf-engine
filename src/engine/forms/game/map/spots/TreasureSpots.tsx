import { Fragment, JSXNode, JSXXML } from "jsx-xml";

/**
 * Build treasure spots marks for minimap/map.
 */
export function TreasureSpots(): JSXNode {
  return (
    <Fragment>
      <treasure hint="st_ui_pda_secret">
        <level_map spot="treasure_spot" pointer="quest_pointer" />
        <mini_map spot="treasure_spot_mini" />
      </treasure>

      <treasure_spot width="20" height="20" alignment="c" stretch="1">
        {/**
         <!-- scale="1" scale_min="1.1" scale_max="3.1" light_anim="map_spot_secrets" la_cyclic="0"
         la_texture="1" la_text="0" la_alpha="1"-->
          */}
        <texture>ui_inGame2_PDA_icon_secret</texture>
      </treasure_spot>

      <treasure_spot_mini width="17" height="17" alignment="c" stretch="1">
        <texture>ui_inGame2_PDA_icon_secret</texture>
      </treasure_spot_mini>

      <treasure_rare hint="st_ui_pda_secret">
        <level_map spot="treasure_rare_spot" pointer="quest_pointer" />
        <mini_map spot="treasure_rare_spot_mini" />
      </treasure_rare>

      <treasure_rare_spot width="20" height="20" alignment="c" stretch="1">
        {/**
         <!-- scale="1" scale_min="1.1" scale_max="3.1" light_anim="map_spot_secrets" la_cyclic="0"
         la_texture="1" la_text="0" la_alpha="1"-->
          */}
        <texture>ui_inGame2_PDA_icon_secret_rare</texture>
      </treasure_rare_spot>

      <treasure_rare_spot_mini width="17" height="17" alignment="c" stretch="1">
        <texture>ui_inGame2_PDA_icon_secret_rare</texture>
      </treasure_rare_spot_mini>

      <treasure_epic hint="st_ui_pda_secret">
        <level_map spot="treasure_epic_spot" pointer="quest_pointer" />
        <mini_map spot="treasure_epic_spot_mini" />
      </treasure_epic>

      <treasure_epic_spot width="20" height="20" alignment="c" stretch="1">
        {/**
         <!-- scale="1" scale_min="1.1" scale_max="3.1" light_anim="map_spot_secrets" la_cyclic="0"
         la_texture="1" la_text="0" la_alpha="1"-->
          */}
        <texture>ui_inGame2_PDA_icon_secret_epic</texture>
      </treasure_epic_spot>

      <treasure_epic_spot_mini width="17" height="17" alignment="c" stretch="1">
        <texture>ui_inGame2_PDA_icon_secret_epic</texture>
      </treasure_epic_spot_mini>
    </Fragment>
  );
}
