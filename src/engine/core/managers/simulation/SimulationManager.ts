import { actor_stats } from "xray16";

import { getManager } from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/abstract";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { simulationConfig } from "@/engine/core/managers/simulation/SimulationConfig";
import { destroySimulationData, initializeDefaultSimulationSquads } from "@/engine/core/managers/simulation/utils";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { NetPacket, NetProcessor } from "@/engine/lib/types";

const simulationLogger: LuaLogger = new LuaLogger($filename, { file: "simulation" });

/**
 * Manager handling simulation flow and events.
 * Built around atomic squad/terrain utils and shared config-storage.
 */
export class SimulationManager extends AbstractManager {
  public override initialize(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.registerCallback(EGameEvent.ACTOR_REGISTER, this.onActorRegister, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_GO_OFFLINE, this.onActorDestroy, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.unregisterCallback(EGameEvent.ACTOR_REGISTER, this.onActorRegister);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_GO_OFFLINE, this.onActorDestroy);

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

    if (actor_stats.remove_from_ranking !== null) {
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
}
