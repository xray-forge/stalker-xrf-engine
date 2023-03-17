import { JSXNode, JSXXML } from "jsx-xml";

import { MapSpots } from "@/engine/forms/game/map/MapSpots.component";

export const IS_XML: boolean = true;

export function create(): JSXNode {
  return <MapSpots />;
}
