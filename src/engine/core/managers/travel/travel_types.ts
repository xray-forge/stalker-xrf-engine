import { TConditionList } from "@/engine/core/utils/ini";
import { TLevel } from "@/engine/lib/constants/levels";
import { TName, TStringId } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ITravelRouteDescriptor {
  phraseId: TStringId;
  name: TName;
  level: TLevel;
  condlist: TConditionList;
}
