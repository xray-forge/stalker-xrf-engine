import { cse_alife_human_stalker, level, LuabindClass } from "xray16";

import {
  IRegistryOfflineState,
  registerObjectStoryLinks,
  registerOfflineObject,
  registry,
  unregisterOfflineObject,
  unregisterStoryLinkByObjectId,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { getSimulationTerrainByName } from "@/engine/core/managers/simulation/utils";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import type { Squad } from "@/engine/core/objects/squad";
import { assert } from "@/engine/core/utils/assertion";
import { parseNumberOptional, parseStringOptional, readIniString } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { MAX_ALIFE_ID } from "@/engine/lib/constants/memory";
import { IniFile, NetPacket, Optional, ServerCreatureObject, TName, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Generic human stalker object server representation.
 */
@LuabindClass()
export class Stalker extends cse_alife_human_stalker {
  public isCorpseLootDropped: boolean = false;

  public override can_switch_offline(): boolean {
    if (this.group_id !== MAX_ALIFE_ID) {
      return true;
    }

    return super.can_switch_offline();
  }

  public override can_switch_online(): boolean {
    if (this.group_id !== MAX_ALIFE_ID) {
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

    const terrainName: TName = readIniString(this.spawn_ini() as IniFile, "logic", "smart_terrain", false, null, "");
    const terrain: Optional<SmartTerrain> = getSimulationTerrainByName(terrainName);

    if (terrain) {
      terrain.register_npc(this);
    }

    EventsManager.emitEvent(EGameEvent.STALKER_REGISTER, this);
  }

  public override on_unregister(): void {
    EventsManager.emitEvent(EGameEvent.STALKER_UNREGISTER, this);

    const terrainId: TNumberId = this.smart_terrain_id();
    const terrain: Optional<SmartTerrain> = terrainId === MAX_ALIFE_ID ? null : registry.simulator.object(terrainId);

    if (terrain) {
      terrain.unregister_npc(this);
    }

    unregisterOfflineObject(this.id);
    unregisterStoryLinkByObjectId(this.id);

    super.on_unregister();
  }

  public override on_death(killer: ServerCreatureObject): void {
    super.on_death(killer);

    logger.info("Stalker death: %s %s %s", this.name(), killer.id, killer?.name());

    // Notify assigned smart terrain about abject death.
    const terrainId: TNumberId = this.smart_terrain_id();

    if (terrainId !== MAX_ALIFE_ID) {
      const terrain: Optional<SmartTerrain> = registry.simulator.object(terrainId);

      assert(terrain, "Smart terrain with ID '%s' not found.", this.group_id);

      terrain.onObjectDeath(this);
    }

    // Notify assigned squad about abject death.
    if (this.group_id !== MAX_ALIFE_ID) {
      const squad: Optional<Squad> = registry.simulator.object(this.group_id);

      assert(squad, "Squad with ID '%s' not found.", this.group_id);

      squad.onMemberDeath(this);
    }

    EventsManager.emitEvent(EGameEvent.STALKER_DEATH_ALIFE, this, killer);
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
