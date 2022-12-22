import { JSXNode, JSXXML } from "jsx-xml";

import { captions } from "@/mod/globals/captions";
import { fonts } from "@/mod/globals/fonts";
import { textures } from "@/mod/globals/textures";
import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { IRgbColor } from "@/mod/lib/types";
import { Xr3tButton, XrStatic } from "@/mod/ui/components/base";
import { CustomTab } from "@/mod/ui/components/custom";
import { EDebugSection } from "@/mod/ui/debug/sections";

export const IS_XML: boolean = true;

const BASE_WIDTH: number = gameConfig.UI.BASE_WIDTH;
const BASE_HEIGHT: number = gameConfig.UI.BASE_HEIGHT;

export const SECTION_WIDTH: number = BASE_WIDTH * 0.9;
export const SECTION_HEIGHT: number = BASE_HEIGHT * 0.9 - 12;

export function create(): JSXNode {
  const dialogWidthPadding: number = BASE_WIDTH * 0.05;
  const dialogHeightPadding: number = BASE_HEIGHT * 0.05;

  const dialogButtonWidth: number = 108;
  const dialogButtonHeight: number = 26;

  const dialogTabsWidth: number = SECTION_WIDTH - 16;
  const dialogTabsHeight: number = 20;

  const textColorDarker: IRgbColor = { r: 170, g: 170, b: 170 };
  const textColorLighter: IRgbColor = { r: 200, g: 200, b: 200 };

  return (
    <w>
      <DebugToolBackground width={BASE_WIDTH} height={BASE_HEIGHT} />

      <main_dialog x={0} y={0} width={BASE_WIDTH} height={BASE_HEIGHT}>
        <XrStatic
          tag={"section"}
          x={dialogWidthPadding}
          y={dialogHeightPadding}
          height={SECTION_HEIGHT}
          width={SECTION_WIDTH}
          texture={textures.ui_inGame2_picture_window}
        />

        <CustomTab
          x={dialogWidthPadding + 8}
          y={dialogHeightPadding + 8}
          width={dialogTabsWidth}
          height={dialogTabsHeight}
          font={fonts.letterica16}
          textColor={textColorLighter}
          tabs={[
            { id: EDebugSection.GENERAL, label: "General", texture: textures.ui_inGame2_Mp_bigbuttone },
            { id: EDebugSection.ITEMS, label: "Items", texture: textures.ui_inGame2_Mp_bigbuttone },
            { id: EDebugSection.POSITION, label: "Position", texture: textures.ui_inGame2_Mp_bigbuttone },
            { id: EDebugSection.SOUND, label: "Sound", texture: textures.ui_inGame2_Mp_bigbuttone },
            { id: EDebugSection.SPAWN, label: "Spawn", texture: textures.ui_inGame2_Mp_bigbuttone },
            { id: EDebugSection.UI, label: "UI", texture: textures.ui_inGame2_Mp_bigbuttone },
            { id: EDebugSection.WORLD, label: "World", texture: textures.ui_inGame2_Mp_bigbuttone }
          ]}
        />

        <debug_section
          x={dialogWidthPadding}
          y={dialogHeightPadding + dialogTabsHeight + 12}
          width={SECTION_WIDTH}
          height={SECTION_HEIGHT - dialogTabsHeight}
        />

        <Xr3tButton
          tag={"btn_cancel"}
          x={dialogWidthPadding + SECTION_WIDTH - dialogButtonWidth - 8}
          y={SECTION_HEIGHT + dialogHeightPadding + 12 - dialogButtonHeight - 12}
          height={dialogButtonHeight}
          width={dialogButtonWidth}
          font={fonts.letterica18}
          label={captions.ui_mm_cancel}
          textColor={textColorDarker}
          texture={textures.ui_inGame2_Mp_bigbuttone}
        />
      </main_dialog>
    </w>
  );
}

function DebugToolBackground({ width = 0, height = 0 }): JSXNode {
  return (
    <background width={width} height={height}>
      <auto_static width={width} height={height}>
        <texture>{textures.ui_actor_multiplayer_background}</texture>
      </auto_static>
    </background>
  );
}
