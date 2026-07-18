import { JSXNode, JSXXML } from "jsx-xml";
import { TName } from "xray16/lib";

import { normalizeBaseNodeProps } from "#/utils/xml";

import { XrTexture } from "@/engine/forms/components/base/XrTexture.component";
import { IBaseXmlNode } from "@/engine/forms/types";

export interface IXrTabButtonProps extends IBaseXmlNode {
  id: string;
  texture: TName;
  stretch?: boolean;
}

/**
 * Create a reusable tab button UI component with a texture.
 *
 * @param props - Configuration of the tab button node, including position, size, id and texture.
 * @returns Rendered tab button component.
 */
export function XrTabButton(props: IXrTabButtonProps): JSXNode {
  const { x, y, width, height, children, texture, id, stretch } = normalizeBaseNodeProps(props);

  return (
    <button x={x} y={y} width={width} height={height} id={id} stretch={stretch ? 1 : 0}>
      <XrTexture id={texture} />
      {children}
    </button>
  );
}
