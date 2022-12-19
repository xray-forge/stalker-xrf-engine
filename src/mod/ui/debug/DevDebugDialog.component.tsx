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

export function create(): JSXNode {
  const BASE_WIDTH: number = gameConfig.UI.BASE_WIDTH;
  const BASE_HEIGHT: number = gameConfig.UI.BASE_HEIGHT;

  return (
    <w>
      <DebugToolBackground width={BASE_WIDTH} height={BASE_HEIGHT}/>

      <DebugDialogBase width={BASE_WIDTH} height={BASE_HEIGHT} />
    </w>
  );
}

function DebugDialogBase({ width= 0, height= 0 }): JSXNode {
  const dialogWidth: number = width * 0.9;
  const dialogHeight: number = height * 0.9;
  const dialogWidthPadding: number = width * 0.05;
  const dialogHeightPadding: number = height * 0.05;

  const dialogButtonWidth: number = 108;
  const dialogButtonHeight: number = 26;

  const dialogTabsWidth: number = dialogWidth - 72;
  const dialogTabsHeight: number = 16;

  const textColorDarker: IRgbColor = { r: 170, g: 170, b: 170 };
  const textColorLighter: IRgbColor = { r: 200, g: 200, b: 200 };

  return (
    <main_dialog x={0} y={0} width={width} height={height}>
      <XrStatic
        tag={"dialog"}
        x={dialogWidthPadding}
        y={dialogHeightPadding}
        height={dialogHeight}
        width={dialogWidth}
        texture={textures.ui_inGame2_opt_main_window}
      />

      <Xr3tButton
        tag={"btn_cancel"}
        x={dialogWidth - dialogButtonWidth - 48}
        y={dialogHeight - dialogButtonHeight - 12}
        height={dialogButtonHeight}
        width={dialogButtonWidth}
        font={fonts.letterica18}
        label={captions.ui_mm_cancel}
        textColor={textColorDarker}
        texture={textures.ui_inGame2_Mp_bigbuttone}
      />

      <CustomTab
        x={(dialogWidth - dialogTabsWidth) / 2}
        y={dialogHeightPadding}
        width={dialogTabsWidth}
        height={dialogTabsHeight}
        font={fonts.letterica16}
        textColor={textColorLighter}
        tabs={[
          { id: EDebugSection.GENERAL, label: "General", texture: textures.ui_inGame2_Mp_bigbuttone },
          { id: EDebugSection.ITEMS, label: "Items" , texture: textures.ui_inGame2_Mp_bigbuttone },
          { id: EDebugSection.POSITION, label: "Position", texture: textures.ui_inGame2_Mp_bigbuttone },
          { id: EDebugSection.SOUND, label: "Sound", texture: textures.ui_inGame2_Mp_bigbuttone },
          { id: EDebugSection.SPAWN, label: "Spawn", texture: textures.ui_inGame2_Mp_bigbuttone },
          { id: EDebugSection.UI, label: "UI", texture: textures.ui_inGame2_Mp_bigbuttone },
          { id: EDebugSection.WORLD, label: "World", texture: textures.ui_inGame2_Mp_bigbuttone }
        ]}/>

      <debug_section
        x={0}
        y={dialogHeightPadding + dialogTabsHeight}
        width={width * 0.9}
        height={dialogHeight}
      />
    </main_dialog>
  );
}

function DebugToolBackground({ width = 0, height = 0 }): JSXNode {
  return (
    <background width={width} height={height}>
      <auto_static x={500} y={130} width={432} height={160} stretch={1}>
        <texture width={432} height={160}>{textures.ui_video_voroni_crop}</texture>
      </auto_static>
      <auto_static x={413} y={352} width={576} height={416} stretch={1}>
        <texture width={576} height={416}>{textures.ui_video_water_crop}</texture>
      </auto_static>

      <auto_static width={width} height={height}>
        <texture>{textures.ui_inGame2_background}</texture>
      </auto_static>
      <auto_static x={41} y={278} width={288} height={428}>
        <texture>{textures.ui_save_load_back}</texture>
      </auto_static>
    </background>
  );
}
