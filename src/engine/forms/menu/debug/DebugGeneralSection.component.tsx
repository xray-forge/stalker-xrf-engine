import { JSXNode, JSXXML } from "jsx-xml";

import { Xr3tButton, XrRoot, XrStatic, XrText } from "@/engine/forms/components/base";
import { SECTION_HEIGHT, SECTION_WIDTH } from "@/engine/forms/menu/debug/DebugDialog.component";
import { WHITE } from "@/engine/globals/colors";
import { fonts } from "@/engine/globals/fonts";
import { texturesIngame } from "@/engine/globals/textures";

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

      <XrStatic tag={"lua_jit_label"} x={136} y={12} width={60} height={16}>
        <XrText font={fonts.letterica16} align={"c"} vertAlign={"c"} />
      </XrStatic>

      <XrStatic tag={"game_command_line"} x={200} y={12} width={60} height={16}>
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
        texture={texturesIngame.ui_inGame2_Mp_bigbuttone}
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
        texture={texturesIngame.ui_inGame2_Mp_bigbuttone}
      />

      <Xr3tButton
        tag={"profiling_toggle_button"}
        x={12}
        y={52}
        height={16}
        width={60}
        label={"Enable profiling"}
        font={fonts.letterica16}
        textColor={WHITE}
        texture={texturesIngame.ui_inGame2_Mp_bigbuttone}
      />

      <Xr3tButton
        tag={"profiling_log_button"}
        x={84}
        y={52}
        height={16}
        width={72}
        label={"Log profiling report"}
        font={fonts.letterica16}
        textColor={WHITE}
        texture={texturesIngame.ui_inGame2_Mp_bigbuttone}
      />
    </XrRoot>
  );
}
