import { JSXNode, JSXXML } from "jsx-xml";

import { TTextureId } from "@/mod/globals/textures";
import { XrTexture } from "@/mod/ui/components/base/XrTexture.component";

interface IXrTabButtonProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  texture: TTextureId;
  children: JSXNode;
}

export function CustomTabButton({ x, y, width, height, children, texture, id }: IXrTabButtonProps): JSXNode {
  return (
    <button x={x} y={y} width={width} height={height} id={id} stretch="1">
      <XrTexture id={texture} />
      {children}
    </button>
  );
}
