import { JSXNode, JSXXML } from "jsx-xml";

import { normalizeBaseNodeProps } from "#/utils";

import { XrTexture } from "@/mod/forms/components/base/XrTexture.component";
import { TTexture } from "@/mod/globals/textures";
import { IBaseXmlNode } from "@/mod/lib/types";

export interface IXrTabButtonProps extends IBaseXmlNode {
  id: string;
  texture: TTexture;
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
