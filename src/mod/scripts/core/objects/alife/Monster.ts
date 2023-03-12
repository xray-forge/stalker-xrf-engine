import {
  alife,
  cse_alife_monster_base,
  level,
  LuabindClass,
  XR_cse_alife_creature_abstract,
  XR_ini_file,
  XR_net_packet,
} from "xray16";

import { STRINGIFIED_NIL } from "@/mod/globals/lua";
import { MAX_UNSIGNED_16_BIT } from "@/mod/globals/memory";
import { Optional, StringOptional, TSection } from "@/mod/lib/types";
import {
  hardResetOfflineObject,
  initializeOfflineObject,
  IStoredOfflineObject,
  registry,
} from "@/mod/scripts/core/database";
import { SimulationBoardManager } from "@/mod/scripts/core/database/SimulationBoardManager";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/database/StoryObjectsRegistry";
import { on_death, SmartTerrain } from "@/mod/scripts/core/objects/alife/smart/SmartTerrain";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { getConfigString } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(FILENAME);

/**
 * todo;
 */
@LuabindClass()
export class Monster extends cse_alife_monster_base {
  public ini: Optional<XR_ini_file> = null;
  public isRegistered: boolean = false;

  /**
   * todo;
   */
  public constructor(section: TSection) {
    super(section);
    hardResetOfflineObject(this.id);
  }

  /**
   * todo;
   */
  public override can_switch_offline(): boolean {
    if (this.group_id !== MAX_UNSIGNED_16_BIT) {
      return true;
    }

    return super.can_switch_offline();
  }

  /**
   * todo;
   */
  public override can_switch_online(): boolean {
    if (this.group_id !== MAX_UNSIGNED_16_BIT) {
      return true;
    }

    return super.can_switch_online();
  }

  /**
   * todo;
   */
  public override switch_online(): void {
    logger.info("Switch online:", this.name());
    super.switch_online();
  }

  /**
   * todo;
   */
  public override switch_offline(): void {
    logger.info("Switch offline:", this.name());
    super.switch_offline();
  }

  /**
   * todo;
   */
  public override update(): void {
    super.update();
  }

  /**
   * todo;
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
   * todo;
   */
  public override STATE_Read(packet: XR_net_packet, size: number): void {
    super.STATE_Read(packet, size);

    if (this.script_version > 10) {
      const oldLevelId: StringOptional = packet.r_stringZ();
      const oldSection: StringOptional = packet.r_stringZ();
      const offlineObject: IStoredOfflineObject = initializeOfflineObject(this.id);

      offlineObject.active_section = oldSection === STRINGIFIED_NIL ? null : oldSection;
      offlineObject.level_vertex_id = oldLevelId === STRINGIFIED_NIL ? null : (tonumber(oldLevelId) as number);
    }
  }

  /**
   * todo;
   */
  public override on_before_register(): void {}

  /**
   * todo;
   */
  public override on_register(): void {
    super.on_register();
    logger.info("Register:", this.id, this.name(), this.section_name());
    checkSpawnIniForStoryId(this);

    this.isRegistered = true;

    const board = SimulationBoardManager.getInstance();

    initializeOfflineObject(this.id);

    this.brain().can_choose_alife_tasks(false);

    const obj_ini = this.spawn_ini();
    const smart = getConfigString(obj_ini, "logic", "smart_terrain", this, false, "", "");
    const smart_obj = board.get_smart_by_name(smart);

    if (smart_obj === null) {
      return;
    }

    alife().object<SmartTerrain>(smart_obj.id)!.register_npc(this);
  }

  /**
   * todo;
   */
  public override on_unregister(): void {
    logger.info("Unregister:", this.name());

    const strn_id = this.smart_terrain_id();

    if (strn_id !== MAX_UNSIGNED_16_BIT) {
      const smart: any = alife().object(strn_id);

      if (smart !== null) {
        smart.unregister_npc(this);
      }
    }

    registry.offlineObjects.delete(this.id);
    unregisterStoryObjectById(this.id);
    super.on_unregister();
  }

  /**
   * todo;
   */
  public override on_death(killer: XR_cse_alife_creature_abstract): void {
    logger.info("On death:", this.name(), killer?.name());

    super.on_death(killer);

    on_death(this);

    if (this.group_id !== MAX_UNSIGNED_16_BIT) {
      const squad: any = alife().object(this.group_id);

      if (squad === null) {
        abort("There is no squad with ID [%s]", this.group_id);
      }

      squad.on_npc_death(this);
    }
  }
}
