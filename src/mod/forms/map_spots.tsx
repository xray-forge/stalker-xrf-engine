import { JSXNode, JSXXML } from "jsx-xml";

import { MapSpots } from "@/mod/forms/game/map/MapSpots.component";

export const IS_XML: boolean = true;

export function create(): JSXNode {
  return <MapSpots />;
}
