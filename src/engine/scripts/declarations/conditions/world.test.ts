import { describe, expect, it } from "@jest/globals";

import { AnyObject } from "@/engine/lib/types";

describe("'world' conditions declaration", () => {
  const checkBinding = (name: string, container: AnyObject = global) => {
    expect(container["xr_conditions"][name]).toBeDefined();
  };

  it("should correctly inject external methods for game", () => {
    require("@/engine/scripts/declarations/conditions/world");

    checkBinding("is_rain");
    checkBinding("is_heavy_rain");
    checkBinding("is_day");
    checkBinding("is_dark_night");
    checkBinding("anomaly_has_artefact");
    checkBinding("surge_complete");
    checkBinding("surge_started");
    checkBinding("surge_kill_all");
    checkBinding("signal_rocket_flying");
    checkBinding("time_period");
    checkBinding("check_smart_alarm_status");
  });
});
