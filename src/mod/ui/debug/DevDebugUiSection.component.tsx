import { JSXNode, JSXXML } from "jsx-xml";

import { textures } from "@/mod/globals/textures";
import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { XrStatic } from "@/mod/ui/components/base";
import { XrListRenderer } from "@/mod/ui/components/base/XrListRenderer.component";

export const IS_XML: boolean = true;

export function create(): JSXNode {
  const BASE_WIDTH: number = gameConfig.UI.BASE_WIDTH;
  const BASE_HEIGHT: number = gameConfig.UI.BASE_HEIGHT;

  const PADDING_LEFT: number = 20;
  const LIST_WIDTH = BASE_WIDTH * 0.9;
  const DEFAULT_SPACING: number = 12;

  return (
    <w>
      <background></background>

      <section x={0} y={0} width={LIST_WIDTH} height={BASE_HEIGHT * 0.75}>
        <XrListRenderer
          tag={"textures_list"}
          x={PADDING_LEFT}
          y={12}
          width={LIST_WIDTH - PADDING_LEFT * 2}
          height={24}
        />

        <XrStatic
          tag={"textures_picture_square_big"}
          x={PADDING_LEFT}
          y={44}
          width={96}
          height={96}
          texture={textures.ui_ui_noise}
        />

        <XrStatic
          tag={"textures_picture_square_medium"}
          x={PADDING_LEFT + 96 + DEFAULT_SPACING}
          y={44}
          width={48}
          height={48}
          texture={textures.ui_ui_noise}
        />

        <XrStatic
          tag={"textures_picture_square_small"}
          x={PADDING_LEFT + 96 + DEFAULT_SPACING + 48 + DEFAULT_SPACING}
          y={44}
          width={24}
          height={24}
          texture={textures.ui_ui_noise}
        />

        <XrStatic
          tag={"textures_picture_line"}
          x={PADDING_LEFT + 96 + DEFAULT_SPACING + 48 + DEFAULT_SPACING + 24 + DEFAULT_SPACING}
          y={44}
          width={60}
          height={12}
          texture={textures.ui_ui_noise}
        />
      </section>
    </w>
  );
}
