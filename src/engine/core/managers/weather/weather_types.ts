import { Optional, TName, TProbability } from "@/engine/lib/types";

/**
 * todo;
 */
export interface IWeatherState {
  currentState: Optional<TName>;
  nextState: Optional<TName>;
  weatherName: TName;
  weatherGraph: LuaTable<TName, TProbability>;
}
