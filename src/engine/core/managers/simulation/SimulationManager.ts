import { actor_stats } from "xray16";
import { NetPacket, NetProcessor } from "xray16/alias";
import { ACTOR_ID, AnyObject } from "xray16/lib";
import { $filename, $isNotNil } from "xray16/macros";

import { getManager, registry } from "@/engine/core/database";
import { updateSimulationObjectAvailability } from "@/engine/core/database/simulation";
import { AbstractManager } from "@/engine/core/managers/abstract";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { simulationConfig } from "@/engine/core/managers/simulation/SimulationConfig";
import { destroySimulationData, initializeDefaultSimulationSquads } from "@/engine/core/managers/simulation/utils";
import { LuaLogger } from "@/engine/core/utils/logging";

const simulationLogger: LuaLogger = new LuaLogger($filename, { file: "simulation" });

/**
 * Manager handling simulation flow and events.
 * Built around atomic squad/terrain utils and shared config-storage.
 */
export class SimulationManager extends AbstractManager {
  public override initialize(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.registerCallback(EGameEvent.DUMP_LUA_DATA, this.onDebugDump, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_REGISTER, this.onActorRegister, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_GO_OFFLINE, this.onActorDestroy, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE_100, this.onActorUpdate100, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.unregisterCallback(EGameEvent.DUMP_LUA_DATA, this.onDebugDump);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_REGISTER, this.onActorRegister);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_GO_OFFLINE, this.onActorDestroy);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_UPDATE_100, this.onActorUpdate100);

    destroySimulationData();
  }

  public override save(packet: NetPacket): void {
    packet.w_bool(simulationConfig.IS_SIMULATION_INITIALIZED);
  }

  public override load(reader: NetProcessor): void {
    simulationConfig.IS_SIMULATION_INITIALIZED = reader.r_bool();
  }

  /**
   * Handle event of actor unregister in network.
   */
  public onActorDestroy(): void {
    simulationLogger.info("Actor network destroy");

    if ($isNotNil(actor_stats.remove_from_ranking)) {
      actor_stats.remove_from_ranking(ACTOR_ID);
    }
  }

  /**
   * Handle event of actor register in network.
   */
  public onActorRegister(): void {
    simulationLogger.info("Actor network register");

    initializeDefaultSimulationSquads();
  }

  /**
   * Refresh the actor as a simulation target on the actor 100ms cadence.
   */
  public onActorUpdate100(): void {
    updateSimulationObjectAvailability(registry.actorServer);
  }

  /**
   * Handle dump data event.
   *
   * @param data - Data to dump into file.
   */
  public onDebugDump(data: AnyObject): AnyObject {
    data[this.constructor.name] = {
      simulationConfig: simulationConfig,
    };

    return data;
  }
}
