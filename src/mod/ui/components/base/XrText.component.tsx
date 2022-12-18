import { JSXNode, JSXXML } from "jsx-xml";

import { TFontId } from "@/mod/globals/fonts";
import { TTextAlign } from "@/mod/lib/types";

interface IXrTextProps {
  label: string;
  font: TFontId;
  align: TTextAlign;
}

/**
 * Generic component for text rendering.
 */
export function XrText({ font, align, label }: IXrTextProps): JSXNode {
  return (
    <text font={font} align={align}>{label}</text>
  );
}
