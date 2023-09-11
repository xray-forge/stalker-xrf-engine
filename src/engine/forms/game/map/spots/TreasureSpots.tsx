import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import { XrElement } from "@/engine/forms/components/base/XrElement.component";
import { XrTexture } from "@/engine/forms/components/base/XrTexture.component";
import { TName, TStringId } from "@/engine/lib/types";

/**
 * Build treasure spots marks for minimap/map.
 */
export function TreasureSpots(): JSXNode {
  return (
    <Fragment>
      <TreasureSpot id={"treasure"} texture={"ui_inGame2_PDA_icon_secret"} />
      <TreasureSpot id={"treasure_rare"} texture={"ui_inGame2_PDA_icon_secret_rare"} />
      <TreasureSpot id={"treasure_epic"} texture={"ui_inGame2_PDA_icon_secret_epic"} />
      <TreasureSpot id={"treasure_unique"} texture={"ui_inGame2_PDA_icon_secret_unique"} />
    </Fragment>
  );
}

/**
 * Render treasure icon.
 */
function TreasureSpot({ id, texture }: { id: TStringId; texture: TName }): JSXNode {
  return (
    <Fragment>
      <XrElement tag={id} hint={"st_ui_pda_secret"}>
        <XrElement tag={"level_map"} spot={`${id}_spot`} pointer={"quest_pointer"} />
        <XrElement tag={"mini_map"} spot={`${id}_spot_mini`} />
      </XrElement>

      <XrElement tag={`${id}_spot`} width={20} height={20} alignment={"c"} stretch={true}>
        {/**
         <!-- scale="1" scale_min="1.1" scale_max="3.1" light_anim="map_spot_secrets" la_cyclic="0"
         la_texture="1" la_text="0" la_alpha="1"-->
          */}
        <XrTexture id={texture} />
      </XrElement>

      <XrElement tag={`${id}_spot_mini`} width={17} height={17} alignment={"c"} stretch={true}>
        <XrTexture id={texture} />
      </XrElement>
    </Fragment>
  );
}
