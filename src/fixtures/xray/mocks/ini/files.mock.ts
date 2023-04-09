import { AnyObject } from "@/engine/lib/types";

export const MOCKS: Record<string, AnyObject> = {
  "misc\\script_sound.ltx": {
    list: {},
  },
  "misc\\death_generic.ltx": {
    keep_items: {},
  },
  "misc\\surge_manager.ltx": {
    settings: {
      condlist: "test",
    },
  },
  "environment\\dynamic_weather_graphs.ltx": {
    dynamic_default: {
      clear: 0.4,
      cloudy: 0.4,
      rain: 0.1,
      thunder: 0.1,
    },
  },
};
