import { TConditionList } from "@/engine/core/utils/ini";

/**
 * todo;
 */
export interface ITravelRouteDescriptor {
  phrase_id: string;
  name: string;
  level: string;
  condlist: TConditionList;
}
