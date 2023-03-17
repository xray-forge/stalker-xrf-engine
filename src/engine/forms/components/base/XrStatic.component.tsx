import { JSXNode, JSXXML } from "jsx-xml";

import { normalizeBaseNodeProps } from "#/utils";

import { XrTexture } from "@/engine/forms/components/base/XrTexture.component";
import { TTexture } from "@/engine/globals/textures";
import { IBaseXmlNode } from "@/engine/lib/types";

export interface IXrStaticProps extends IBaseXmlNode {
  id?: string;

  /**
   * Enable custom tag name for button elements.
   */
  tag?: string;
  stretch?: boolean;

  texture?: TTexture;
  textureX?: number;
  textureY?: number;
  textureWidth?: number;
  textureHeight?: number;

  children?: JSXNode;
}

/**
 * Generic component for rendering dialogs background.
 */
export function XrStatic(props: IXrStaticProps): JSXNode {
  const {
    tag = "auto_static",
    id,
    x,
    y,
    width,
    height,
    texture,
    textureX,
    textureY,
    textureWidth,
    textureHeight,
    stretch,
    children = null,
  } = normalizeBaseNodeProps(props);

  return JSXXML(
    tag,
    {
      id,
      x,
      y,
      width,
      height,
      stretch: stretch === undefined ? "1" : stretch,
    },
    [
      texture ? <XrTexture id={texture} x={textureX} y={textureY} width={textureWidth} height={textureHeight} /> : null,
      children,
    ]
  );
}
