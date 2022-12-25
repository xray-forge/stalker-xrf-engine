import { JSXNode, JSXXML } from "jsx-xml";

import { WHITE } from "@/mod/globals/colors";
import { fonts } from "@/mod/globals/fonts";
import { textures } from "@/mod/globals/textures";
import { Xr3tButton, XrRoot, XrStatic, XrText } from "@/mod/ui/components/base";
import { SECTION_HEIGHT, SECTION_WIDTH } from "@/mod/ui/debug/DebugDialog.component";

export const IS_XML: boolean = true;

const BASE_WIDTH: number = SECTION_WIDTH;
const BASE_HEIGHT: number = SECTION_HEIGHT;

export function create(): JSXNode {
  return (
    <XrRoot width={BASE_WIDTH} height={BASE_HEIGHT}>
      <XrStatic tag={"lua_version_label"} x={16} y={12} width={60} height={16}>
        <XrText font={fonts.letterica16} align={"c"} vertAlign={"c"} />
      </XrStatic>

      <XrStatic tag={"memory_usage_count"} x={84} y={12} width={60} height={16}>
        <XrText font={fonts.letterica16} align={"c"} vertAlign={"c"} />
      </XrStatic>

      <Xr3tButton
        tag={"refresh_memory_button"}
        x={12}
        y={32}
        height={16}
        width={40}
        label={"Refresh"}
        font={fonts.letterica16}
        textColor={WHITE}
        texture={textures.ui_inGame2_Mp_bigbuttone}
      />

      <Xr3tButton
        tag={"collect_memory_button"}
        x={64}
        y={32}
        height={16}
        width={40}
        label={"Collect"}
        font={fonts.letterica16}
        textColor={WHITE}
        texture={textures.ui_inGame2_Mp_bigbuttone}
      />

      <XrStatic tag={"game_command_line"} x={16} y={48} width={60} height={16}>
        <XrText font={fonts.letterica16} align={"c"} vertAlign={"c"} />
      </XrStatic>
    </XrRoot>
  );
}
