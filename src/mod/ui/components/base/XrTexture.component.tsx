import { JSXXML, JSXNode } from "jsx-xml";

import { TTextureId } from "@/mod/globals/textures";

interface IXrTextureProps {
  id: TTextureId;
}

/**
 * Texture description.
 */
export function XrTexture({ id }: IXrTextureProps): JSXNode {
  return <texture>{id}</texture>;
}
