import { profile_timer } from "xray16";

import { getManager } from "@/engine/core/database";
import { ProfilingManager } from "@/engine/core/managers/debug/profiling/ProfilingManager";
import { ELuaLoggerMode, LuaLogger } from "@/engine/core/utils/logging";
import { AnyCallable, LuaArray, Optional, ProfileTimer, TDuration, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename, { mode: ELuaLoggerMode.DUAL, file: "profiling" });

/**
 * Portion of profiling metrics for isolated performance measuring of code execution.
 */
export class ProfilingPortion {
  /**
   * Create profiling mark entry for precise measurement of execution duration.
   */
  public static mark(name: Optional<TName | AnyCallable> = null): ProfilingPortion {
    const manager: ProfilingManager = getManager(ProfilingManager);
    const key: AnyCallable | TName = name ?? (debug?.getinfo(2)?.func as AnyCallable) ?? "unknown";

    let target: Optional<LuaArray<TDuration>> = manager.profilingPortions.get(key) as Optional<LuaArray<TDuration>>;

    if (target) {
      return new ProfilingPortion(target);
    } else {
      target = new LuaTable();
      manager.profilingPortions.set(key, target);

      return new ProfilingPortion(target);
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
  public commit(): TDuration {
    this.timer.stop();

    const duration: TDuration = this.timer.time();

    table.insert(this.target, duration);

    return duration;
  }
}
