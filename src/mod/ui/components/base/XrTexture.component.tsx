import { JSXXML, JSXNode } from "jsx-xml";

import { TTextureId } from "@/mod/globals/textures";

interface IXrTextureProps {
  id?: TTextureId;
  idEnabled?: TTextureId;
  idTouched?: TTextureId;
  idDisabled?: TTextureId;
  idHighlighted: TTextureId;
}

/**
 * Render texture descriptors for an XML node.
 * Requires parameters to control state-id matching.
 */
export function XrTexture({ id, idHighlighted, idTouched, idDisabled, idEnabled }: IXrTextureProps): JSXNode {
  return [
    id ? <texture>{id}</texture> : null,
    idEnabled ? <texture> {idEnabled} </texture> : null,
    idTouched ? <texture> {idTouched} </texture> : null,
    idDisabled ? <texture> {idDisabled} </texture> : null,
    idHighlighted ? <texture> {idHighlighted} </texture> : null
  ];
}
