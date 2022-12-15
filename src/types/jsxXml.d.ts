import { JSXNode } from "jsx-xml";

declare namespace JSX {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }

    type Element = JSXNode;

    interface ElementChildrenAttribute {
      children: Record<string, any>;
    }
  }
}
