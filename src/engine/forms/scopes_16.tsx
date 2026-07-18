import { JSXNode, JSXXML } from "jsx-xml";

import { SCREEN_BASE_HEIGHT, SCREEN_BASE_WIDTH } from "@/engine/core/ui/screen_layout";
import { XrComponent } from "@/engine/forms/components/base";

/**
 * Scopes rendering for 16/9.
 */
export function create(): JSXNode {
  return (
    <w>
      {["wpn_crosshair", "wpn_crosshair_l85", "wpn_crosshair_g36", "wpn_crosshair_rpg", "wpn_crosshair_bino"].map(
        (it) => (
          <XrComponent tag={it} x={0} y={0} width={SCREEN_BASE_WIDTH} height={SCREEN_BASE_HEIGHT}>
            <auto_static x={85} y={0} width={854} height={SCREEN_BASE_HEIGHT} stretch={1}>
              <texture>{it}</texture>
            </auto_static>

            <auto_static x={0} y={0} width={86} height={SCREEN_BASE_HEIGHT} stretch={1}>
              <texture>wpn_crosshair_add_l</texture>
            </auto_static>

            <auto_static x={939} y={0} width={85} height={SCREEN_BASE_HEIGHT} stretch={1}>
              <texture>wpn_crosshair_add_r</texture>
            </auto_static>
          </XrComponent>
        )
      )}
    </w>
  );
}
