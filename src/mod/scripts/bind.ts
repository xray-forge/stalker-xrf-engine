import { alife, clsid, XR_game_object, XR_ini_file, XR_object_binder } from "xray16";

import { Optional } from "@/mod/lib/types";
import { ActorBinder } from "@/mod/scripts/core/binders/ActorBinder";
import { AnomalyFieldBinder } from "@/mod/scripts/core/binders/AnomalyFieldBinder";
import { AnomalyZoneBinder } from "@/mod/scripts/core/binders/AnomalyZoneBinder";
import { ArenaZoneBinder } from "@/mod/scripts/core/binders/ArenaZoneBinder";
import { ArtefactBinder } from "@/mod/scripts/core/binders/ArtefactBinder";
import { CampBinder } from "@/mod/scripts/core/binders/CampBinder";
import { CampfireBinder } from "@/mod/scripts/core/binders/CampfireBinder";
import { CrowBinder } from "@/mod/scripts/core/binders/CrowBinder";
import { HeliBinder } from "@/mod/scripts/core/binders/HeliBinder";
import { LabX8DoorBinder } from "@/mod/scripts/core/binders/LabX8DoorBinder";
import { LevelChangerBinder } from "@/mod/scripts/core/binders/LevelChangerBinder";
import { MonsterBinder } from "@/mod/scripts/core/binders/MonsterBinder";
import { PhantomBinder } from "@/mod/scripts/core/binders/PhantomBinder";
import { PhysicObjectBinder } from "@/mod/scripts/core/binders/PhysicObjectBinder";
import { RestrictorBinder } from "@/mod/scripts/core/binders/RestrictorBinder";
import { SignalLightBinder } from "@/mod/scripts/core/binders/SignalLightBinder";
import { SmartCoverBinder } from "@/mod/scripts/core/binders/SmartCoverBinder";
import { SmartTerrainBinder } from "@/mod/scripts/core/binders/SmartTerrainBinder";
import { StalkerBinder } from "@/mod/scripts/core/binders/StalkerBinder";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("_bindings");

/**
 * todo;
 */
function createBinder(target: typeof XR_object_binder<XR_game_object>): (object: XR_game_object) => void {
  return (object: XR_game_object) => {
    object.bind_object(new target(object));
  };
}

// @ts-ignore, declare lua global
list = {
  bindActor: createBinder(ActorBinder),
  bindAnomalyField: createBinder(AnomalyFieldBinder),
  bindAnomalyZone: createBinder(AnomalyZoneBinder),
  bindArenaZone: (object: XR_game_object) => {
    const ini: Optional<XR_ini_file> = object.spawn_ini();

    if (ini !== null && ini.section_exist("arena_zone") && alife() !== null) {
      object.bind_object(new ArenaZoneBinder(object));
    }
  },
  bindArtefact: createBinder(ArtefactBinder),
  bindCamp: createBinder(CampBinder),
  bindCampfire: createBinder(CampfireBinder),
  bindCrow: createBinder(CrowBinder),
  bindHeli: (object: XR_game_object) => {
    const ini: Optional<XR_ini_file> = object.spawn_ini();

    if (ini !== null && ini.section_exist("logic")) {
      object.bind_object(new HeliBinder(object, ini));
    }
  },
  bindLabX8Door: createBinder(LabX8DoorBinder),
  bindLevelChanger: createBinder(LevelChangerBinder),
  bindMonster: createBinder(MonsterBinder),
  bindPhantom: createBinder(PhantomBinder),
  bindPhysicObject: (object: XR_game_object) => {
    const ini: Optional<XR_ini_file> = object.spawn_ini();

    if (!ini?.section_exist("logic")) {
      if (object.clsid() !== clsid.inventory_box) {
        return;
      }
    }

    object.bind_object(new PhysicObjectBinder(object));
  },
  bindRestrictor: createBinder(RestrictorBinder),
  bindSignalLight: createBinder(SignalLightBinder),
  bindSmartCover: createBinder(SmartCoverBinder),
  bindSmartTerrain: (object: XR_game_object) => {
    const ini: Optional<XR_ini_file> = object.spawn_ini();

    if (ini !== null && (ini.section_exist("gulag1") || ini.section_exist("smart_terrain"))) {
      if (object.clsid() === clsid.smart_terrain) {
        if (alife() !== null) {
          object.bind_object(new SmartTerrainBinder(object));
        } else {
          logger.info("No simulation, smart terrain will not be enabled:", object.name());
        }
      } else {
        abort("You must use SMART_TERRAIN instead of SCRIPT_ZONE %s", object.name());
      }
    }
  },
  bindStalker: createBinder(StalkerBinder),
};
