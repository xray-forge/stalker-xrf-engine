import { ini_file, LuabindClass, object_binder } from "xray16";

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
import { getAnomalyFreePaths, spawnArtefactInAnomaly } from "@/engine/core/utils/anomaly";
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
import { MAX_U8 } from "@/engine/lib/constants/memory";
import {
  GameObject,
  IniFile,
  LuaArray,
  NetPacket,
  NetReader,
  Optional,
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

  public artefactPathsByArtefactId: LuaTable<TNumberId, TName> = new LuaTable();
  public artefactPointsByArtefactId: LuaTable<TNumberId, TIndex> = new LuaTable();

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

  // List of artefacts spawned initially.
  public artefactsStartList: LuaTable<TSection, LuaArray<TSection>> = new LuaTable();
  public artefactsSpawnList: LuaTable<TSection, LuaArray<TSection>> = new LuaTable();
  public artefactsSpawnCoefficients: LuaTable<TSection, LuaArray<TRate>> = new LuaTable();
  public artefactsPathsList: LuaTable<TSection, LuaArray<TName>> = new LuaTable();

  public constructor(object: GameObject) {
    super(object);

    this.ini = object.spawn_ini()!;

    if (!this.ini.section_exist(ANOMALY_ZONE_SECTION)) {
      this.isDisabled = true;

      logger.info("Anomaly zone without configuration detected: %s", object.name());

      return;
    }

    const filename: Optional<string> = readIniString(this.ini, ANOMALY_ZONE_SECTION, "cfg", false);

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

    for (const index of $range(1, this.zoneLayersCount)) {
      const layerSection: TSection = ANOMALY_ZONE_LAYER + index;

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
        const section: Optional<TSection> = this.getArtefactSectionToSpawn();

        if (section) {
          logger.info("Spawn artefact: %s in %s", section, this.object.name());
          spawnArtefactInAnomaly(this, section, this.getNewArtefactPath());
        }
      }

      this.shouldRespawnArtefactsIfPossible = false;
    } else if (this.spawnedArtefactsCount >= this.maxArtefactsInZone && this.shouldRespawnArtefactsIfPossible) {
      this.shouldRespawnArtefactsIfPossible = false;
    }

    if (!this.isDisabled) {
      this.switchAnomalyFields();
    }
  }

  public override net_save_relevant(): boolean {
    return true;
  }

  public override save(packet: NetPacket): void {
    openSaveMarker(packet, AnomalyZoneBinder.__name);

    super.save(packet);

    packet.w_u16(table.size(this.artefactPathsByArtefactId));

    for (const [id, wayName] of this.artefactPathsByArtefactId) {
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

  public override load(reader: NetReader): void {
    openLoadMarker(reader, AnomalyZoneBinder.__name);

    super.load(reader);

    const waysCount: TCount = reader.r_u16();

    for (const _ of $range(1, waysCount)) {
      const artefactId: TNumberId = reader.r_u16();
      const wayName: TName = reader.r_stringZ();

      this.artefactPathsByArtefactId.set(artefactId, wayName);

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
  public switchAnomalyFields(): void {
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
    logger.info("Surge spawn / layers change: %s", this.object.name());

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

  public getArtefactSectionToSpawn(): Optional<TSection> {
    if (this.hasForcedSpawnOverride && this.forcedArtefact) {
      this.hasForcedSpawnOverride = false;

      return this.forcedArtefact;
    } else if (this.isForcedToSpawn) {
      this.isForcedToSpawn = false;

      return this.artefactsStartList
        .get(this.currentZoneLayer)
        .get(this.artefactsStartList.get(this.currentZoneLayer).length());
    } else {
      // Spawn artefact with some chance only if it is not forced.
      if (math.random(1, 100) > ARTEFACT_SPAWN_CHANCE) {
        return null;
      }

      const artefactsList: LuaArray<TSection> = this.artefactsSpawnList.get(this.currentZoneLayer);
      const artefactsRate: LuaArray<TRate> = this.artefactsSpawnCoefficients.get(this.currentZoneLayer);

      let chance: TRate = 0;

      for (const [, rate] of artefactsRate) {
        chance += rate;
      }

      // Re-initialize artefacts spawn chances as normalized 1-1-1 rates.
      if (chance === 0) {
        for (const it of $range(1, artefactsList.length())) {
          artefactsRate.set(it, 1);
          chance += 1;
        }
      }

      // Decide which one to spawn from possible artefacts list.
      let section: Optional<TSection> = null;
      let random: TRate = math.random(1, chance);

      for (const it of $range(1, artefactsList.length())) {
        const spawnRate: TRate = artefactsRate.get(it);

        if (random <= spawnRate) {
          section = artefactsList.get(it);
        }

        random -= spawnRate;
      }

      return section;
    }
  }

  /**
   * Finds random not used patrol or fallbacks to random duplicated path.
   *
   * @returns patrol name to use for new artefact in anomaly zone
   */
  public getNewArtefactPath(): TName {
    const paths: LuaArray<TName> = getAnomalyFreePaths(this);

    if (paths.length() > 0) {
      return table.random(paths)[1];
    } else {
      return table.random(this.artefactsPathsList.get(this.currentZoneLayer))[1];
    }
  }

  /**
   * Turn on anomaly zone.
   * Switch on all layer fields if they are defined.
   *
   * @param forceArtefactsRespawn - whether artefacts should be spawned on next update tick
   */
  public turnOn(forceArtefactsRespawn: Optional<boolean>): void {
    logger.info("Turn on zone: %s", this.object.name());

    this.isTurnedOff = false;
    this.shouldRespawnArtefactsIfPossible = forceArtefactsRespawn === true;
    this.switchAnomalyFields();
  }

  /**
   * Turn off anomaly zone and currently active anomaly fields.
   * Release all spawned artefacts in zone.
   */
  public turnOff(): void {
    logger.info("Turn off zone: %s", this.object.name());

    this.isTurnedOff = true;
    this.switchAnomalyFields();

    for (const [artefactId] of this.artefactPathsByArtefactId) {
      registry.simulator.release(registry.simulator.object(artefactId), true);

      registry.artefacts.ways.delete(artefactId);
      registry.artefacts.points.delete(artefactId);
      registry.artefacts.parentZones.delete(artefactId);
    }

    this.spawnedArtefactsCount = 0;
    this.artefactPathsByArtefactId = new LuaTable();
    this.artefactPointsByArtefactId = new LuaTable();
  }

  /**
   * @param section - artefact section to set as forced spawn
   */
  public setForcedSpawnOverride(section: TSection): void {
    logger.info("Set forced override for zone/artefact: %s %s", this.object.name(), section);

    this.hasForcedSpawnOverride = true;
    this.forcedArtefact = section;
  }

  /**
   * Callback for artefact taking from current anomaly zone.
   *
   * @param artefactId - object id of artefact taken from the anomaly zone
   */
  public onArtefactTaken(artefactId: TNumberId): void {
    logger.info("On artefact take: %s", this.object.name());

    this.spawnedArtefactsCount -= 1;

    registry.artefacts.points.delete(artefactId);
    registry.artefacts.ways.delete(artefactId);

    this.artefactPointsByArtefactId.delete(artefactId);
    this.artefactPathsByArtefactId.delete(artefactId);

    // todo: Probably just update self, not all.
    getManager(MapDisplayManager).updateAnomalyZonesDisplay();
  }
}
