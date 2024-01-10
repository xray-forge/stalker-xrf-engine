import { cse_alife_human_stalker, level, LuabindClass } from "xray16";

import {
  getManager,
  IRegistryOfflineState,
  registerObjectStoryLinks,
  registerOfflineObject,
  registry,
  unregisterOfflineObject,
  unregisterStoryLinkByObjectId,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { SimulationManager } from "@/engine/core/managers/simulation/SimulationManager";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import type { Squad } from "@/engine/core/objects/squad";
import { assert } from "@/engine/core/utils/assertion";
import { parseNumberOptional, parseStringOptional } from "@/engine/core/utils/ini/ini_parse";
import { readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { IniFile, NetPacket, Optional, ServerCreatureObject, TName, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Generic human stalker object server representation.
 */
@LuabindClass()
export class Stalker extends cse_alife_human_stalker {
  public isCorpseLootDropped: boolean = false;

  public override can_switch_offline(): boolean {
    if (this.group_id !== MAX_U16) {
      return true;
    }

    return super.can_switch_offline();
  }

  public override can_switch_online(): boolean {
    if (this.group_id !== MAX_U16) {
      return true;
    }

    return super.can_switch_online();
  }

  public override on_spawn(): void {
    super.on_spawn();

    EventsManager.emitEvent(EGameEvent.STALKER_SPAWN, this);
  }

  public override on_register(): void {
    super.on_register();

    registerOfflineObject(this.id);
    registerObjectStoryLinks(this);

    this.brain().can_choose_alife_tasks(false);

    const simulationBoardManager: SimulationManager = getManager(SimulationManager);

    const smartName: TName = readIniString(this.spawn_ini() as IniFile, "logic", "smart_terrain", false, null, "");
    const smartTerrain: Optional<SmartTerrain> = simulationBoardManager.getSmartTerrainByName(smartName);

    if (smartTerrain) {
      smartTerrain.register_npc(this);
    }

    EventsManager.emitEvent(EGameEvent.STALKER_REGISTER, this);
  }

  public override on_unregister(): void {
    EventsManager.emitEvent(EGameEvent.STALKER_UNREGISTER, this);

    const smartTerrainId: TNumberId = this.smart_terrain_id();
    const smartTerrain: Optional<SmartTerrain> =
      smartTerrainId === MAX_U16 ? null : registry.simulator.object(smartTerrainId);

    if (smartTerrain) {
      smartTerrain.unregister_npc(this);
    }

    unregisterOfflineObject(this.id);
    unregisterStoryLinkByObjectId(this.id);

    super.on_unregister();
  }

  public override on_death(killer: ServerCreatureObject): void {
    super.on_death(killer);

    logger.format("Stalker death: %s %s %s", this.name(), killer.id, killer?.name());

    // Notify assigned smart terrain about abject death.
    const smartTerrainId: TNumberId = this.smart_terrain_id();

    if (smartTerrainId !== MAX_U16) {
      const smartTerrain: Optional<SmartTerrain> = registry.simulator.object(smartTerrainId);

      assert(smartTerrain, "Smart terrain with ID '%s' not found.", this.group_id);

      smartTerrain.onObjectDeath(this);
    }

    // Notify assigned squad about abject death.
    if (this.group_id !== MAX_U16) {
      const squad: Optional<Squad> = registry.simulator.object(this.group_id);

      assert(squad, "Squad with ID '%s' not found.", this.group_id);

      squad.onMemberDeath(this);
    }

    EventsManager.emitEvent(EGameEvent.STALKER_DEATH, this, killer);
  }

  public override STATE_Write(packet: NetPacket): void {
    super.STATE_Write(packet);

    packet.w_stringZ(
      tostring(
        this.online
          ? level?.object_by_id(this.id)?.level_vertex_id()
          : registry.offlineObjects.get(this.id).levelVertexId
      )
    );

    packet.w_stringZ(tostring(registry.offlineObjects.get(this.id).activeSection));
    packet.w_bool(this.isCorpseLootDropped);
  }

  public override STATE_Read(packet: NetPacket, size: number): void {
    super.STATE_Read(packet, size);

    const offlineObject: IRegistryOfflineState = registerOfflineObject(this.id);
    const oldVertexId: Optional<TNumberId> = parseNumberOptional(packet.r_stringZ());

    offlineObject.activeSection = parseStringOptional(packet.r_stringZ());
    offlineObject.levelVertexId = oldVertexId ? oldVertexId : offlineObject.levelVertexId;

    this.isCorpseLootDropped = packet.r_bool();
  }
}
