import { JSXNode, JSXXML } from "jsx-xml";

import { Xr3tButton, XrEditBox, XrRoot, XrStatic, XrText } from "@/engine/forms/components/base";
import { XrComboBox } from "@/engine/forms/components/base/XrListRenderer.component";
import { SECTION_HEIGHT, SECTION_WIDTH } from "@/engine/forms/menu/debug/DebugDialog.component";
import { WHITE } from "@/engine/lib/constants/colors";
import { fonts } from "@/engine/lib/constants/fonts";

/**
 * Create debug section with treasures information/debug context.
 */
export function create(): JSXNode {
  return (
    <XrRoot width={SECTION_WIDTH} height={SECTION_HEIGHT}>
      <XrStatic tag={"total_treasures_count_label"} x={12} y={12} width={80} height={16}>
        <XrText font={fonts.letterica16} align={"c"} vertAlign={"c"} />
      </XrStatic>

      <XrStatic tag={"given_treasures_count_label"} x={100} y={12} width={80} height={16}>
        <XrText font={fonts.letterica16} align={"c"} vertAlign={"c"} />
      </XrStatic>

      <XrStatic tag={"found_treasures_count_label"} x={188} y={12} width={80} height={16}>
        <XrText font={fonts.letterica16} align={"c"} vertAlign={"c"} />
      </XrStatic>

      <Xr3tButton
        tag={"give_treasures_button"}
        x={12}
        y={32}
        height={16}
        width={50}
        label={"Give all"}
        font={fonts.letterica16}
        textColor={WHITE}
        texture={"ui_inGame2_Mp_bigbuttone"}
      />

      <Xr3tButton
        tag={"reset_treasures_button"}
        x={70}
        y={32}
        height={16}
        width={50}
        label={"Reset all"}
        font={fonts.letterica16}
        textColor={WHITE}
        texture={"ui_inGame2_Mp_bigbuttone"}
      />

      <Xr3tButton
        tag={"give_random_treasures_button"}
        x={128}
        y={32}
        height={16}
        width={50}
        label={"Give random"}
        font={fonts.letterica16}
        textColor={WHITE}
        texture={"ui_inGame2_Mp_bigbuttone"}
      />

      <Xr3tButton
        tag={"give_specific_treasure_button"}
        x={12}
        y={52}
        height={16}
        width={60}
        label={"Give treasure"}
        font={fonts.letterica16}
        textColor={WHITE}
        texture={"ui_inGame2_Mp_bigbuttone"}
      />

      <Xr3tButton
        tag={"reset_specific_treasure_button"}
        x={80}
        y={52}
        height={16}
        width={60}
        label={"Reset treasure"}
        font={fonts.letterica16}
        textColor={WHITE}
        texture={"ui_inGame2_Mp_bigbuttone"}
      />

      <Xr3tButton
        tag={"teleport_to_specific_treasure_button"}
        x={148}
        y={52}
        height={16}
        width={80}
        label={"Teleport to treasure"}
        font={fonts.letterica16}
        textColor={WHITE}
        texture={"ui_inGame2_Mp_bigbuttone"}
      />

      <XrComboBox tag={"treasures_combo_box"} x={12} y={72} width={260} height={24} />
      <XrEditBox tag={"treasures_edit_box"} x={280} y={72} width={120} height={20} texture={"ui_inGame2_edit_box_2"} />

      <XrStatic tag={"treasure_info_label"} x={12} y={100} width={860} height={300}>
        <XrText font={fonts.letterica16} align={"l"} vertAlign={"t"} stretch={true} complexMode={true} />
      </XrStatic>
    </XrRoot>
  );
}
