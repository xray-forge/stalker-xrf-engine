import type { JSXNode } from "jsx-xml";

/**
 * Common XML attributes accepted by generated form components.
 */
export interface IBaseXmlNode {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  tag?: string;
  stretch?: boolean;
  children?: JSXNode;
}

/**
 * Horizontal alignment used by text form components.
 */
export type THorizontalTextAlign = "c" | "l" | "r";

/**
 * Vertical alignment used by text form components.
 */
export type TVerticalTextAlign = "c" | "t" | "b";
