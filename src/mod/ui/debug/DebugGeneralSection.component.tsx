import { JSXNode, JSXXML } from "jsx-xml";

import { textures } from "@/mod/globals/textures";
import { XrBackground, XrRoot, XrStatic } from "@/mod/ui/components/base";
import { XrTexture } from "@/mod/ui/components/base/XrTexture.component";
import { SECTION_HEIGHT, SECTION_WIDTH } from "@/mod/ui/debug/DebugDialog.component";

export const IS_XML: boolean = true;

const BASE_WIDTH: number = SECTION_WIDTH;
const BASE_HEIGHT: number = SECTION_HEIGHT;

export function create(): JSXNode {
  return (
    <XrRoot>
      <XrBackground width={BASE_WIDTH} height={BASE_HEIGHT}>
        <XrStatic width={BASE_WIDTH} height={BASE_HEIGHT} stretch={true}>
          <XrTexture id={textures.ui_inGame2_picture_window} />
        </XrStatic>
      </XrBackground>
    </XrRoot>
  );
}
