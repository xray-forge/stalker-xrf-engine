import { ini_file, LuabindClass, object_binder, patrol } from "xray16";

import { AnomalyFieldBinder } from "@/engine/core/binders/zones/AnomalyFieldBinder";
import {
  closeLoadMarker,
  closeSaveMarker,
  getManager,
  openLoadMarker,
  openSaveMarker,
  registerAnomalyZone,
  registry,
  resetObject,
  unregisterAnomalyZone,
} from "@/engine/core/database";
import { MapDisplayManager } from "@/engine/core/managers/map/MapDisplayManager";
import { abort, assert } from "@/engine/core/utils/assertion";
import {
  parseConditionsList,
  parseNumbersList,
  parseStringsList,
  pickSectionFromCondList,
  readIniNumber,
  readIniString,
  TConditionList,
} from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectId } from "@/engine/core/utils/object";
import { MAX_U8 } from "@/engine/lib/constants/memory";
import {
  AnyGameObject,
  GameObject,
  IniFile,
  LuaArray,
  NetPacket,
  Optional,
  Patrol,
  Reader,
  ServerObject,
  TCount,
  TDuration,
  TIndex,
  TName,
  TNumberId,
  TRate,
  TSection,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Section name in ini file, contains configuration
 */
const ANOMALY_ZONE_SECTION: TSection = "anomal_zone";
const ANOMALY_ZONE_LAYER: TSection = "layer_";
const ARTEFACT_SPAWN_CHANCE: TRate = 17;

/**
 * todo: Needs simplification of logic.
 */
@LuabindClass()
export class AnomalyZoneBinder extends object_binder {
  public readonly ini: IniFile;

  public isDisabled: boolean = false;
  public isTurnedOff: boolean = false;
  public isCustomPlacement: boolean = false;
  public shouldRespawnArtefactsIfPossible: boolean = true;

  public artefactWaysByArtefactId: LuaTable<number, string> = new LuaTable();
  public artefactPointsByArtefactId: LuaTable<number, number> = new LuaTable();

  /**
   * Current state description.
   */
  public spawnedArtefactsCount: TCount = 0;

  public respawnTries: TCount = -1;
  public maxArtefactsInZone: TCount = -1;
  public applyingForceXZ: TRate = -1;
  public applyingForceY: TRate = -1;

  public hasForcedSpawnOverride: boolean = false;
  public isForcedToSpawn: boolean = false;
  public forcedArtefact: Optional<string> = null;
  public zoneLayersCount: TCount = -1;
  public currentZoneLayer: string = "";

  /**
   * Layers description.
   */
  public layersRespawnTriesTable: LuaTable<string, number> = new LuaTable();
  public layersMaxArtefactsTable: LuaTable<string, number> = new LuaTable();
  public layersForcesTable: LuaTable<string, { xz: number; y: number }> = new LuaTable();
  public artefactsStartList: LuaTable<string, LuaTable<number, string>> = new LuaTable();
  public artefactsSpawnList: LuaTable<string, LuaTable<number, string>> = new LuaTable();
  public artefactsSpawnCoefficients: LuaTable<string, LuaTable<number, number>> = new LuaTable();
  public artefactsPathsList: LuaTable<string, LuaTable<number, string>> = new LuaTable();
  public fieldsTable: LuaTable<string, LuaTable<number, string>> = new LuaTable();
  public minesTable: LuaTable<string, LuaTable<number, string>> = new LuaTable();

  public constructor(object: GameObject) {
    super(object);

    this.ini = object.spawn_ini()!;

    if (!this.ini.section_exist(ANOMALY_ZONE_SECTION)) {
      this.isDisabled = true;

      logger.warn("Zone without configuration detected:", object.name());

      return;
    }

    const filename: Optional<string> = readIniString(this.ini, ANOMALY_ZONE_SECTION, "cfg", false);

    // logger.info("Init anomaly zone from file:", object.name(), filename);

    if (filename !== null) {
      this.ini = new ini_file(filename);
    }

    const ini: IniFile = this.ini;

    this.zoneLayersCount = readIniNumber(ini, ANOMALY_ZONE_SECTION, "layers_count", false, 1);
    this.isCustomPlacement = this.zoneLayersCount > 1;
    this.currentZoneLayer = ANOMALY_ZONE_LAYER + math.random(1, this.zoneLayersCount); // Pick one of possible layers.

    const defaultRespawnTries: TCount = readIniNumber(ini, ANOMALY_ZONE_SECTION, "respawn_tries", false, 2);
    const defaultMaxArtefacts: TCount = readIniNumber(ini, ANOMALY_ZONE_SECTION, "max_artefacts", false, 3);
    const defaultForceXZ: TRate = readIniNumber(ini, ANOMALY_ZONE_SECTION, "applying_force_xz", false, 200);
    const defaultForceY: TRate = readIniNumber(ini, ANOMALY_ZONE_SECTION, "applying_force_y", false, 400);
    const defaultArtefacts: Optional<string> = readIniString(ini, ANOMALY_ZONE_SECTION, "artefacts", false);
    const defaultSpawned: Optional<string> = readIniString(ini, ANOMALY_ZONE_SECTION, "start_artefact", false);
    const defaultWays: Optional<string> = readIniString(ini, ANOMALY_ZONE_SECTION, "artefact_ways", false);
    const defaultFieldName: Optional<string> = readIniString(ini, ANOMALY_ZONE_SECTION, "field_name", false);
    const defaultCoeffs: Optional<string> = readIniString(ini, ANOMALY_ZONE_SECTION, "coeff", false);
    const defaultCoeffSectionName: string = readIniString(
      ini,
      ANOMALY_ZONE_SECTION,
      "coeffs_section",
      false,
      null,
      "{+actor_was_in_many_bad_places} coeff2, coeff"
    );

    // logger.info("Init zone layers (picked/count):", this.currentZoneLayer, this.zoneLayersCount);

    for (const index of $range(1, this.zoneLayersCount)) {
      const section: TSection = ANOMALY_ZONE_LAYER + index;

      // logger.info("Init layer:", section);

      this.layersRespawnTriesTable.set(
        section,
        readIniNumber(ini, section, "artefact_count", false, defaultRespawnTries)
      );

      this.layersRespawnTriesTable.set(
        section,
        readIniNumber(ini, section, "respawn_tries", false, this.layersRespawnTriesTable.get(section))
      );

      this.layersMaxArtefactsTable.set(
        section,
        readIniNumber(ini, section, "max_artefacts", false, defaultMaxArtefacts)
      );

      this.layersForcesTable.set(section, {
        xz: readIniNumber(ini, section, "applying_force_xz", false, defaultForceXZ),
        y: readIniNumber(ini, section, "applying_force_y", false, defaultForceY),
      });

      const listOfAvailableArtefacts: LuaTable<number, string> = this.getArtefactsListForSection(
        section,
        defaultArtefacts
      );

      this.artefactsSpawnList.set(section, listOfAvailableArtefacts);

      const initialArtefacts: Optional<string> = readIniString(
        ini,
        section,
        "start_artefact",
        false,
        null,
        defaultSpawned
      );

      if (initialArtefacts !== null) {
        this.isForcedToSpawn = true;
        this.artefactsStartList.set(section, parseStringsList(initialArtefacts));
      }

      const coeffsSection: string = readIniString(ini, section, "coeffs_section", false, null, defaultCoeffSectionName);
      const conditionsList: TConditionList = parseConditionsList(coeffsSection);
      const coeffsSectionName: string = pickSectionFromCondList(registry.actor, null, conditionsList)!;
      const coeffs: Optional<string> = readIniString(ini, section, coeffsSectionName, false, null, defaultCoeffs);
      /**
       * end todo;
       */

      this.artefactsSpawnCoefficients.set(section, coeffs === null ? new LuaTable() : parseNumbersList(coeffs));

      const path: Optional<string> = readIniString(ini, section, "artefact_ways", false, null, defaultWays);

      if (path === null) {
        abort("There is no field 'artefact_ways' in section [%s] in obj [%s]", section, object.name());
      }

      this.artefactsPathsList.set(section, parseStringsList(path));

      if (this.isCustomPlacement) {
        const field: Optional<string> = readIniString(ini, section, "field_name", false, null, defaultFieldName);

        if (field === null) {
          this.fieldsTable.set(section, new LuaTable());
          // --abort("There is no field 'field_name' in section [%s] in obj [%s]", section, obj:name())
        } else {
          this.fieldsTable.set(section, parseStringsList(field));
        }

        const minesSection: Optional<TSection> = readIniString(ini, section, "mines_section", true);

        if (minesSection === null) {
          abort("There is no field 'mines_section' in section [%s] in obj [%s]", section, object.name());
        }

        this.minesTable.set(section, new LuaTable());

        if (ini.line_count(minesSection) > 0) {
          // logger.info("Init mines for section:", section, minesSection);
          for (const i of $range(0, ini.line_count(minesSection) - 1)) {
            const [temp1, mineName, temp2] = ini.r_line(minesSection, i, "", "");

            table.insert(this.minesTable.get(section), mineName);
          }
        }
      }
    }

    /**
     * Apply current layer settings based on layer details.
     */
    this.respawnTries = this.layersRespawnTriesTable.get(this.currentZoneLayer);
    this.maxArtefactsInZone = this.layersMaxArtefactsTable.get(this.currentZoneLayer);
    this.applyingForceXZ = this.layersForcesTable.get(this.currentZoneLayer).xz;
    this.applyingForceY = this.layersForcesTable.get(this.currentZoneLayer).y;
  }

  public override reinit(): void {
    super.reinit();
    resetObject(this.object);
  }

  public override net_spawn(object: ServerObject): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    registerAnomalyZone(this);

    return true;
  }

  public override net_destroy(): void {
    unregisterAnomalyZone(this);

    super.net_destroy();
  }

  public override update(delta: TDuration): void {
    super.update(delta);

    if (this.isTurnedOff) {
      return;
    }

    if (this.spawnedArtefactsCount < this.maxArtefactsInZone && this.shouldRespawnArtefactsIfPossible) {
      let respawnTries: number = this.respawnTries;
      const availableArtefactSpots: number = this.maxArtefactsInZone - this.spawnedArtefactsCount;

      // Do not try more spawns than available slots.
      if (respawnTries > availableArtefactSpots) {
        respawnTries = availableArtefactSpots;
      }

      for (const _ of $range(1, respawnTries)) {
        this.spawnRandomArtefact();
      }

      this.shouldRespawnArtefactsIfPossible = false;
    } else if (this.spawnedArtefactsCount >= this.maxArtefactsInZone && this.shouldRespawnArtefactsIfPossible) {
      this.shouldRespawnArtefactsIfPossible = false;
    }

    if (!this.isDisabled) {
      this.disableAnomalyFields();
    }
  }

  public override net_save_relevant(): boolean {
    return true;
  }

  public override save(packet: NetPacket): void {
    openSaveMarker(packet, AnomalyZoneBinder.__name);

    super.save(packet);

    packet.w_u16(table.size(this.artefactWaysByArtefactId));

    for (const [id, wayName] of this.artefactWaysByArtefactId) {
      packet.w_u16(id);
      packet.w_stringZ(wayName);
    }

    /**
     * Artefact points save.
     */

    packet.w_u16(table.size(this.artefactPointsByArtefactId));

    for (const [id, point] of this.artefactPointsByArtefactId) {
      packet.w_u16(id);
      packet.w_u8(point);
    }

    /**
     * Generic info save.
     */

    packet.w_u8(this.spawnedArtefactsCount);
    packet.w_bool(this.shouldRespawnArtefactsIfPossible);
    packet.w_bool(this.isForcedToSpawn);
    packet.w_bool(this.hasForcedSpawnOverride);
    packet.w_stringZ(this.forcedArtefact || "");

    /**
     * Save current layer.
     */

    const [foundIndex] = string.find(this.currentZoneLayer, "_");
    const layerNumber: Optional<TIndex> = tonumber(
      string.sub(this.currentZoneLayer, foundIndex + 1, string.len(this.currentZoneLayer))
    ) as Optional<TIndex>;

    if (layerNumber !== null) {
      packet.w_u8(layerNumber);
    } else {
      packet.w_u8(MAX_U8);
    }

    packet.w_bool(this.isTurnedOff);

    closeSaveMarker(packet, AnomalyZoneBinder.__name);
  }

  public override load(reader: Reader): void {
    openLoadMarker(reader, AnomalyZoneBinder.__name);

    super.load(reader);

    const waysCount: TCount = reader.r_u16();

    for (const _ of $range(1, waysCount)) {
      const artefactId: TNumberId = reader.r_u16();
      const wayName: TName = reader.r_stringZ();

      this.artefactWaysByArtefactId.set(artefactId, wayName);

      registry.artefacts.ways.set(artefactId, wayName);
      registry.artefacts.parentZones.set(artefactId, this);
    }

    const pointsCount: TCount = reader.r_u16();

    for (const _ of $range(1, pointsCount)) {
      const artefactId: TNumberId = reader.r_u16();
      const point: TIndex = reader.r_u8();

      registry.artefacts.points.set(artefactId, point);
      this.artefactPointsByArtefactId.set(artefactId, point);
    }

    this.spawnedArtefactsCount = reader.r_u8();
    this.shouldRespawnArtefactsIfPossible = reader.r_bool();
    this.isForcedToSpawn = reader.r_bool();
    this.hasForcedSpawnOverride = reader.r_bool();
    this.forcedArtefact = reader.r_stringZ();

    const currentLayer: TIndex = reader.r_u8();

    if (currentLayer !== MAX_U8) {
      this.currentZoneLayer = ANOMALY_ZONE_LAYER + currentLayer;
    }

    this.isTurnedOff = reader.r_bool();

    closeLoadMarker(reader, AnomalyZoneBinder.__name);
  }

  /**
   * todo: Description.
   */
  public turnOff(): void {
    logger.info("Turn off zone:", this.object.name());

    this.isTurnedOff = true;
    this.disableAnomalyFields();

    for (const [artefactId] of this.artefactWaysByArtefactId) {
      registry.simulator.release(registry.simulator.object(tonumber(artefactId) as number), true);
      registry.artefacts.ways.delete(artefactId);
      registry.artefacts.points.delete(artefactId);
      registry.artefacts.parentZones.delete(artefactId);
    }

    this.spawnedArtefactsCount = 0;
    this.artefactWaysByArtefactId = new LuaTable();
    this.artefactPointsByArtefactId = new LuaTable();
  }

  /**
   * todo: Description.
   */
  public turnOn(forceRespawn: Optional<boolean>): void {
    logger.info("Turn on zone:", this.object.name());

    this.isTurnedOff = false;
    this.disableAnomalyFields();

    this.shouldRespawnArtefactsIfPossible = forceRespawn === true;
  }

  /**
   * todo: Description.
   */
  public disableAnomalyFields(): void {
    // logger.info("Disable anomaly fields:", this.object.name());

    if (!this.isCustomPlacement) {
      this.isDisabled = true;

      return;
    }

    const currentLayer: string = this.currentZoneLayer;
    const anomalyFields = registry.anomalyFields;

    let counter: TCount = 0;

    for (const [layer] of this.fieldsTable) {
      if (layer !== currentLayer) {
        for (const [, vv] of this.fieldsTable.get(layer)) {
          if (anomalyFields.has(vv)) {
            anomalyFields.get(vv).setEnabled(false);
          } else {
            counter += 1;
          }
        }
      }
    }

    for (const [layer] of this.minesTable) {
      if (layer !== currentLayer) {
        for (const [, vv] of this.minesTable.get(layer)) {
          if (anomalyFields.has(vv)) {
            anomalyFields.get(vv).setEnabled(false);
          } else {
            counter += 1;
          }
        }
      }
    }

    if (counter === 0) {
      this.isDisabled = true;
    }

    if (!this.isTurnedOff) {
      for (const [, vv] of this.fieldsTable.get(currentLayer)) {
        if (anomalyFields.has(vv)) {
          anomalyFields.get(vv).setEnabled(true);
        }
      }

      for (const [, vv] of this.minesTable.get(currentLayer)) {
        if (anomalyFields.has(vv)) {
          anomalyFields.get(vv).setEnabled(true);
        }
      }
    }
  }

  /**
   * todo: Description.
   */
  public respawnArtefactsAndReplaceAnomalyZones(): void {
    logger.info("Surge spawn:", this.object.name());

    const anomalyFields: LuaTable<TName, AnomalyFieldBinder> = registry.anomalyFields;

    this.shouldRespawnArtefactsIfPossible = true;

    if (this.isCustomPlacement) {
      let layer: string = this.currentZoneLayer;

      for (const [, v] of this.fieldsTable.get(layer)) {
        if (anomalyFields.has(v)) {
          anomalyFields.get(v).setEnabled(false);
        }
      }

      for (const [, v] of this.minesTable.get(layer)) {
        if (anomalyFields.has(v)) {
          anomalyFields.get(v).setEnabled(false);
        }
      }

      layer = ANOMALY_ZONE_LAYER + math.random(1, this.zoneLayersCount);

      for (const [, v] of this.fieldsTable.get(layer)) {
        if (anomalyFields.has(v)) {
          anomalyFields.get(v).setEnabled(true);
        }
      }

      for (const [, v] of this.minesTable.get(layer)) {
        if (anomalyFields.has(v)) {
          anomalyFields.get(v).setEnabled(true);
        }
      }

      this.currentZoneLayer = layer;
      this.respawnTries = this.layersRespawnTriesTable.get(this.currentZoneLayer);
      this.maxArtefactsInZone = this.layersMaxArtefactsTable.get(this.currentZoneLayer);
      this.applyingForceXZ = this.layersForcesTable.get(this.currentZoneLayer).xz;
      this.applyingForceY = this.layersForcesTable.get(this.currentZoneLayer).y;
    }
  }

  /**
   * todo: Description.
   */
  public spawnRandomArtefact(): void {
    // logger.info("Spawn random artefact:", this.object.name(), this.currentZoneLayer);

    const layer: TName = this.currentZoneLayer;
    let randomArtefact: string = "";

    if (this.hasForcedSpawnOverride && this.forcedArtefact) {
      randomArtefact = this.forcedArtefact;
      this.hasForcedSpawnOverride = false;
    } else if (this.isForcedToSpawn) {
      randomArtefact = this.artefactsStartList.get(layer).get(this.artefactsStartList.get(layer).length());
      this.isForcedToSpawn = false;
    } else {
      if (math.random(1, 100) > ARTEFACT_SPAWN_CHANCE) {
        return;
      }

      let coeffTotal: TRate = 0;

      for (const [, v] of this.artefactsSpawnCoefficients.get(layer)) {
        coeffTotal += v;
      }

      if (coeffTotal === 0) {
        for (const it of $range(1, this.artefactsSpawnList.get(layer).length())) {
          this.artefactsSpawnCoefficients.get(layer).set(it, 1);
          coeffTotal += 1;
        }
      }

      let random: TRate = math.random(1, coeffTotal);

      for (const it of $range(1, this.artefactsSpawnList.get(layer).length())) {
        const chance = this.artefactsSpawnCoefficients.get(layer).get(it);

        if (random <= chance) {
          randomArtefact = this.artefactsSpawnList.get(layer).get(it);
        }

        random -= chance;
      }
    }

    const randomPathName: TName = this.getRandomArtefactPath();
    const randomPath: Patrol = new patrol(randomPathName);
    const randomPathPoint: TIndex = math.random(0, randomPath.count() - 1);

    const artefactObject: ServerObject = registry.simulator.create(
      randomArtefact,
      randomPath.point(randomPathPoint),
      this.object.level_vertex_id(),
      this.object.game_vertex_id()
    );

    registry.artefacts.parentZones.set(artefactObject.id, this);
    registry.artefacts.ways.set(artefactObject.id, randomPathName);
    registry.artefacts.points.set(artefactObject.id, randomPathPoint);

    this.artefactWaysByArtefactId.set(artefactObject.id, randomPathName);
    this.artefactPointsByArtefactId.set(artefactObject.id, randomPathPoint);
    this.spawnedArtefactsCount += 1;

    logger.info("Spawned random artefact:", randomArtefact, artefactObject.id);
  }

  /**
   * todo: Description.
   */
  public getRandomArtefactPath(): string {
    // logger.info("Get artefact path:", this.object.name());

    const paths: LuaArray<TName> = new LuaTable();

    for (const [, v] of this.artefactsPathsList.get(this.currentZoneLayer)) {
      let isSpawned: boolean = false;

      for (const [, vv] of this.artefactWaysByArtefactId) {
        if (vv !== null && v === vv) {
          isSpawned = true;
        }
      }

      if (!isSpawned) {
        table.insert(paths, v);
      }
    }

    if (paths.length() === 0) {
      return this.artefactsPathsList
        .get(this.currentZoneLayer)
        .get(math.random(1, this.artefactsPathsList.get(this.currentZoneLayer).length()));
    }

    return paths.get(math.random(1, paths.length()));
  }

  /**
   * todo: Description.
   */
  public setForcedSpawnOverride(artefactName: TName): void {
    logger.info("Set force override:", this.object.name());

    this.forcedArtefact = artefactName;
    this.hasForcedSpawnOverride = true;

    logger.info("Set forced override for zone/artefact:", this.object.name(), artefactName);
  }

  /**
   * todo: Description.
   * todo: Move to anomaly zones utils.
   */
  public getArtefactsListForSection(section: TSection, defaultArtefacts: Optional<string>): LuaTable<number, string> {
    // todo: Read list at once.
    const baseArtefactsList: Optional<TSection> = readIniString(
      this.ini,
      section,
      "artefacts",
      false,
      null,
      defaultArtefacts
    );

    assert(
      baseArtefactsList,
      "There is no field 'artefacts' in section '%s' in object '%s'.",
      section,
      this.object.name()
    );

    return parseStringsList(baseArtefactsList);
  }

  /**
   * @param object - game object of artefact taken from the anomaly zone
   */
  public onArtefactTaken(object: AnyGameObject): void {
    logger.info("On artefact take:", this.object.name());

    const id: TNumberId = getObjectId(object);

    registry.artefacts.ways.delete(id);
    registry.artefacts.points.delete(id);

    this.artefactWaysByArtefactId.delete(id);
    this.artefactPointsByArtefactId.delete(id);

    this.spawnedArtefactsCount -= 1;

    getManager(MapDisplayManager).updateAnomalyZonesDisplay(); // todo: Probably just update self, not all.
  }
}
