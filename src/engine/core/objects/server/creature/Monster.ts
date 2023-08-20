import { alife, cse_alife_monster_base, level, LuabindClass } from "xray16";

import {
  hardResetOfflineObject,
  IStoredOfflineObject,
  registerObjectStoryLinks,
  registerOfflineObject,
  registry,
  unregisterStoryLinkByObjectId,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers";
import { SimulationBoardManager } from "@/engine/core/managers/simulation/SimulationBoardManager";
import { Squad } from "@/engine/core/objects";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain";
import { assert } from "@/engine/core/utils/assertion";
import { parseNumberOptional, parseStringOptional } from "@/engine/core/utils/ini/ini_parse";
import { readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { IniFile, NetPacket, Optional, ServerCreatureObject, TName, TNumberId, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class Monster extends cse_alife_monster_base {
  public constructor(section: TSection) {
    super(section);
    hardResetOfflineObject(this.id);
  }

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

  public override switch_online(): void {
    logger.info("Switch online:", this.name());
    super.switch_online();
  }

  public override switch_offline(): void {
    logger.info("Switch offline:", this.name());
    super.switch_offline();
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

    const offlineObject: IStoredOfflineObject = registerOfflineObject(this.id);

    offlineObject.levelVertexId = parseNumberOptional(packet.r_stringZ());
    offlineObject.activeSection = parseStringOptional(packet.r_stringZ());
  }

  public override on_register(): void {
    super.on_register();

    registerObjectStoryLinks(this);

    const simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();

    registerOfflineObject(this.id);

    this.brain().can_choose_alife_tasks(false);

    const objectIni: IniFile = this.spawn_ini();
    const smartName: TName = readIniString(objectIni, "logic", "smart_terrain", false, "", "");
    const smartTerrain: Optional<SmartTerrain> = simulationBoardManager.getSmartTerrainByName(smartName);

    if (smartTerrain === null) {
      return;
    } else {
      alife().object<SmartTerrain>(smartTerrain.id)!.register_npc(this);
    }
  }

  public override on_unregister(): void {
    const smartTerrainId: TNumberId = this.smart_terrain_id();

    if (smartTerrainId !== MAX_U16) {
      const smartTerrain: Optional<SmartTerrain> = alife().object(smartTerrainId);

      if (smartTerrain !== null) {
        smartTerrain.unregister_npc(this);
      }
    }

    registry.offlineObjects.delete(this.id);
    unregisterStoryLinkByObjectId(this.id);

    super.on_unregister();
  }

  public override on_death(killer: ServerCreatureObject): void {
    super.on_death(killer);

    logger.info("On monster death:", this.name(), killer.id, killer?.name());

    // Notify assigned smart terrain about abject death.
    const smartTerrainId: TNumberId = this.smart_terrain_id();

    if (smartTerrainId !== MAX_U16) {
      (alife().object(smartTerrainId) as SmartTerrain).onObjectDeath(this);
    }

    // Notify assigned squad about death.
    if (this.group_id !== MAX_U16) {
      const squad: Optional<Squad> = alife().object(this.group_id);

      assert(squad, "There is no squad with ID [%s]", this.group_id);

      squad.onSquadObjectDeath(this);
    }

    EventsManager.emitEvent(EGameEvent.MONSTER_DEATH, this, killer);
  }
}
