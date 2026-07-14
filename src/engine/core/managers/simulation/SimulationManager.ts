import { actor_stats } from "xray16";
import { NetPacket, NetProcessor } from "xray16/alias";
import { ACTOR_ID, AnyObject, TDuration } from "xray16/lib";
import { $filename, $isNotNil } from "xray16/macros";

import { getManager, registry } from "@/engine/core/database";
import { updateSimulationObjectAvailability } from "@/engine/core/database/simulation";
import { AbstractManager } from "@/engine/core/managers/abstract";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { simulationConfig } from "@/engine/core/managers/simulation/SimulationConfig";
import { SmartTerrainJobScheduler } from "@/engine/core/managers/simulation/SmartTerrainJobScheduler";
import { destroySimulationData, initializeDefaultSimulationSquads } from "@/engine/core/managers/simulation/utils";
import { type SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { LuaLogger } from "@/engine/core/utils/logging";

const simulationLogger: LuaLogger = new LuaLogger($filename, { file: "simulation" });

/**
 * Manager handling simulation flow and events.
 * Built around atomic squad/terrain utils and shared config-storage.
 */
export class SimulationManager extends AbstractManager {
  private dirtyTerrainJobScheduler: SmartTerrainJobScheduler = new SmartTerrainJobScheduler();

  public override initialize(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.registerCallback(EGameEvent.DUMP_LUA_DATA, this.onDebugDump, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_REGISTER, this.onActorRegister, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_GO_OFFLINE, this.onActorDestroy, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE, this.onActorUpdate, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE_100, this.onActorUpdate100, this);
    eventsManager.registerCallback(EGameEvent.SMART_TERRAIN_REGISTER, this.onSmartTerrainRegister, this);
    eventsManager.registerCallback(EGameEvent.SMART_TERRAIN_UNREGISTER, this.onSmartTerrainUnregister, this);
    eventsManager.registerCallback(EGameEvent.SMART_TERRAIN_JOBS_DIRTY, this.onSmartTerrainJobsDirty, this);

    this.dirtyTerrainJobScheduler.initialize();
  }

  public override destroy(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.unregisterCallback(EGameEvent.DUMP_LUA_DATA, this.onDebugDump);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_REGISTER, this.onActorRegister);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_GO_OFFLINE, this.onActorDestroy);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_UPDATE, this.onActorUpdate);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_UPDATE_100, this.onActorUpdate100);
    eventsManager.unregisterCallback(EGameEvent.SMART_TERRAIN_REGISTER, this.onSmartTerrainRegister);
    eventsManager.unregisterCallback(EGameEvent.SMART_TERRAIN_UNREGISTER, this.onSmartTerrainUnregister);
    eventsManager.unregisterCallback(EGameEvent.SMART_TERRAIN_JOBS_DIRTY, this.onSmartTerrainJobsDirty);

    this.dirtyTerrainJobScheduler.reset();

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
   * Delegate the actor update cadence to the smart-terrain dirty-job scheduler.
   *
   * @param delta - Time passed since the previous actor update, in milliseconds.
   */
  public onActorUpdate(delta: TDuration): void {
    this.dirtyTerrainJobScheduler.update(delta);
  }

  /**
   * Queue initial dirty state after a terrain has finished registration.
   *
   * @param terrain - Newly registered smart terrain.
   */
  public onSmartTerrainRegister(terrain: SmartTerrain): void {
    this.dirtyTerrainJobScheduler.register(terrain);
  }

  /**
   * Drop any transient queued work for an unregistered terrain.
   *
   * @param terrain - Smart terrain leaving the active simulation.
   */
  public onSmartTerrainUnregister(terrain: SmartTerrain): void {
    this.dirtyTerrainJobScheduler.unregister(terrain);
  }

  /**
   * Deduplicate an invalidated terrain. Descriptor ids are captured lazily at processing time so
   * invalidations caused during the same smart-terrain update coalesce into one pass.
   *
   * @param terrain - Smart terrain requiring full job reselection.
   */
  public onSmartTerrainJobsDirty(terrain: SmartTerrain): void {
    this.dirtyTerrainJobScheduler.schedule(terrain);
  }

  /**
   * Handle dump data event.
   *
   * @param data - Data to dump into file.
   */
  public onDebugDump(data: AnyObject): AnyObject {
    data[this.constructor.name] = {
      simulationConfig: simulationConfig,
      dirtyTerrainJobPassesCount: this.dirtyTerrainJobScheduler.getPendingPassesCount(),
    };

    return data;
  }
}
