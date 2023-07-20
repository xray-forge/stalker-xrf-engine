import { describe, it } from "@jest/globals";

import { checkXrCondition } from "@/fixtures/engine";

describe("'world' conditions declaration", () => {
  it("should correctly inject external methods for game", () => {
    require("@/engine/scripts/declarations/conditions/world");

    checkXrCondition("is_rain");
    checkXrCondition("is_heavy_rain");
    checkXrCondition("is_day");
    checkXrCondition("is_dark_night");
    checkXrCondition("anomaly_has_artefact");
    checkXrCondition("surge_complete");
    checkXrCondition("surge_started");
    checkXrCondition("surge_kill_all");
    checkXrCondition("signal_rocket_flying");
    checkXrCondition("time_period");
    checkXrCondition("check_smart_alarm_status");
  });
});
