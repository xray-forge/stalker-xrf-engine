import { TName, TStringId } from "xray16/lib";

import { TConditionList } from "@/engine/core/utils/ini";
import { TLevel } from "@/engine/lib/constants/levels";

/**
 * Descriptor of a travel route destination available in the traveler dialog.
 */
export interface ITravelRouteDescriptor {
  phraseId: TStringId;
  name: TName;
  level: TLevel;
  condlist: TConditionList;
}
