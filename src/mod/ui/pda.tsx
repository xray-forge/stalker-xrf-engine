import { JSXNode, JSXXML } from "jsx-xml";

import { Pda } from "@/mod/ui/game/map/Pda.component";

export const IS_XML: boolean = true;

export function create(): JSXNode {
  return <Pda />;
}
