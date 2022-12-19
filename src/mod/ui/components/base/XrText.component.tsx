import { JSXNode, JSXXML } from "jsx-xml";

import { TFontId } from "@/mod/globals/fonts";
import { TTextAlign } from "@/mod/lib/types";

interface IXrTextProps {
  tag?: string;
  label: string;
  font: TFontId;
  align?: TTextAlign;
}

/**
 * Generic component for text rendering.
 */
export function XrText({ tag= "text", font, align, label }: IXrTextProps): JSXNode {
  return JSXXML(
    tag,
    {
      font,
      align
    },
    label
  );
}
