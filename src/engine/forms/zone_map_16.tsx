import { JSXNode, JSXXML } from "jsx-xml";

import { XrText } from "@/engine/forms/components/base";
import { XrTexture } from "@/engine/forms/components/base/XrTexture.component";
import { fonts } from "@/engine/lib/constants/fonts";

/**
 * todo;
 */
export function create(): JSXNode {
  return (
    <window>
      <minimap>
        <level_frame x={0.099} y={0.14} width={0.199} height={0.199} stretch={1} alignment={"c"} />

        <background width={0.27} height={0.27} stretch={1} alignment={"c"}>
          <XrTexture id={"ui_inGame2_Radar_main_window"} />
        </background>

        <clock_wnd x={0.15} y={0.86} width={39} height={16} alignment={"c"}>
          <XrText x={0} y={0} font={fonts.letterica16} color={"ui_7"} align={"c"} vertAlign={"c"} />
        </clock_wnd>

        <compass x={0.15} y={0.11} width={9} height={30} heading={1} alignment={"c"}>
          <XrTexture id={"ui_inGame2_Radar_compass"} />
        </compass>

        <center width={4} height={4} alignment={"c"} stretch={1}>
          <XrTexture id={"ui_minimap_point"} />
        </center>

        <static_counter x={0.94} y={0.5} width={18} height={17} alignment={"c"}>
          <text_static width={18} height={17}>
            <XrText align={"c"} font={fonts.graffiti19} color={"ui_7"} />
          </text_static>
        </static_counter>
      </minimap>
    </window>
  );
}
