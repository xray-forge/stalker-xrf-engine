import { JSXNode, JSXXML } from "jsx-xml";

import { Xr3tButton, XrBackground, XrRoot, XrStatic, XrText } from "@/engine/forms/components/base";
import { XrComboBox } from "@/engine/forms/components/base/XrListRenderer.component";
import { SECTION_HEIGHT, SECTION_WIDTH } from "@/engine/forms/menu/debug/DebugDialog.component";
import { WHITE } from "@/engine/lib/constants/colors";
import { fonts } from "@/engine/lib/constants/fonts";
import { textures } from "@/engine/lib/constants/textures";

export function create(): JSXNode {
  return (
    <XrRoot>
      <XrBackground width={SECTION_WIDTH} height={SECTION_HEIGHT}>
        <XrStatic texture={textures.ui_inGame2_picture_window} width={SECTION_WIDTH} height={SECTION_HEIGHT} stretch />
      </XrBackground>

      <XrText tag={"current_weather_section_label"} x={12} y={12} label={"none"} />

      <XrText tag={"current_weather_state_label"} x={12} y={36} label={"none"} />
      <XrComboBox tag={"current_weather_state_select"} x={96} y={32} width={120} height={20} />

      <XrText tag={"next_weather_state_label"} x={12} y={56} label={"none"} />
      <XrComboBox tag={"next_weather_state_select"} x={96} y={52} width={120} height={20} />

      <Xr3tButton
        tag={"randomize_weather_button"}
        label={"Randomize weather"}
        x={12}
        y={76}
        width={72}
        height={16}
        textColor={WHITE}
        font={fonts.letterica16}
      />
    </XrRoot>
  );
}
