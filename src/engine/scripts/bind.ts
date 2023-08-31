import { clsid } from "xray16";

import {
  ActorBinder,
  AnomalyFieldBinder,
  AnomalyZoneBinder,
  ArenaZoneBinder,
  ArtefactBinder,
  CampfireBinder,
  CampZoneBinder,
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
} from "@/engine/core/objects/binders";
import { extern } from "@/engine/core/utils/binding";
import { isGameStarted } from "@/engine/core/utils/game";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, IniFile, Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Register binders of engine client side objects.
 */
extern("bind", {
  actor: (object: ClientObject) => object.bind_object(new ActorBinder(object)),
  anomalyField: (object: ClientObject) => object.bind_object(new AnomalyFieldBinder(object)),
  anomalyZone: (object: ClientObject) => object.bind_object(new AnomalyZoneBinder(object)),
  arenaZone: (object: ClientObject) => {
    if (object.spawn_ini()?.section_exist("arena_zone")) {
      object.bind_object(new ArenaZoneBinder(object));
    }
  },
  artefact: (object: ClientObject) => object.bind_object(new ArtefactBinder(object)),
  camp: (object: ClientObject) => object.bind_object(new CampZoneBinder(object)),
  campfire: (object: ClientObject) => object.bind_object(new CampfireBinder(object)),
  crow: (object: ClientObject) => object.bind_object(new CrowBinder(object)),
  // todo: Rename to full name 'helicopter'.
  heli: (object: ClientObject) => {
    const ini: Optional<IniFile> = object.spawn_ini();

    if (ini?.section_exist("logic")) {
      object.bind_object(new HelicopterBinder(object, ini));
    }
  },
  labX8Door: (object: ClientObject) => object.bind_object(new LabX8DoorBinder(object)),
  levelChanger: (object: ClientObject) => object.bind_object(new LevelChangerBinder(object)),
  monster: (object: ClientObject) => object.bind_object(new MonsterBinder(object)),
  phantom: (object: ClientObject) => object.bind_object(new PhantomBinder(object)),
  physicObject: (object: ClientObject) => {
    if (object.spawn_ini()?.section_exist("logic") || object.clsid() === clsid.inventory_box) {
      object.bind_object(new PhysicObjectBinder(object));
    }
  },
  restrictor: (object: ClientObject) => object.bind_object(new RestrictorBinder(object)),
  signalLight: (object: ClientObject) => object.bind_object(new SignalLightBinder(object)),
  smartCover: (object: ClientObject) => object.bind_object(new SmartCoverBinder(object)),
  smartTerrain: (object: ClientObject) => {
    const ini: Optional<IniFile> = object.spawn_ini();

    if (ini && (ini.section_exist("gulag1") || ini.section_exist("smart_terrain"))) {
      if (isGameStarted()) {
        object.bind_object(new SmartTerrainBinder(object));
      } else {
        logger.info("No simulation, smart terrain will not be enabled:", object.name());
      }
    }
  },
  stalker: (object: ClientObject) => object.bind_object(new StalkerBinder(object)),
});
