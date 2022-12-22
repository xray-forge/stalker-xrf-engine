import { JSXNode, JSXXML } from "jsx-xml";

import { fonts } from "@/mod/globals/fonts";
import { textures } from "@/mod/globals/textures";
import { IRgbColor } from "@/mod/lib/types";
import { XrEditBox, XrStatic } from "@/mod/ui/components/base";
import { XrListRenderer } from "@/mod/ui/components/base/XrListRenderer.component";
import { SECTION_HEIGHT, SECTION_WIDTH } from "@/mod/ui/debug/DevDebugDialog.component";

export const IS_XML: boolean = true;

const BASE_WIDTH: number = SECTION_WIDTH;
const BASE_HEIGHT: number = SECTION_HEIGHT;

export function create(): JSXNode {
  const DEFAULT_SPACING: number = 12;

  const TEXT_COLOR: IRgbColor = { r: 240, g: 217, b: 182 };

  return (
    <w>
      <section y={0} width={BASE_WIDTH} height={BASE_HEIGHT}>
        <XrEditBox
          tag={"textures_list_filter"}
          x={24}
          y={12}
          width={BASE_WIDTH - 48}
          height={24}
          font={fonts.letterica18}
          texture={textures.ui_inGame2_edit_box_2}
          color={TEXT_COLOR}
          vertAlign={"c"}
        />

        <XrListRenderer
          tag={"textures_list"}
          x={24}
          y={12 + 24 + DEFAULT_SPACING}
          width={BASE_WIDTH - 48}
          height={28}
        />

        <XrStatic
          tag={"textures_picture_square_big"}
          x={24}
          y={44 + 24 + 24}
          width={400}
          height={400}
          texture={textures.ui_ui_noise}
        />

        <XrStatic
          tag={"textures_picture_square_medium"}
          x={24 + 400 + DEFAULT_SPACING}
          y={44 + 24 + 24}
          width={200}
          height={200}
          texture={textures.ui_ui_noise}
        />

        <XrStatic
          tag={"textures_picture_square_small"}
          x={24 + 400 + DEFAULT_SPACING + 200 + DEFAULT_SPACING}
          y={44 + 24 + 24}
          width={100}
          height={100}
          texture={textures.ui_ui_noise}
        />

        <XrStatic
          tag={"textures_picture_square_mini"}
          x={24 + 400 + DEFAULT_SPACING + 200 + DEFAULT_SPACING + 100 + DEFAULT_SPACING}
          y={44 + 24 + 24}
          width={12}
          height={12}
          texture={textures.ui_ui_noise}
        />

        <XrStatic
          tag={"textures_picture_line"}
          x={
            DEFAULT_SPACING +
            400 +
            DEFAULT_SPACING +
            200 +
            DEFAULT_SPACING +
            100 +
            DEFAULT_SPACING +
            24 +
            DEFAULT_SPACING
          }
          y={44 + 24 + 24}
          width={80}
          height={16}
          texture={textures.ui_ui_noise}
        />
      </section>
    </w>
  );
}
