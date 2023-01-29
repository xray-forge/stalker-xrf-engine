import { profile_timer, XR_profile_timer } from "xray16";

import { AnyCallable, Optional } from "@/mod/lib/types";
import { AbstractCoreManager } from "@/mod/scripts/core/managers/AbstractCoreManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("ProfilingManager");

export interface IProfileSnapshotDescriptor {
  count: number;
  currentTimer: XR_profile_timer;
  childTimer: XR_profile_timer;
}

export class ProfilingManager extends AbstractCoreManager {
  public Counters: LuaTable<AnyCallable, IProfileSnapshotDescriptor> = new LuaTable();
  public Names: LuaTable<AnyCallable, debug.FunctionInfo> = new LuaTable();
  public profilingTimer = new profile_timer();
  public isProfilingStarted: boolean = false;

  public getFunctionName(func: AnyCallable): string {
    const n = this.Names.get(func);
    const loc = string.format("[%s]:%s", n.short_src, n.linedefined);

    if (n.namewhat !== "") {
      return string.format("%s (%s)", loc, n.name);
    } else {
      return string.format("%s", loc);
    }
  }

  public clear(): void {
    if (this.isProfilingStarted === true) {
      this.clearHook();
    }

    this.Counters = new LuaTable();
    this.Names = new LuaTable();
    this.profilingTimer = new profile_timer();

    this.setupHook(true);
  }

  public logProfilingStats(): void {
    if (this.isProfilingStarted === false) {
      log.info("Profiler hook wasn't setup!");

      return;
    }

    this.clearHook();

    log.info("Profiler statistics");

    const sort_stats: LuaTable<string, IProfileSnapshotDescriptor> = new LuaTable();

    for (const [func, snapshot] of this.Counters) {
      const n = this.getFunctionName(func);
      const existingSnapshot: Optional<IProfileSnapshotDescriptor> = sort_stats.get(n);

      if (existingSnapshot === null) {
        sort_stats.set(n, snapshot);
      } else {
        existingSnapshot.count = existingSnapshot.count + snapshot.count;
        existingSnapshot.currentTimer = (existingSnapshot.currentTimer as any) + snapshot.currentTimer;
        existingSnapshot.childTimer = (existingSnapshot.childTimer as any) + snapshot.childTimer;
      }
    }

    let script: XR_profile_timer = new profile_timer();
    let count: number = 0;
    const out_stats = new LuaTable();

    for (const [i, j] of sort_stats) {
      let k: string = i;

      if (k === "[[C]]:-1") {
        k = "#uncrecognized C/C++ stuff";
      }

      table.insert(out_stats, { name: k, count: j });

      script = (script as any) + j.currentTimer;
      count = count + j.count;
    }

    table.sort(out_stats, (a, b) => a.count.timer < b.count.timer);

    log.info("Total_time (pecent)  child_time [total_call_count][average_call_time]");

    for (const [n, c] of out_stats) {
      log.info(
        string.format(
          "%9.2fms (%5.2f%%) %9.2fms [%8d][%9.2fmks] : %s",
          c.count.timer.time() / 1000,
          (c.count.timer.time() * 100) / script.time(),
          c.count.child_timer.time() / 1000,
          c.count.count,
          c.count.timer.time() / c.count.count,
          c.name
        )
      );
    }

    log.info("");
    log.info("pure time:   %%%%   :  children  :   count  : function name");
    log.info("");
    log.info(string.format("profile time: %8.2fms", this.profilingTimer.time() / 1000));
    log.info(
      string.format(
        "script time: %8.2fms (%5.2f%%)",
        script.time() / 1000,
        (script.time() * 100) / this.profilingTimer.time()
      )
    );
    log.info("call count: ", count);

    this.setupHook(true);
  }

  public setupHook(skipLogs?: boolean): void {
    if (this.isProfilingStarted === true) {
      log.info("Skip setup, already started");

      return;
    } else if (!debug) {
      log.warn("Tried to setup hook, but debug is not enabled");
    }

    this.profilingTimer.start();

    debug.sethook((context, lineNumber) => this.hook(context, lineNumber), "cr");

    this.isProfilingStarted = true;

    if (!skipLogs) {
      log.info("Profiler is activated");
    }
  }

  public clearHook(): void {
    if (this.isProfilingStarted === false) {
      log.info("Profiler hook wasn't setup!");

      return;
    }

    debug.sethook();
    this.profilingTimer.stop();

    this.isProfilingStarted = false;
  }

  protected hook(context: string, line_number?: number): void {
    const caller = debug.getinfo(3, "f")!;
    const functionRef: AnyCallable = debug.getinfo(2, "f")!.func! as AnyCallable;
    const callerRef: Optional<AnyCallable> = caller === null ? null : (caller.func! as AnyCallable);

    switch (context) {
      case "return": {
        const object = this.Counters.get(functionRef);

        if (object !== null) {
          object.currentTimer.stop();
          object.childTimer.stop();
          if (callerRef !== null) {
            const object = this.Counters.get(callerRef);

            if (object !== null) {
              object.currentTimer.start();
            }
          }
        }

        return;
      }

      case "tail return": {
        if (callerRef !== null) {
          const object = this.Counters.get(callerRef());

          if (object !== null) {
            object.currentTimer.start();
          }
        }

        return;
      }

      case "call": {
        if (callerRef !== null) {
          const object = this.Counters.get(callerRef!);

          if (object !== null) {
            object.currentTimer.stop();
          }
        }

        if (this.Counters.get(functionRef) === null) {
          this.Counters.set(functionRef, {
            count: 1,
            currentTimer: new profile_timer(),
            childTimer: new profile_timer()
          });

          const object = this.Counters.get(functionRef);

          object.childTimer.start();
          object.currentTimer.start();
          this.Names.set(functionRef, debug.getinfo(2, "Sn") as debug.FunctionInfo);
        } else {
          const object = this.Counters.get(functionRef);

          object.count = object.count + 1;
          object.childTimer.start();
          object.currentTimer.start();
        }

        return;
      }
    }
  }
}
