import { JSXNode, JSXXML } from "jsx-xml";

import { normalizeBaseNodeProps } from "#/utils";

import { XrTexture } from "@/engine/forms/components/base/XrTexture.component";
import { TTexture } from "@/engine/lib/constants/textures";
import { IBaseXmlNode, TTextAlign } from "@/engine/lib/types";

export interface IXrTabButtonProps extends IBaseXmlNode {
  id: string;
  texture: TTexture;
  stretch?: boolean;
  align?: TTextAlign;
  vertAlign?: TTextAlign;
  children: JSXNode;
}

export function CustomTabButton(props: IXrTabButtonProps): JSXNode {
  const { x, y, width, height, children, texture, id, stretch } = normalizeBaseNodeProps(props);

  return (
    <button x={x} y={y} width={width} height={height} id={id} stretch={stretch === undefined ? "1" : stretch}>
      <XrTexture id={texture} />
      {children}
    </button>
  );
}
