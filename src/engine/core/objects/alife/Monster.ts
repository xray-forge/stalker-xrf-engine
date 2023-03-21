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
import { SimulationBoardManager } from "@/engine/core/managers/SimulationBoardManager";
import { onSmartTerrainObjectDeath, SmartTerrain } from "@/engine/core/objects/alife/smart/SmartTerrain";
import { abort } from "@/engine/core/utils/debug";
import { getConfigString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { NIL } from "@/engine/lib/constants/words";
import { Optional, StringOptional, TNumberId, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class Monster extends cse_alife_monster_base {
  public ini: Optional<XR_ini_file> = null;
  public isRegistered: boolean = false;

  /**
   * todo: Description.
   */
  public constructor(section: TSection) {
    super(section);
    hardResetOfflineObject(this.id);
  }

  /**
   * todo: Description.
   */
  public override can_switch_offline(): boolean {
    if (this.group_id !== MAX_U16) {
      return true;
    }

    return super.can_switch_offline();
  }

  /**
   * todo: Description.
   */
  public override can_switch_online(): boolean {
    if (this.group_id !== MAX_U16) {
      return true;
    }

    return super.can_switch_online();
  }

  /**
   * todo: Description.
   */
  public override switch_online(): void {
    logger.info("Switch online:", this.name());
    super.switch_online();
  }

  /**
   * todo: Description.
   */
  public override switch_offline(): void {
    logger.info("Switch offline:", this.name());
    super.switch_offline();
  }

  /**
   * todo: Description.
   */
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

  /**
   * todo: Description.
   */
  public override STATE_Read(packet: XR_net_packet, size: number): void {
    super.STATE_Read(packet, size);

    if (this.script_version > 10) {
      const oldLevelId: StringOptional = packet.r_stringZ();
      const oldSection: StringOptional = packet.r_stringZ();
      const offlineObject: IStoredOfflineObject = registerOfflineObject(this.id);

      offlineObject.active_section = oldSection === NIL ? null : oldSection;
      offlineObject.level_vertex_id = oldLevelId === NIL ? null : (tonumber(oldLevelId) as number);
    }
  }

  /**
   * todo: Description.
   */
  public override on_register(): void {
    super.on_register();
    logger.info("Register:", this.id, this.name(), this.section_name());
    registerObjectStoryLinks(this);

    this.isRegistered = true;

    const board = SimulationBoardManager.getInstance();

    registerOfflineObject(this.id);

    this.brain().can_choose_alife_tasks(false);

    const objectIni = this.spawn_ini();
    const smart = getConfigString(objectIni, "logic", "smart_terrain", false, "", "");
    const smart_obj = board.getSmartTerrainByName(smart);

    if (smart_obj === null) {
      return;
    }

    alife().object<SmartTerrain>(smart_obj.id)!.register_npc(this);
  }

  /**
   * todo: Description.
   */
  public override on_unregister(): void {
    logger.info("Unregister:", this.name());

    const smartTerrainId: TNumberId = this.smart_terrain_id();

    if (smartTerrainId !== MAX_U16) {
      const smart: any = alife().object(smartTerrainId);

      if (smart !== null) {
        smart.unregister_npc(this);
      }
    }

    registry.offlineObjects.delete(this.id);
    unregisterStoryLinkByObjectId(this.id);
    super.on_unregister();
  }

  /**
   * todo: Description.
   */
  public override on_death(killer: XR_cse_alife_creature_abstract): void {
    logger.info("On death:", this.name(), killer?.name());

    super.on_death(killer);

    onSmartTerrainObjectDeath(this);

    if (this.group_id !== MAX_U16) {
      const squad: any = alife().object(this.group_id);

      if (squad === null) {
        abort("There is no squad with ID [%s]", this.group_id);
      }

      squad.on_npc_death(this);
    }
  }
}
