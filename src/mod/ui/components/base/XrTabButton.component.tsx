import { JSXNode, JSXXML } from "jsx-xml";

import { TTextureId } from "@/mod/globals/textures";
import { IBaseXmlNode } from "@/mod/lib/types";
import { XrTexture } from "@/mod/ui/components/base/XrTexture.component";

import { normalizeBaseNodeProps } from "#/utils";

export interface IXrTabButtonProps extends IBaseXmlNode {
  id: string;
  texture: TTextureId;
  stretch?: boolean;
}

export function XrTabButton(props: IXrTabButtonProps): JSXNode {
  const { x, y, width, height, children, texture, id, stretch } = normalizeBaseNodeProps(props);

  return (
    <button x={x} y={y} width={width} height={height} id={id} stretch={stretch ? 1 : 0}>
      <XrTexture id={texture} />
      {children}
    </button>
  );
}
