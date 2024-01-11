import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { getManager } from "@/engine/core/database";
import { ProfilingManager } from "@/engine/core/managers/debug/profiling/ProfilingManager";
import { ProfilingPortion } from "@/engine/core/managers/debug/profiling/ProfilingPortion";
import { resetRegistry } from "@/fixtures/engine";

describe("ProfilingPortion class", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly create marks", () => {
    const manager: ProfilingManager = getManager(ProfilingManager);

    expect(manager.profilingPortions.length()).toBe(0);

    const first: ProfilingPortion = ProfilingPortion.mark("test");

    expect(manager.profilingPortions.length()).toBe(1);

    first.commit();

    expect(manager.profilingPortions.length()).toBe(1);
    expect(manager.profilingPortions.get("test").length()).toBe(1);

    const second: ProfilingPortion = ProfilingPortion.mark("test");

    second.commit();

    expect(manager.profilingPortions.length()).toBe(1);
    expect(manager.profilingPortions.get("test").length()).toBe(2);

    const third: ProfilingPortion = ProfilingPortion.mark("test-2");

    third.commit();

    expect(manager.profilingPortions.length()).toBe(2);
    expect(manager.profilingPortions.get("test").length()).toBe(2);
    expect(manager.profilingPortions.get("test-2").length()).toBe(1);
  });

  it("should correctly calculate timers", () => {
    const manager: ProfilingManager = getManager(ProfilingManager);

    jest.spyOn(Date, "now").mockImplementation(() => 5000);

    expect(manager.profilingPortions.length()).toBe(0);

    const portion: ProfilingPortion = ProfilingPortion.mark("test");

    jest.spyOn(Date, "now").mockImplementation(() => 25_000);

    portion.commit();

    expect(manager.profilingPortions).toEqualLuaTables({
      test: [20_000],
    });
  });
});
