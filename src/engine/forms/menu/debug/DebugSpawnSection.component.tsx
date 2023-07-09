import { JSXNode, JSXXML } from "jsx-xml";

import { Xr3tButton, XrBackground, XrComponent, XrRoot, XrStatic } from "@/engine/forms/components/base";
import { XrList } from "@/engine/forms/components/base/XrList.component";
import { XrComboBox } from "@/engine/forms/components/base/XrListRenderer.component";
import { SECTION_HEIGHT, SECTION_WIDTH } from "@/engine/forms/menu/debug/DebugDialog.component";
import { WHITE } from "@/engine/lib/constants/colors";
import { textures } from "@/engine/lib/constants/textures";

/**
 * todo;
 */
export function create(): JSXNode {
  return (
    <XrRoot>
      <XrBackground width={SECTION_WIDTH} height={SECTION_HEIGHT}>
        <XrStatic texture={textures.ui_inGame2_picture_window} width={SECTION_WIDTH} height={SECTION_HEIGHT} stretch />
      </XrBackground>

      <XrComboBox tag={"creatures_categories_list"} x={12} y={16} width={200} height={24} />

      <XrStatic
        tag={"items_list_frame"}
        x={12}
        y={44}
        height={SECTION_HEIGHT - 92}
        width={SECTION_WIDTH - 28}
        texture={textures.ui_inGame2_servers_list_frame}
      />

      <XrList
        tag={"items_list"}
        x={12}
        y={44}
        width={SECTION_WIDTH - 28}
        height={SECTION_HEIGHT - 92}
        itemHeight={18}
        canSelect={true}
      />

      <XrComponent tag={"spawn_item"}>
        <XrComponent tag={"main"} width={SECTION_WIDTH - 28} height={18} />
        <XrComponent tag={"fn"} width={SECTION_WIDTH - 28 - 128} height={18} />
        <XrComponent tag={"fd"} width={128} height={18} />
      </XrComponent>

      <Xr3tButton
        tag={"spawn_creature_button"}
        label={"Spawn"}
        textColor={WHITE}
        x={12}
        y={SECTION_HEIGHT - 40}
        width={60}
        height={20}
      />
    </XrRoot>
  );
}
