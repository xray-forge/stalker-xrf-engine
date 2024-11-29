import { cse_alife_monster_base, level, LuabindClass } from "xray16";

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
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { Squad } from "@/engine/core/objects/squad";
import { parseNumberOptional, parseStringOptional, readIniString } from "@/engine/core/utils/ini";
import { MAX_ALIFE_ID } from "@/engine/lib/constants/memory";
import { IniFile, NetPacket, Optional, ServerCreatureObject, TName, TNumberId } from "@/engine/lib/types";

/**
 * Server object representation of any monster.
 */
@LuabindClass()
export class Monster extends cse_alife_monster_base {
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

  public override on_register(): void {
    super.on_register();

    registerOfflineObject(this.id);
    registerObjectStoryLinks(this);

    this.brain().can_choose_alife_tasks(false);

    const terrainName: Optional<TName> = readIniString(this.spawn_ini() as IniFile, "logic", "smart_terrain");
    const terrain: Optional<SmartTerrain> = terrainName ? getSimulationTerrainByName(terrainName) : null;

    if (terrain) {
      registry.simulator.object<SmartTerrain>(terrain.id)!.register_npc(this);
    }

    EventsManager.emitEvent(EGameEvent.MONSTER_REGISTER, this);
  }

  public override on_unregister(): void {
    EventsManager.emitEvent(EGameEvent.MONSTER_UNREGISTER, this);

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

    if (this.m_smart_terrain_id !== MAX_ALIFE_ID) {
      (registry.simulator.object(this.m_smart_terrain_id) as SmartTerrain).onObjectDeath(this);
    }

    if (this.group_id !== MAX_ALIFE_ID) {
      (registry.simulator.object(this.group_id) as Squad).onMemberDeath(this);
    }

    EventsManager.emitEvent(EGameEvent.MONSTER_DEATH_ALIFE, this, killer);
  }

  public override STATE_Write(packet: NetPacket): void {
    super.STATE_Write(packet);

    packet.w_stringZ(
      tostring(
        this.online
          ? level?.object_by_id(this.id)?.level_vertex_id()
          : registry.offlineObjects.get(this.id)?.levelVertexId
      )
    );

    packet.w_stringZ(tostring(registry.offlineObjects.get(this.id)?.activeSection));
  }

  public override STATE_Read(packet: NetPacket, size: number): void {
    super.STATE_Read(packet, size);

    const offlineState: IRegistryOfflineState = registerOfflineObject(this.id);

    offlineState.levelVertexId = parseNumberOptional(packet.r_stringZ());
    offlineState.activeSection = parseStringOptional(packet.r_stringZ());
  }
}
