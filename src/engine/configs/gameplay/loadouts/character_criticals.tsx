import { JSXNode, JSXXML } from "jsx-xml";

export const defaultCharacterCritical: JSXNode = <critical_wound_weights>55,30,15</critical_wound_weights>;

export function create(): JSXNode {
  return defaultCharacterCritical;
}
