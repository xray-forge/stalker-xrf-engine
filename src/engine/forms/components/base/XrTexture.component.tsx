import { JSXNode, JSXXML } from "jsx-xml";

import { TTexture } from "@/engine/globals/textures";
import { IBaseXmlNode } from "@/engine/lib/types";

export interface IXrTextureProps extends IBaseXmlNode {
  tag?: never;

  id?: TTexture;
  idEnabled?: TTexture;
  idTouched?: TTexture;
  idDisabled?: TTexture;
  idHighlighted?: TTexture;

  a?: number;
  r?: number;
  g?: number;
  b?: number;
}

/**
 * Render texture descriptors for an XML node.
 * Requires parameters to control state-id matching.
 */
export function XrTexture(props: IXrTextureProps): JSXNode {
  const { width, height, id, idHighlighted, idTouched, idDisabled, idEnabled, a, r, g, b } = props;

  return [
    id ? (
      <texture width={width} height={height} a={a} r={r} g={g} b={b}>
        {id}
      </texture>
    ) : null,
    idEnabled ? (
      <texture width={width} height={height} a={a} r={r} g={g} b={b}>
        {idEnabled}
      </texture>
    ) : null,
    idTouched ? (
      <texture width={width} height={height} a={a} r={r} g={g} b={b}>
        {idTouched}
      </texture>
    ) : null,
    idDisabled ? (
      <texture width={width} height={height} a={a} r={r} g={g} b={b}>
        {idDisabled}
      </texture>
    ) : null,
    idHighlighted ? (
      <texture width={width} height={height} a={a} r={r} g={g} b={b}>
        {idHighlighted}
      </texture>
    ) : null,
  ];
}
