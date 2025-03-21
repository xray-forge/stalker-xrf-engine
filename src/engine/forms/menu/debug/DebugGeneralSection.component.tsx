import { JSXNode, JSXXML } from "jsx-xml";

import { Xr3tButton, XrRoot, XrStatic, XrText } from "@/engine/forms/components/base";
import { SECTION_HEIGHT, SECTION_WIDTH } from "@/engine/forms/menu/debug/DebugDialog.component";
import { WHITE } from "@/engine/lib/constants/colors";
import { fonts } from "@/engine/lib/constants/fonts";

/**
 * Create debug section with generic controls/info.
 */
export function create(): JSXNode {
  return (
    <XrRoot width={SECTION_WIDTH} height={SECTION_HEIGHT}>
      <XrStatic tag={"lua_version_label"} x={12} y={12} width={80} height={16}>
        <XrText font={fonts.letterica16} align={"c"} vertAlign={"c"} />
      </XrStatic>

      <XrStatic tag={"memory_usage_count"} x={100} y={12} width={60} height={16}>
        <XrText font={fonts.letterica16} align={"c"} vertAlign={"c"} />
      </XrStatic>

      <XrStatic tag={"lua_jit_label"} x={168} y={12} width={60} height={16}>
        <XrText font={fonts.letterica16} align={"c"} vertAlign={"c"} />
      </XrStatic>

      <XrStatic tag={"game_command_line"} x={300} y={12} width={80} height={16}>
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
        texture={"ui_inGame2_Mp_bigbuttone"}
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
        texture={"ui_inGame2_Mp_bigbuttone"}
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
        texture={"ui_inGame2_Mp_bigbuttone"}
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
        texture={"ui_inGame2_Mp_bigbuttone"}
      />

      <Xr3tButton
        tag={"portions_log_button"}
        x={166}
        y={52}
        height={16}
        width={72}
        label={"Log portions report"}
        font={fonts.letterica16}
        textColor={WHITE}
        texture={"ui_inGame2_Mp_bigbuttone"}
      />

      <Xr3tButton
        tag={"debug_simulation_toggle_button"}
        x={12}
        y={72}
        height={16}
        width={90}
        label={"Enable simulation debug"}
        font={fonts.letterica16}
        textColor={WHITE}
        texture={"ui_inGame2_Mp_bigbuttone"}
      />

      <Xr3tButton
        tag={"dump_system_ini_button"}
        x={12}
        y={92}
        height={16}
        width={90}
        label={"Dump system.ini"}
        font={fonts.letterica16}
        textColor={WHITE}
        texture={"ui_inGame2_Mp_bigbuttone"}
      />

      <Xr3tButton
        tag={"dump_lua_data_button"}
        x={108}
        y={92}
        height={16}
        width={90}
        label={"Dump LUA data"}
        font={fonts.letterica16}
        textColor={WHITE}
        texture={"ui_inGame2_Mp_bigbuttone"}
      />
    </XrRoot>
  );
}
