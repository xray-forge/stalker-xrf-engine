import { ini_file, LuabindClass, object_binder } from "xray16";

import { CampManager } from "@/engine/core/ai/camp/CampManager";
import { registerCampZone, registry, resetCampZone, unregisterCampZone } from "@/engine/core/database";
import { readIniString } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { IniFile, Optional, ServerObject, TDuration, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Camp zone binder for game creatures.
 * May be just place on map or defines interaction logic for NPCs if [camp] section is present in spawn ini.
 *
 * Note: related manager appears if it is defined or if NPC enters camp.
 */
@LuabindClass()
export class CampZoneBinder extends object_binder {
  public override reinit(): void {
    super.reinit();
    resetCampZone(this.object);
  }

  public override net_spawn(object: ServerObject): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    const ini: Optional<IniFile> = this.object.spawn_ini();

    // If camp logic description present, try to read it from spawn ini or from defined `cfg` file.
    if (ini?.section_exist("camp")) {
      const filename: Optional<TName> = readIniString(ini, "camp", "cfg", false);
      const manager: CampManager = new CampManager(this.object, filename ? new ini_file(filename) : ini);

      registerCampZone(this.object, manager);
    } else {
      registerCampZone(this.object, null);
    }

    return true;
  }

  public override net_destroy(): void {
    unregisterCampZone(this.object);

    super.net_destroy();
  }

  public override update(delta: TDuration): void {
    super.update(delta);

    const manager: Optional<CampManager> = registry.camps.get(this.object.id()) as Optional<CampManager>;

    if (manager) {
      manager.update(delta);
    }
  }

  public override net_save_relevant(): boolean {
    return true;
  }
}
