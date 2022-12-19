import { JSXNode, JSXXML } from "jsx-xml";

import { TTextureId } from "@/mod/globals/textures";
import { IBaseXmlNode } from "@/mod/lib/types";
import { XrTexture } from "@/mod/ui/components/base/XrTexture.component";

interface IXrStaticProps extends IBaseXmlNode {
  id?: string;
  /**
   * Enable custom tag name for button elements.
   */
  tag?: string;
  stretch?: boolean;
  texture?: TTextureId;
  children?: JSXNode;
}

/**
 * Generic component for rendering dialogs background.
 */
export function XrStatic({
  tag = "auto_static",
  id,
  x,
  y,
  width,
  height,
  texture,
  stretch = true,
  children = null
}: IXrStaticProps): JSXNode {
  return JSXXML(tag, {
    id,
    x,
    y,
    width,
    height,
    stretch: stretch ? "1" : "0"
  }, [
    texture ? <XrTexture id={texture}/> : null,
    children
  ]);
}
