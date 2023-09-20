import { profile_timer } from "xray16";

import { ProfilingManager } from "@/engine/core/managers/debug/profiling/ProfilingManager";
import { ELuaLoggerMode, LuaLogger } from "@/engine/core/utils/logging";
import { AnyCallable, LuaArray, Optional, ProfileTimer, TDuration } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename, { mode: ELuaLoggerMode.DUAL, file: "profiling" });

/**
 * Portion of profiling metrics for isolated performance measuring of code execution.
 */
export class ProfilingPortion {
  /**
   * Create profiling mark entry for precise measurement of execution duration.
   */
  public static mark(): ProfilingPortion {
    const manager: ProfilingManager = ProfilingManager.getInstance();
    const functionInfo: debug.FunctionInfo = debug.getinfo(2)!;
    const functionRef: AnyCallable = functionInfo.func as AnyCallable;

    let target: Optional<LuaArray<TDuration>> = manager.profilingPortions.get(functionRef);

    if (target === null) {
      target = new LuaTable();
      manager.profilingPortions.set(functionRef, target);

      return new ProfilingPortion(manager.profilingPortions.get(functionRef));
    } else {
      return new ProfilingPortion(manager.profilingPortions.get(functionRef));
    }
  }

  public timer: ProfileTimer = new profile_timer();
  public target: LuaArray<TDuration>;

  protected constructor(target: LuaArray<TDuration>) {
    this.target = target;
    this.timer.start();
  }

  /**
   * Stop profiling mark and save execution timing.
   */
  public commit(): void {
    this.timer.stop();
    table.insert(this.target, this.timer.time());
  }
}
