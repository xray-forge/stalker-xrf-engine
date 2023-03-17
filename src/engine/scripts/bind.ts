import { alife, clsid, XR_game_object, XR_ini_file } from "xray16";

import { Optional } from "@/engine/lib/types";
import {
  ActorBinder,
  AnomalyFieldBinder,
  AnomalyZoneBinder,
  ArenaZoneBinder,
  ArtefactBinder,
  CampBinder,
  CampfireBinder,
  CrowBinder,
  HelicopterBinder,
  LabX8DoorBinder,
  LevelChangerBinder,
  MonsterBinder,
  PhantomBinder,
  PhysicObjectBinder,
  RestrictorBinder,
  SignalLightBinder,
  SmartCoverBinder,
  SmartTerrainBinder,
  StalkerBinder,
} from "@/engine/scripts/core/objects/binders";
import { abort } from "@/engine/scripts/utils/debug";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Register binders of engine client side objects.
 */
extern("bind", {
  actor: (object: XR_game_object) => object.bind_object(new ActorBinder(object)),
  anomalyField: (object: XR_game_object) => object.bind_object(new AnomalyFieldBinder(object)),
  anomalyZone: (object: XR_game_object) => object.bind_object(new AnomalyZoneBinder(object)),
  arenaZone: (object: XR_game_object) => {
    const ini: Optional<XR_ini_file> = object.spawn_ini();

    if (ini !== null && ini.section_exist("arena_zone") && alife() !== null) {
      object.bind_object(new ArenaZoneBinder(object));
    }
  },
  artefact: (object: XR_game_object) => object.bind_object(new ArtefactBinder(object)),
  camp: (object: XR_game_object) => object.bind_object(new CampBinder(object)),
  campfire: (object: XR_game_object) => object.bind_object(new CampfireBinder(object)),
  crow: (object: XR_game_object) => object.bind_object(new CrowBinder(object)),
  heli: (object: XR_game_object) => {
    const ini: Optional<XR_ini_file> = object.spawn_ini();

    if (ini !== null && ini.section_exist("logic")) {
      object.bind_object(new HelicopterBinder(object, ini));
    }
  },
  labX8Door: (object: XR_game_object) => object.bind_object(new LabX8DoorBinder(object)),
  levelChanger: (object: XR_game_object) => object.bind_object(new LevelChangerBinder(object)),
  monster: (object: XR_game_object) => object.bind_object(new MonsterBinder(object)),
  phantom: (object: XR_game_object) => object.bind_object(new PhantomBinder(object)),
  physicObject: (object: XR_game_object) => {
    const ini: Optional<XR_ini_file> = object.spawn_ini();

    if (!ini?.section_exist("logic")) {
      if (object.clsid() !== clsid.inventory_box) {
        return;
      }
    }

    object.bind_object(new PhysicObjectBinder(object));
  },
  restrictor: (object: XR_game_object) => object.bind_object(new RestrictorBinder(object)),
  signalLight: (object: XR_game_object) => object.bind_object(new SignalLightBinder(object)),
  smartCover: (object: XR_game_object) => object.bind_object(new SmartCoverBinder(object)),
  smartTerrain: (object: XR_game_object) => {
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
  stalker: (object: XR_game_object) => object.bind_object(new StalkerBinder(object)),
});
