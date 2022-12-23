import { JSXNode, JSXXML } from "jsx-xml";

import { TTextureId } from "@/mod/globals/textures";
import { XrTexture } from "@/mod/ui/components/base/XrTexture.component";

import { normalizeBaseNodeCoordinates } from "#/utils";

export interface IXrTabButtonProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  texture: TTextureId;
  children: JSXNode;
}

export function CustomTabButton(props: IXrTabButtonProps): JSXNode {
  const { x, y, width, height, children, texture, id } = normalizeBaseNodeCoordinates(props);

  return (
    <button x={x} y={y} width={width} height={height} id={id} stretch="1">
      <XrTexture id={texture} />
      {children}
    </button>
  );
}
