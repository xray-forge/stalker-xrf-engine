import { ini_file, LuabindClass, object_binder } from "xray16";

import { CampManager } from "@/engine/core/ai/camp/CampManager";
import {
  closeLoadMarker,
  closeSaveMarker,
  openLoadMarker,
  openSaveMarker,
  registerCampZone,
  registry,
  resetCampZone,
  unregisterCampZone,
} from "@/engine/core/database";
import { readIniString } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { IniFile, NetPacket, Optional, Reader, ServerObject, TDuration, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Camp zone binder for game creatures.
 * May be just place on map or defines interaction logic for NPCs if [camp] section is present in spawn ini.
 *
 * Note: related manager appears if it is defined or if NPC enters camp.
 */
@LuabindClass()
export class CampZoneBinder extends object_binder {
  /**
   * Re-initialize camp state.
   * Update camp manager object link pointing to current camp.
   */
  public override reinit(): void {
    super.reinit();
    resetCampZone(this.object);
  }

  /**
   * Handle net spawn event.
   *
   * @param object - server object matching camp
   */
  public override net_spawn(object: ServerObject): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    // logger.info("Spawn camp:", this.object.name());

    const ini: IniFile = this.object.spawn_ini();

    // If camp logic description present, try to read it from spawn ini or from defined `cfg` file.
    if (ini.section_exist("camp")) {
      const filename: Optional<TName> = readIniString(ini, "camp", "cfg", false);
      const manager: CampManager = new CampManager(this.object, filename === null ? ini : new ini_file(filename));

      registerCampZone(this.object, manager);
    }

    return true;
  }

  /**
   * Handle net destroy event.
   */
  public override net_destroy(): void {
    // logger.info("Destroy camp:", this.object.name());

    unregisterCampZone(this.object);
    super.net_destroy();
  }

  /**
   * Handle client updates tick for matching camp objects.
   * Camp can appear in registry if it is configured to be camp or if any NPC enters it and forces registration.
   *
   * @param delta - time delta since latest update
   */
  public override update(delta: TDuration): void {
    const manager: Optional<CampManager> = registry.camps.get(this.object.id()) as Optional<CampManager>;

    if (manager) {
      manager.update();
    }
  }

  /**
   * @returns whether state of camp can be saved
   */
  public override net_save_relevant(): boolean {
    return true;
  }

  /**
   * Account camp saving in markers to set resulting file size precisely.
   *
   * @param packet - net packet to save data into
   */
  public override save(packet: NetPacket): void {
    openSaveMarker(packet, CampZoneBinder.__name);
    super.save(packet);
    closeSaveMarker(packet, CampZoneBinder.__name);
  }

  /**
   * Account camp loading in markers to set resulting file size precisely.
   *
   * @param reader - net reader to read data from
   */
  public override load(reader: Reader): void {
    openLoadMarker(reader, CampZoneBinder.__name);
    super.load(reader);
    closeLoadMarker(reader, CampZoneBinder.__name);
  }
}
