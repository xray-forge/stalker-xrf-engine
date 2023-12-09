import { beforeEach, describe, expect, it } from "@jest/globals";

import { getManager } from "@/engine/core/database";
import { ProfilingManager } from "@/engine/core/managers/debug/profiling/ProfilingManager";
import { forgeConfig } from "@/engine/lib/configs/ForgeConfig";
import { ProfileTimer } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { replaceFunctionMock, resetFunctionMock } from "@/fixtures/jest";
import { MockProfileTimer } from "@/fixtures/xray/mocks/ProfileTimer.mock";

describe("ProfilingManager class", () => {
  beforeEach(() => {
    resetRegistry();
    forgeConfig.DEBUG.IS_PROFILING_ENABLED = true;

    resetFunctionMock(collectgarbage);
    resetFunctionMock(debug.sethook);
  });

  it("should correctly initialize fields", () => {
    forgeConfig.DEBUG.IS_PROFILING_ENABLED = false;

    const manager: ProfilingManager = getManager(ProfilingManager);

    expect(manager.mode).toBe("r");
    expect(manager.isProfilingStarted).toBe(false);
    expect(manager.profilingPortions).toEqualLuaTables({});
    expect(manager.countersMap).toEqualLuaTables({});
    expect(manager.namesMap).toEqualLuaTables({});
    expect(manager.callsCountMap).toEqualLuaTables({});
    expect(manager.profilingTimer).toBeInstanceOf(MockProfileTimer);
  });

  it("should correctly initialize with disabled debug", () => {
    forgeConfig.DEBUG.IS_PROFILING_ENABLED = false;

    const manager: ProfilingManager = getManager(ProfilingManager);

    expect(manager.isProfilingStarted).toBe(false);
    expect(manager.profilingTimer.start).not.toHaveBeenCalled();
    expect(debug.sethook).not.toHaveBeenCalled();
  });

  it("should correctly initialize with enabled debug and stop", () => {
    const manager: ProfilingManager = getManager(ProfilingManager);
    const previousTimer: ProfileTimer = manager.profilingTimer;

    expect(manager.isProfilingStarted).toBe(true);
    expect(manager.profilingTimer.start).toHaveBeenCalledTimes(1);
    expect(debug.sethook).toHaveBeenCalledTimes(2);
    expect(debug.sethook).toHaveBeenCalledWith(expect.any(Function), manager.mode);

    manager.stop();

    expect(manager.isProfilingStarted).toBe(false);
    expect(debug.sethook).toHaveBeenCalledTimes(3);
    expect(manager.profilingTimer).not.toBe(previousTimer);
    expect(manager.profilingTimer.stop).toHaveBeenCalledTimes(0);
    expect(previousTimer.stop).toHaveBeenCalledTimes(1);
  });

  it("should correctly collect garbage", () => {
    const manager: ProfilingManager = getManager(ProfilingManager);

    manager.collectLuaGarbage();

    expect(collectgarbage).toHaveBeenCalledTimes(1);
    expect(collectgarbage).toHaveBeenCalledWith("collect");
  });

  it("should correctly collect garbage", () => {
    const manager: ProfilingManager = getManager(ProfilingManager);

    replaceFunctionMock(collectgarbage, () => 512);

    expect(manager.getLuaMemoryUsed()).toBe(512);

    expect(collectgarbage).toHaveBeenCalledTimes(1);
    expect(collectgarbage).toHaveBeenCalledWith("count");
  });
});
