import { beforeAll, describe, it } from "@jest/globals";

import { checkXrCondition } from "@/fixtures/engine";

describe("world conditions declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/conditions/world");
  });

  it("should correctly inject external methods for game", () => {
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

describe("world conditions implementation", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/conditions/world");
  });

  it.todo("is_rain should check weather");

  it.todo("is_heavy_rain should check weather");

  it.todo("is_day should check weather");

  it.todo("is_dark_night should check weather");

  it.todo("anomaly_has_artefact should check anomalies");

  it.todo("surge_complete should check surge state");

  it.todo("surge_started should check surge state");

  it.todo("surge_kill_all should check surge state");

  it.todo("signal_rocket_flying should check surge signal rockets");

  it.todo("time_period should check time");

  it.todo("check_smart_alarm_status should check smart terrain alarm status");
});
