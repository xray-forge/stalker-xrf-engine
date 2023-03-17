import { JSXNode, JSXXML } from "jsx-xml";

import { Xr3tButton, XrBackground, XrRoot, XrStatic } from "@/engine/forms/components/base";
import { XrContainer } from "@/engine/forms/components/base/XrContainer.component";
import { CustomTab } from "@/engine/forms/components/custom";
import { EDebugSection } from "@/engine/forms/menu/debug/sections";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { captions } from "@/engine/lib/constants/captions";
import { fonts } from "@/engine/lib/constants/fonts";
import { textures, texturesIngame } from "@/engine/lib/constants/textures";
import { IRgbColor } from "@/engine/lib/types";

export const IS_XML: boolean = true;

const BASE_WIDTH: number = gameConfig.UI.BASE_WIDTH;
const BASE_HEIGHT: number = gameConfig.UI.BASE_HEIGHT;

export const SECTION_WIDTH: number = BASE_WIDTH * 0.9;
export const SECTION_HEIGHT: number = BASE_HEIGHT * 0.9 - 32;

const TEXT_COLOR_DARKER: IRgbColor = { r: 170, g: 170, b: 170 };
const textColorLighter: IRgbColor = { r: 200, g: 200, b: 200 };

export function create(): JSXNode {
  const dialogWidthPadding: number = BASE_WIDTH * 0.05;
  const dialogHeightPadding: number = BASE_HEIGHT * 0.05;

  const dialogButtonWidth: number = 108;
  const dialogButtonHeight: number = 26;

  const dialogTabsWidth: number = SECTION_WIDTH - 20;

  return (
    <XrRoot>
      <XrBackground x={0} y={0} width={BASE_WIDTH} height={BASE_HEIGHT}>
        <XrStatic
          width={BASE_WIDTH}
          height={BASE_HEIGHT}
          textureWidth={BASE_WIDTH}
          textureHeight={BASE_HEIGHT}
          texture={textures.ui_ui_actor_multiplayer_background}
          stretch
        />
      </XrBackground>

      <XrContainer tag={"main_dialog"} x={0} y={0} width={BASE_WIDTH} height={BASE_HEIGHT}>
        <XrStatic
          tag={"section_background"}
          x={dialogWidthPadding}
          y={dialogHeightPadding}
          height={SECTION_HEIGHT + 32}
          width={SECTION_WIDTH}
          texture={texturesIngame.ui_inGame2_picture_window}
          stretch
        />

        <CustomTab
          x={dialogWidthPadding + 8}
          y={dialogHeightPadding + 8}
          width={dialogTabsWidth}
          height={20}
          font={fonts.letterica16}
          textColor={textColorLighter}
          align={"c"}
          vertAlign={"c"}
          tabs={Object.entries(EDebugSection).map(([key, value]) => ({
            id: value,
            label: key,
            texture: texturesIngame.ui_inGame2_Mp_bigbuttone,
          }))}
        />

        <XrContainer
          tag={"debug_section"}
          x={dialogWidthPadding}
          y={dialogHeightPadding + 32}
          width={SECTION_WIDTH}
          height={SECTION_HEIGHT}
        />

        <Xr3tButton
          tag={"btn_cancel"}
          x={dialogWidthPadding + SECTION_WIDTH - dialogButtonWidth - 12}
          y={SECTION_HEIGHT + dialogHeightPadding + 16 - dialogButtonHeight}
          height={dialogButtonHeight}
          width={dialogButtonWidth}
          font={fonts.letterica18}
          label={captions.ui_mm_cancel}
          textColor={TEXT_COLOR_DARKER}
          texture={texturesIngame.ui_inGame2_Mp_bigbuttone}
        />
      </XrContainer>
    </XrRoot>
  );
}
