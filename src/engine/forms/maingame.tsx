import { JSXNode, JSXXML } from "jsx-xml";

import { GameUi } from "@/engine/forms/game/GameUi.component";

export const IS_XML: boolean = true;

export function create(): JSXNode {
  return <GameUi />;
}
