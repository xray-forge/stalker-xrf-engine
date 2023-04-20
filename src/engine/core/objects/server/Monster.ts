import {
  alife,
  cse_alife_monster_base,
  level,
  LuabindClass,
  XR_cse_alife_creature_abstract,
  XR_ini_file,
  XR_net_packet,
} from "xray16";

import {
  hardResetOfflineObject,
  IStoredOfflineObject,
  registerObjectStoryLinks,
  registerOfflineObject,
  registry,
  unregisterStoryLinkByObjectId,
} from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import { Squad } from "@/engine/core/objects";
import { onSmartTerrainObjectDeath, SmartTerrain } from "@/engine/core/objects/server/smart";
import { assert } from "@/engine/core/utils/assertion";
import { readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { NIL } from "@/engine/lib/constants/words";
import { Optional, StringOptional, TName, TNumberId, TSection } from "@/engine/lib/types";

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

  public override STATE_Write(packet: XR_net_packet): void {
    super.STATE_Write(packet);

    if (this.online) {
      packet.w_stringZ(
        tostring(level && level.object_by_id(this.id) && level.object_by_id(this.id)!.level_vertex_id())
      );
    } else {
      packet.w_stringZ(tostring(registry.offlineObjects.get(this.id)?.level_vertex_id));
    }

    packet.w_stringZ(tostring(registry.offlineObjects.get(this.id)?.active_section));
  }

  public override STATE_Read(packet: XR_net_packet, size: number): void {
    super.STATE_Read(packet, size);

    const oldLevelId: StringOptional = packet.r_stringZ();
    const oldSection: StringOptional = packet.r_stringZ();
    const offlineObject: IStoredOfflineObject = registerOfflineObject(this.id);

    offlineObject.active_section = oldSection === NIL ? null : oldSection;
    offlineObject.level_vertex_id = oldLevelId === NIL ? null : (tonumber(oldLevelId) as number);
  }

  public override on_register(): void {
    super.on_register();

    logger.info("Register:", this.id, this.name(), this.section_name());
    registerObjectStoryLinks(this);

    const simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();

    registerOfflineObject(this.id);

    this.brain().can_choose_alife_tasks(false);

    const objectIni: XR_ini_file = this.spawn_ini();
    const smartName: TName = readIniString(objectIni, "logic", "smart_terrain", false, "", "");
    const smartTerrain: Optional<SmartTerrain> = simulationBoardManager.getSmartTerrainByName(smartName);

    if (smartTerrain === null) {
      return;
    } else {
      alife().object<SmartTerrain>(smartTerrain.id)!.register_npc(this);
    }
  }

  public override on_unregister(): void {
    logger.info("Unregister:", this.name());

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

  public override on_death(killer: XR_cse_alife_creature_abstract): void {
    super.on_death(killer);

    logger.info("On death:", this.name(), killer?.name());

    onSmartTerrainObjectDeath(this);

    if (this.group_id !== MAX_U16) {
      const squad: Optional<Squad> = alife().object(this.group_id);

      assert(squad, "There is no squad with ID [%s]", this.group_id);

      squad.onSquadObjectDeath(this);
    }
  }
}
