import { JSXNode, JSXXML } from "jsx-xml";

import { Xr3tButton, XrEditBox, XrRoot, XrStatic, XrText } from "@/engine/forms/components/base";
import { XrList } from "@/engine/forms/components/base/XrList.component";
import { XrTexture } from "@/engine/forms/components/base/XrTexture.component";
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

      <XrStatic tag={"preview_texture_common"} x={300} y={12} width={20} height={24}>
        <XrTexture id={"ui_inGame2_PDA_icon_secret"} />
      </XrStatic>

      <XrStatic tag={"preview_texture_rare"} x={325} y={12} width={20} height={24}>
        <XrTexture id={"ui_inGame2_PDA_icon_secret_rare"} />
      </XrStatic>

      <XrStatic tag={"preview_texture_epic"} x={350} y={12} width={20} height={24}>
        <XrTexture id={"ui_inGame2_PDA_icon_secret_epic"} />
      </XrStatic>

      <XrStatic tag={"preview_texture_unique"} x={375} y={12} width={20} height={24}>
        <XrTexture id={"ui_inGame2_PDA_icon_secret_unique"} />
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
        tag={"give_random_treasures_button"}
        x={70}
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
        tag={"teleport_to_specific_treasure_button"}
        x={80}
        y={52}
        height={16}
        width={80}
        label={"Teleport to treasure"}
        font={fonts.letterica16}
        textColor={WHITE}
        texture={"ui_inGame2_Mp_bigbuttone"}
      />

      <XrEditBox
        tag={"treasures_filter_box"}
        x={168}
        y={52}
        width={120}
        height={16}
        texture={"ui_inGame2_edit_box_2"}
      />

      <XrStatic
        tag={"treasures_list_frame"}
        x={12}
        y={120}
        width={860}
        height={600}
        texture={"ui_inGame2_servers_list_frame"}
      />

      <XrList tag={"treasures_list"} x={12} y={120} width={860} height={600} itemHeight={18} canSelect={true} />

      <XrStatic tag={"treasure_info_label"} x={12} y={72} width={860} height={40}>
        <XrText font={fonts.letterica16} align={"l"} vertAlign={"t"} stretch={true} complexMode={true} />
      </XrStatic>
    </XrRoot>
  );
}
