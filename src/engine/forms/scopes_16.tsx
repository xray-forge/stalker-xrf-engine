import { JSXNode, JSXXML } from "jsx-xml";

import { XrComponent } from "@/engine/forms/components/base";
import { screenConfig } from "@/engine/lib/configs/ScreenConfig";

/**
 * Scopes rendering for 16/9.
 */
export function create(): JSXNode {
  return (
    <w>
      {["wpn_crosshair", "wpn_crosshair_l85", "wpn_crosshair_g36", "wpn_crosshair_rpg", "wpn_crosshair_bino"].map(
        (it) => (
          <XrComponent tag={it} x={0} y={0} width={screenConfig.BASE_WIDTH} height={screenConfig.BASE_HEIGHT}>
            <auto_static x={85} y={0} width={854} height={screenConfig.BASE_HEIGHT} stretch={1}>
              <texture>{it}</texture>
            </auto_static>

            <auto_static x={0} y={0} width={86} height={screenConfig.BASE_HEIGHT} stretch={1}>
              <texture>wpn_crosshair_add_l</texture>
            </auto_static>

            <auto_static x={939} y={0} width={85} height={screenConfig.BASE_HEIGHT} stretch={1}>
              <texture>wpn_crosshair_add_r</texture>
            </auto_static>
          </XrComponent>
        )
      )}
    </w>
  );
}
