import { JSXNode, JSXXML } from "jsx-xml";

import { textures } from "@/mod/globals/textures";
import { gameConfig } from "@/mod/lib/configs/GameConfig";

export const IS_XML: boolean = true;

export function create(): JSXNode {
  const BASE_WIDTH: number = gameConfig.UI.BASE_WIDTH;
  const BASE_HEIGHT: number = gameConfig.UI.BASE_HEIGHT;

  return (
    <w>
      <background width={BASE_WIDTH * 0.9} height={BASE_HEIGHT * 0.75}>
        <auto_static width={BASE_WIDTH * 0.9} height={BASE_HEIGHT * 0.75} stretch="1">
          <texture>{textures.ui_inGame2_opt_button_2}</texture>
        </auto_static>
      </background>
    </w>
  );
}
