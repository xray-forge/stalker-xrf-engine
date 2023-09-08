import { JSXNode, JSXXML } from "jsx-xml";

import { Xr3tButton, XrBackground, XrRoot, XrStatic } from "@/engine/forms/components/base";
import { XrComponent } from "@/engine/forms/components/base/XrComponent.component";
import { XrScrollView } from "@/engine/forms/components/base/XrScrollView.component";
import { XrTexture } from "@/engine/forms/components/base/XrTexture.component";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { WHITE } from "@/engine/lib/constants/colors";
import { fonts } from "@/engine/lib/constants/fonts";
import { IRgbColor } from "@/engine/lib/types";

const BASE_WIDTH: number = gameConfig.UI.BASE_WIDTH;
const BASE_HEIGHT: number = gameConfig.UI.BASE_HEIGHT;

export const SECTION_WIDTH: number = BASE_WIDTH - 132;
export const SECTION_HEIGHT: number = BASE_HEIGHT - 16;

const TEXT_COLOR_DARKER: IRgbColor = { r: 170, g: 170, b: 170 };

/**
 * todo;
 */
export function create(): JSXNode {
  return (
    <XrRoot>
      <XrBackground x={0} y={0} width={BASE_WIDTH} height={BASE_HEIGHT}>
        <XrStatic
          width={BASE_WIDTH}
          height={BASE_HEIGHT}
          textureWidth={BASE_WIDTH}
          textureHeight={BASE_HEIGHT}
          texture={"ui\\ui_actor_multiplayer_background"}
          stretch
        />
      </XrBackground>

      <XrStatic
        tag={"section_background"}
        x={124}
        y={8}
        height={SECTION_HEIGHT}
        width={SECTION_WIDTH}
        texture={"ui_inGame2_picture_window"}
        stretch
      />

      <XrStatic tag={"frame_menu_background"} x={16} y={8} width={100} height={BASE_HEIGHT - 52}>
        <XrTexture id={"ui_icons_PDA_tooltips"} r={0} g={0} b={0} a={150} />
      </XrStatic>

      <XrScrollView
        tag={"frame_menu_scroll"}
        x={22}
        y={12}
        width={92}
        height={BASE_HEIGHT - 56}
        rightIndent={0}
        leftIndent={0}
        topIndent={0}
        bottomIndent={0}
        vertInterval={2}
        alwaysShowScroll={false}
      />

      <Xr3tButton
        tag={"frame_menu_item"}
        label={"placeholder"}
        font={fonts.letterica16}
        x={0}
        y={0}
        width={90}
        height={16}
        textColor={WHITE}
        texture={"ui_inGame2_Mp_bigbuttone"}
      />

      <XrComponent tag={"section"} x={124} y={8} height={SECTION_HEIGHT} width={SECTION_WIDTH} />

      <Xr3tButton
        tag={"cancel_button"}
        x={16}
        y={SECTION_HEIGHT - 24}
        height={20}
        width={100}
        font={fonts.letterica18}
        label={"ui_mm_cancel"}
        textColor={TEXT_COLOR_DARKER}
        texture={"ui_inGame2_Mp_bigbuttone"}
      />
    </XrRoot>
  );
}
