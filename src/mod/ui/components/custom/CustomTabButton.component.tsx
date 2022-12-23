import { JSXNode, JSXXML } from "jsx-xml";

import { TTextureId } from "@/mod/globals/textures";
import { IBaseXmlNode, TTextAlign } from "@/mod/lib/types";
import { XrTexture } from "@/mod/ui/components/base/XrTexture.component";

import { normalizeBaseNodeCoordinates } from "#/utils";

export interface IXrTabButtonProps extends IBaseXmlNode {
  id: string;
  texture: TTextureId;
  stretch?: boolean;
  align?: TTextAlign;
  vertAlign?: TTextAlign;
  children: JSXNode;
}

export function CustomTabButton(props: IXrTabButtonProps): JSXNode {
  const { x, y, width, height, children, texture, id, stretch } = normalizeBaseNodeCoordinates(props);

  return (
    <button x={x} y={y} width={width} height={height} id={id} stretch={stretch === undefined ? "1" : stretch}>
      <XrTexture id={texture} />
      {children}
    </button>
  );
}
