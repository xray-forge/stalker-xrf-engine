import { JSXNode, JSXXML } from "jsx-xml";

import { fonts } from "@/mod/globals/fonts";
import { textures } from "@/mod/globals/textures";
import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { XrStatic, XrText } from "@/mod/ui/components/base";
import { XrListRenderer } from "@/mod/ui/components/base/XrListRenderer.component";

export const IS_XML: boolean = true;

export function create(): JSXNode {
  const BASE_WIDTH: number = gameConfig.UI.BASE_WIDTH;
  const BASE_HEIGHT: number = gameConfig.UI.BASE_HEIGHT;

  const PADDING_LEFT: number = BASE_WIDTH * 0.05;

  return (
    <w>
      <background >
      </background>

      <section x={0} y={0} width={BASE_WIDTH * 0.9} height={BASE_HEIGHT * 0.75}>
        <XrListRenderer tag={"textures_list"} x={PADDING_LEFT} y={12} width={BASE_WIDTH * 0.9} height={24}/>

        {/**

         <XrStatic
         tag={"textures_picture"}
         x={PADDING_LEFT}
         y={44}
         width={BASE_WIDTH}
         height={26}
         texture={textures.ui_ui_noise}
         />
         */}

        {
          /*

        <XrStatic tag={"fonts_list_display"} x={PADDING_LEFT} y={56} width={BASE_WIDTH * 0.9} height={24}>
          <XrText
            tag={"fonts_list_display_text"}
            label={"Example label for font testing"}
            font={fonts.letterica16}
            align={"l"}
          />
        </XrStatic>
           */
        }

        <XrListRenderer tag={"fonts_list"} x={PADDING_LEFT} y={78} width={BASE_WIDTH * 0.9} height={24}/>
      </section>
    </w>
  );
}
