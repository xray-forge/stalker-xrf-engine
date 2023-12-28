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
  readIniStringList,
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
 * Binder of composite anomalies which include artefacts spawning, layers of anomaly fields and mines.
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

  public hasForcedSpawnOverride: boolean = false; // todo: Use only one optional flag.
  public isForcedToSpawn: boolean = false;
  public forcedArtefact: Optional<TSection> = null;
  public zoneLayersCount: TCount = -1;
  public currentZoneLayer: string = "";

  /**
   * Layers description.
   */
  public layersRespawnTriesTable: LuaTable<TSection, TCount> = new LuaTable();
  public layersMaxArtefactsTable: LuaTable<TSection, TCount> = new LuaTable();
  public layersForcesTable: LuaTable<TSection, { xz: TRate; y: TRate }> = new LuaTable();
  public layerFieldsTable: LuaTable<TSection, LuaArray<TSection>> = new LuaTable();
  public layerMinesTable: LuaTable<TSection, LuaArray<TSection>> = new LuaTable();

  public artefactsStartList: LuaTable<TSection, LuaArray<TSection>> = new LuaTable();
  public artefactsSpawnList: LuaTable<TSection, LuaArray<TSection>> = new LuaTable();
  public artefactsSpawnCoefficients: LuaTable<TSection, LuaArray<TRate>> = new LuaTable();
  public artefactsPathsList: LuaTable<TSection, LuaArray<TName>> = new LuaTable();

  public constructor(object: GameObject) {
    super(object);

    this.ini = object.spawn_ini()!;

    if (!this.ini.section_exist(ANOMALY_ZONE_SECTION)) {
      this.isDisabled = true;

      logger.warn("Anomaly zone without configuration detected:", object.name());

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
      const layerSection: TSection = ANOMALY_ZONE_LAYER + index;

      // logger.info("Init layer:", section);

      this.layersRespawnTriesTable.set(
        layerSection,
        readIniNumber(ini, layerSection, "artefact_count", false, defaultRespawnTries)
      );

      this.layersRespawnTriesTable.set(
        layerSection,
        readIniNumber(ini, layerSection, "respawn_tries", false, this.layersRespawnTriesTable.get(layerSection))
      );

      this.layersMaxArtefactsTable.set(
        layerSection,
        readIniNumber(ini, layerSection, "max_artefacts", false, defaultMaxArtefacts)
      );

      this.layersForcesTable.set(layerSection, {
        xz: readIniNumber(ini, layerSection, "applying_force_xz", false, defaultForceXZ),
        y: readIniNumber(ini, layerSection, "applying_force_y", false, defaultForceY),
      });

      const listOfLayerArtefacts: LuaArray<TSection> = readIniStringList(
        ini,
        layerSection,
        "artefacts",
        false,
        defaultArtefacts
      );

      this.artefactsSpawnList.set(layerSection, listOfLayerArtefacts);

      const initialArtefacts: Optional<string> = readIniString(
        ini,
        layerSection,
        "start_artefact",
        false,
        null,
        defaultSpawned
      );

      if (initialArtefacts) {
        this.isForcedToSpawn = true;
        this.artefactsStartList.set(layerSection, parseStringsList(initialArtefacts));
      }

      const coeffsSection: TSection = readIniString(
        ini,
        layerSection,
        "coeffs_section",
        false,
        null,
        defaultCoeffSectionName
      );
      const conditionsList: TConditionList = parseConditionsList(coeffsSection);
      const coeffsSectionName: TSection = pickSectionFromCondList(registry.actor, null, conditionsList)!;
      const coeffs: Optional<string> = readIniString(ini, layerSection, coeffsSectionName, false, null, defaultCoeffs);

      this.artefactsSpawnCoefficients.set(layerSection, coeffs === null ? new LuaTable() : parseNumbersList(coeffs));

      const path: Optional<TName> = readIniString(ini, layerSection, "artefact_ways", false, null, defaultWays);

      if (!path) {
        abort("There is no field 'artefact_ways' in section '%s' in object '%s'.", layerSection, object.name());
      }

      this.artefactsPathsList.set(layerSection, parseStringsList(path));

      if (this.isCustomPlacement) {
        const field: Optional<string> = readIniString(ini, layerSection, "field_name", false, null, defaultFieldName);

        this.layerFieldsTable.set(layerSection, field === null ? new LuaTable() : parseStringsList(field));

        const minesSection: Optional<TSection> = readIniString(ini, layerSection, "mines_section", true);

        assert(
          minesSection,
          "There is no field 'mines_section' in section '%s' in object '%s'.",
          layerSection,
          object.name()
        );

        this.layerMinesTable.set(layerSection, new LuaTable());

        if (ini.line_count(minesSection) > 0) {
          // logger.info("Init mines for section:", section, minesSection);
          for (const index of $range(0, ini.line_count(minesSection) - 1)) {
            const [, mineName] = ini.r_line(minesSection, index, "", "");

            table.insert(this.layerMinesTable.get(layerSection), mineName);
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
      const availableArtefactSpots: number = this.maxArtefactsInZone - this.spawnedArtefactsCount;
      let respawnTries: TCount = this.respawnTries;

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

    packet.w_u8(layerNumber === null ? MAX_U8 : layerNumber);

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

    for (const [layer] of this.layerFieldsTable) {
      if (layer !== currentLayer) {
        for (const [, vv] of this.layerFieldsTable.get(layer)) {
          if (anomalyFields.has(vv)) {
            anomalyFields.get(vv).setEnabled(false);
          } else {
            counter += 1;
          }
        }
      }
    }

    for (const [layer] of this.layerMinesTable) {
      if (layer !== currentLayer) {
        for (const [, vv] of this.layerMinesTable.get(layer)) {
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
      for (const [, vv] of this.layerFieldsTable.get(currentLayer)) {
        if (anomalyFields.has(vv)) {
          anomalyFields.get(vv).setEnabled(true);
        }
      }

      for (const [, vv] of this.layerMinesTable.get(currentLayer)) {
        if (anomalyFields.has(vv)) {
          anomalyFields.get(vv).setEnabled(true);
        }
      }
    }
  }

  /**
   * todo: Description.
   */
  public respawnArtefactsAndChangeLayers(): void {
    logger.info("Surge spawn / layers change:", this.object.name());

    const anomalyFields: LuaTable<TName, AnomalyFieldBinder> = registry.anomalyFields;

    this.shouldRespawnArtefactsIfPossible = true;

    if (this.isCustomPlacement) {
      let layer: string = this.currentZoneLayer;

      for (const [, v] of this.layerFieldsTable.get(layer)) {
        if (anomalyFields.has(v)) {
          anomalyFields.get(v).setEnabled(false);
        }
      }

      for (const [, v] of this.layerMinesTable.get(layer)) {
        if (anomalyFields.has(v)) {
          anomalyFields.get(v).setEnabled(false);
        }
      }

      layer = ANOMALY_ZONE_LAYER + math.random(1, this.zoneLayersCount);

      for (const [, v] of this.layerFieldsTable.get(layer)) {
        if (anomalyFields.has(v)) {
          anomalyFields.get(v).setEnabled(true);
        }
      }

      for (const [, v] of this.layerMinesTable.get(layer)) {
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

    const layer: TSection = this.currentZoneLayer;

    let randomArtefact: TSection = "";

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
        const chance: TRate = this.artefactsSpawnCoefficients.get(layer).get(it);

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
  public getRandomArtefactPath(): TName {
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
      return table.random(this.artefactsPathsList.get(this.currentZoneLayer))[1];
    }

    return table.random(paths)[1];
  }

  /**
   * todo: Description.
   */
  public setForcedSpawnOverride(artefactSection: TSection): void {
    logger.info("Set force override:", this.object.name());

    this.hasForcedSpawnOverride = true;
    this.forcedArtefact = artefactSection;

    logger.info("Set forced override for zone/artefact:", this.object.name(), artefactSection);
  }

  /**
   * Callback for artefact taking from current anomaly zone.
   *
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
