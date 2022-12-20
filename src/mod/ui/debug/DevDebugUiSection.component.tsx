import { JSXNode, JSXXML } from "jsx-xml";

import { fonts } from "@/mod/globals/fonts";
import { textures } from "@/mod/globals/textures";
import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { IRgbColor } from "@/mod/lib/types";
import { XrEditBox, XrStatic } from "@/mod/ui/components/base";
import { XrListRenderer } from "@/mod/ui/components/base/XrListRenderer.component";

export const IS_XML: boolean = true;

export function create(): JSXNode {
  const BASE_WIDTH: number = gameConfig.UI.BASE_WIDTH;
  const BASE_HEIGHT: number = gameConfig.UI.BASE_HEIGHT;

  const PADDING_LEFT: number = 20;
  const LIST_WIDTH = BASE_WIDTH * 0.9;
  const BODY_WIDTH: number = LIST_WIDTH - PADDING_LEFT * 2;
  const DEFAULT_SPACING: number = 12;

  const TEXT_COLOR: IRgbColor = { r: 240, g: 217, b: 182 };

  return (
    <w>
      <background></background>

      <section x={0} y={0} width={LIST_WIDTH} height={BASE_HEIGHT * 0.75}>
        <XrEditBox
          tag={"textures_list_filter"}
          x={PADDING_LEFT}
          y={12}
          width={BODY_WIDTH}
          height={24}
          font={fonts.letterica18}
          texture={textures.ui_inGame2_edit_box_2}
          color={TEXT_COLOR}
          vertAlign={"c"}
        />

        <XrListRenderer
          tag={"textures_list"}
          x={PADDING_LEFT}
          y={12 + 24 + DEFAULT_SPACING}
          width={BODY_WIDTH}
          height={24}
        />

        <XrStatic
          tag={"textures_picture_square_big"}
          x={PADDING_LEFT}
          y={44 + 24 + DEFAULT_SPACING}
          width={400}
          height={400}
          texture={textures.ui_ui_noise}
        />

        <XrStatic
          tag={"textures_picture_square_medium"}
          x={PADDING_LEFT + 400 + DEFAULT_SPACING}
          y={44 + 24 + DEFAULT_SPACING}
          width={200}
          height={200}
          texture={textures.ui_ui_noise}
        />

        <XrStatic
          tag={"textures_picture_square_small"}
          x={PADDING_LEFT + 400 + DEFAULT_SPACING + 200 + DEFAULT_SPACING}
          y={44 + 24 + DEFAULT_SPACING}
          width={100}
          height={100}
          texture={textures.ui_ui_noise}
        />

        <XrStatic
          tag={"textures_picture_square_mini"}
          x={PADDING_LEFT + 400 + DEFAULT_SPACING + 200 + DEFAULT_SPACING + 100 + DEFAULT_SPACING}
          y={44 + 24 + DEFAULT_SPACING}
          width={12}
          height={12}
          texture={textures.ui_ui_noise}
        />

        <XrStatic
          tag={"textures_picture_line"}
          x={
            PADDING_LEFT + 400 + DEFAULT_SPACING + 200 + DEFAULT_SPACING + 100 + DEFAULT_SPACING + 12 + DEFAULT_SPACING
          }
          y={44 + 24 + DEFAULT_SPACING}
          width={80}
          height={16}
          texture={textures.ui_ui_noise}
        />
      </section>
    </w>
  );
}
