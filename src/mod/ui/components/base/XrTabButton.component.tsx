import { JSXNode, JSXXML } from "jsx-xml";

import { TTextureId } from "@/mod/globals/textures";
import { IBaseXmlNode } from "@/mod/lib/types";
import { XrTexture } from "@/mod/ui/components/base/XrTexture.component";

interface IXrTabButtonProps extends IBaseXmlNode {
  id: string;
  texture: TTextureId;
}

export function XrTabButton({ x, y, width, height, children, texture, id }: IXrTabButtonProps): JSXNode {
  return (
    <button x={x} y={y} width={width} height={height} id={id} stretch="1">
      <XrTexture id={texture}/>
      {children}
    </button>
  );
}
