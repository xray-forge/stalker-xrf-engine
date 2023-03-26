import {
  alife,
  ini_file,
  LuabindClass,
  object_binder,
  patrol,
  XR_cse_alife_item_artefact,
  XR_cse_alife_object,
  XR_game_object,
  XR_ini_file,
  XR_net_packet,
  XR_patrol,
  XR_reader,
} from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  openSaveMarker,
  registerAnomaly,
  registry,
  resetObject,
  unregisterAnomaly,
} from "@/engine/core/database";
import { openLoadMarker } from "@/engine/core/database/save_markers";
import { MapDisplayManager } from "@/engine/core/managers/map/MapDisplayManager";
import { FIELDS_BY_NAME } from "@/engine/core/objects/binders/AnomalyFieldBinder";
import { abort } from "@/engine/core/utils/assertion";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { readIniNumber, readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseConditionsList, parseNumbersList, parseStringsList, TConditionList } from "@/engine/core/utils/parse";
import { MAX_U8 } from "@/engine/lib/constants/memory";
import { Optional, TCount, TDuration, TRate, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Section name in ini file, contains configuration
 */
const ANOMAL_ZONE_SECTION: string = "anomal_zone";
const ANOMAL_ZONE_LAYER: string = "layer_";
const ARTEFACT_SPAWN_CHANCE: number = 17;
const UPDATE_THROTTLE: number = 5_000;

/**
 * todo: Needs simplification of logic.
 */
@LuabindClass()
export class AnomalyZoneBinder extends object_binder {
  public readonly ini: XR_ini_file;

  public delta: number = UPDATE_THROTTLE;

  public isDisabled: boolean = false;
  public isTurnedOff: boolean = false;
  public isCustomPlacement: boolean = false;
  public shouldRespawnArtefactsIfPossible: boolean = true;

  public artefactWaysByArtefactId: LuaTable<number, string> = new LuaTable();
  public artefactPointsByArtefactId: LuaTable<number, number> = new LuaTable();

  /**
   * Current state description.
   */
  public spawnedArtefactsCount: number = 0;

  public respawnTries: number = -1;
  public maxArtefactsInZone: number = -1;
  public applyingForceXZ: number = -1;
  public applyingForceY: number = -1;

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

  /**
   * todo: Description.
   */
  public constructor(object: XR_game_object) {
    super(object);

    this.ini = object.spawn_ini()!;

    if (!this.ini.section_exist(ANOMAL_ZONE_SECTION)) {
      this.isDisabled = true;

      logger.warn("Zone without configuration detected:", object.name());

      return;
    }

    const filename: Optional<string> = readIniString(this.ini, ANOMAL_ZONE_SECTION, "cfg", false, "", null);

    logger.info("Init anomaly zone from file:", object.name(), filename);

    if (filename !== null) {
      this.ini = new ini_file(filename);
    }

    const ini: XR_ini_file = this.ini;

    this.zoneLayersCount = readIniNumber(ini, ANOMAL_ZONE_SECTION, "layers_count", false, 1);
    this.isCustomPlacement = this.zoneLayersCount > 1;
    this.currentZoneLayer = ANOMAL_ZONE_LAYER + math.random(1, this.zoneLayersCount); // Pick one of possible layers.

    const defaultRespawnTries: TCount = readIniNumber(ini, ANOMAL_ZONE_SECTION, "respawn_tries", false, 2);
    const defaultMaxArtefacts: TCount = readIniNumber(ini, ANOMAL_ZONE_SECTION, "max_artefacts", false, 3);
    const defaultForceXZ: TRate = readIniNumber(ini, ANOMAL_ZONE_SECTION, "applying_force_xz", false, 200);
    const defaultForceY: TRate = readIniNumber(ini, ANOMAL_ZONE_SECTION, "applying_force_y", false, 400);
    const defaultArtefacts: Optional<string> = readIniString(ini, ANOMAL_ZONE_SECTION, "artefacts", false, "", null);
    const defaultSpawned: Optional<string> = readIniString(ini, ANOMAL_ZONE_SECTION, "start_artefact", false, "", null);
    const defaultWays: Optional<string> = readIniString(ini, ANOMAL_ZONE_SECTION, "artefact_ways", false, "", null);
    const defaultFieldName: Optional<string> = readIniString(ini, ANOMAL_ZONE_SECTION, "field_name", false, "", null);
    const defaultCoeffs: Optional<string> = readIniString(ini, ANOMAL_ZONE_SECTION, "coeff", false, "", null);
    const defaultCoeffSectionName: string = readIniString(
      ini,
      ANOMAL_ZONE_SECTION,
      "coeffs_section",
      false,
      "",
      "{+actor_was_in_many_bad_places} coeff2, coeff"
    );

    logger.info("Init zone layers (picked/count):", this.currentZoneLayer, this.zoneLayersCount);

    for (const i of $range(1, this.zoneLayersCount)) {
      const section: string = ANOMAL_ZONE_LAYER + i;

      logger.info("Init layer:", section);

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
        "",
        defaultSpawned
      );

      if (initialArtefacts !== null) {
        this.isForcedToSpawn = true;
        this.artefactsStartList.set(section, parseStringsList(initialArtefacts));
      }

      const coeffsSection: string = readIniString(ini, section, "coeffs_section", false, "", defaultCoeffSectionName);
      const conditionsList: TConditionList = parseConditionsList(coeffsSection);
      const coeffsSectionName = pickSectionFromCondList(registry.actor, null, conditionsList)!;
      const coeffs: Optional<string> = readIniString(ini, section, coeffsSectionName, false, "", defaultCoeffs);
      /**
       * end todo;
       */

      this.artefactsSpawnCoefficients.set(section, coeffs === null ? new LuaTable() : parseNumbersList(coeffs));

      const path: Optional<string> = readIniString(ini, section, "artefact_ways", false, "", defaultWays);

      if (path === null) {
        abort("There is no field 'artefact_ways' in section [%s] in obj [%s]", section, object.name());
      }

      this.artefactsPathsList.set(section, parseStringsList(path));

      if (this.isCustomPlacement) {
        const field: Optional<string> = readIniString(ini, section, "field_name", false, "", defaultFieldName);

        if (field === null) {
          this.fieldsTable.set(section, new LuaTable());
          // --abort("There is no field 'field_name' in section [%s] in obj [%s]", section, obj:name())
        } else {
          this.fieldsTable.set(section, parseStringsList(field));
        }

        const minesSection: Optional<TSection> = readIniString(ini, section, "mines_section", true, "", null);

        if (minesSection === null) {
          abort("There is no field 'mines_section' in section [%s] in obj [%s]", section, object.name());
        }

        this.minesTable.set(section, new LuaTable());

        if (ini.line_count(minesSection) > 0) {
          logger.info("Init mines for section:", section, minesSection);
          for (const i of $range(0, ini.line_count(minesSection) - 1)) {
            const [temp1, mine_name, temp2] = ini.r_line(minesSection, i, "", "");

            table.insert(this.minesTable.get(section), mine_name);
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

  /**
   * todo: Description.
   */
  public turn_off(): void {
    logger.info("Turn off zone:", this.object.name());

    this.isTurnedOff = true;
    this.disableAnomalyFields();

    for (const [artefactId, artefactWay] of this.artefactWaysByArtefactId) {
      alife().release(alife().object(tonumber(artefactId) as number), true);
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
  public turn_on(forceRespawn: Optional<boolean>): void {
    logger.info("Turn on zone:", this.object.name());

    this.isTurnedOff = false;
    this.disableAnomalyFields();

    if (forceRespawn) {
      this.shouldRespawnArtefactsIfPossible = true;
    } else {
      this.shouldRespawnArtefactsIfPossible = false;
    }
  }

  /**
   * todo: Description.
   */
  public disableAnomalyFields(): void {
    logger.info("Disable anomaly fields:", this.object.name());

    if (!this.isCustomPlacement) {
      this.isDisabled = true;

      return;
    }

    const currentLayer: string = this.currentZoneLayer;
    const anomalyFields = FIELDS_BY_NAME;

    let counter = 0;

    for (const [k, v] of this.fieldsTable) {
      if (k !== currentLayer) {
        for (const [kk, vv] of this.fieldsTable.get(k)) {
          if (anomalyFields.get(vv) !== null) {
            anomalyFields.get(vv).set_enable(false);
          } else {
            counter = counter + 1;
          }
        }
      }
    }

    for (const [k, v] of this.minesTable) {
      if (k !== currentLayer) {
        for (const [kk, vv] of this.minesTable.get(k)) {
          if (anomalyFields.get(vv) !== null) {
            anomalyFields.get(vv).set_enable(false);
          } else {
            counter = counter + 1;
          }
        }
      }
    }

    if (counter === 0) {
      this.isDisabled = true;
    }

    if (!this.isTurnedOff) {
      for (const [kk, vv] of this.fieldsTable.get(currentLayer)) {
        if (anomalyFields.get(vv) !== null) {
          anomalyFields.get(vv).set_enable(true);
        }
      }

      for (const [kk, vv] of this.minesTable.get(currentLayer)) {
        if (anomalyFields.get(vv) !== null) {
          anomalyFields.get(vv).set_enable(true);
        }
      }
    }
  }

  /**
   * todo: Description.
   */
  public respawnArtefactsAndReplaceAnomalyZones(): void {
    logger.info("Respawn artefacts and replace anomaly zone:", this.object.name());

    const anom_fields = FIELDS_BY_NAME;

    this.shouldRespawnArtefactsIfPossible = true;

    if (this.isCustomPlacement) {
      let layer: string = this.currentZoneLayer;

      for (const [k, v] of this.fieldsTable.get(layer)) {
        if (anom_fields.get(v) !== null) {
          anom_fields.get(v).set_enable(false);
        }
      }

      for (const [k, v] of this.minesTable.get(layer)) {
        if (anom_fields.get(v) !== null) {
          anom_fields.get(v).set_enable(false);
        }
      }

      layer = ANOMAL_ZONE_LAYER + math.random(1, this.zoneLayersCount);

      for (const [k, v] of this.fieldsTable.get(layer)) {
        if (anom_fields.get(v) !== null) {
          anom_fields.get(v).set_enable(true);
        }
      }

      for (const [k, v] of this.minesTable.get(layer)) {
        if (anom_fields.get(v) !== null) {
          anom_fields.get(v).set_enable(true);
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
    logger.info("Spawn random artefact:", this.object.name(), this.currentZoneLayer);

    const layer: string = this.currentZoneLayer;
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

      let coeffTotal: number = 0;

      for (const [k, v] of this.artefactsSpawnCoefficients.get(layer)) {
        coeffTotal = coeffTotal + v;
      }

      if (coeffTotal === 0) {
        for (const it of $range(1, this.artefactsSpawnList.get(layer).length())) {
          this.artefactsSpawnCoefficients.get(layer).set(it, 1);
          coeffTotal = coeffTotal + 1;
        }
      }

      let random: number = math.random(1, coeffTotal);

      for (const it of $range(1, this.artefactsSpawnList.get(layer).length())) {
        const chance = this.artefactsSpawnCoefficients.get(layer).get(it);

        if (random <= chance) {
          randomArtefact = this.artefactsSpawnList.get(layer).get(it);
        }

        random = random - chance;
      }
    }

    const randomPathName: string = this.getRandomArtefactPath();
    const randomPath: XR_patrol = new patrol(randomPathName);
    const randomPathPoint: number = math.random(0, randomPath.count() - 1);

    const artefactObject: XR_cse_alife_object = alife().create(
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
    this.spawnedArtefactsCount = this.spawnedArtefactsCount + 1;

    logger.info("Spawned random artefact:", randomArtefact, artefactObject.id);
  }

  /**
   * todo: Description.
   */
  public getRandomArtefactPath(): string {
    logger.info("Get artefact path:", this.object.name());

    const paths: LuaTable<number, string> = new LuaTable();

    for (const [k, v] of this.artefactsPathsList.get(this.currentZoneLayer)) {
      let f_spawned = false;

      for (const [kk, vv] of this.artefactWaysByArtefactId) {
        if (vv !== null && v === vv) {
          f_spawned = true;
        }
      }

      if (!f_spawned) {
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
  public setForcedSpawnOverride(artefactName: string): void {
    logger.info("Set force override:", this.object.name());

    this.forcedArtefact = artefactName;
    this.hasForcedSpawnOverride = true;

    logger.info("Set forced override for zone/artefact:", this.object.name(), artefactName);
  }

  /**
   * todo: Description.
   */
  public override reinit(): void {
    super.reinit();
    resetObject(this.object);
  }

  /**
   * todo: Description.
   */
  public override net_spawn(object: XR_cse_alife_object): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    registerAnomaly(this);

    return true;
  }

  /**
   * todo: Description.
   */
  public override net_destroy(): void {
    unregisterAnomaly(this);

    registry.objects.delete(this.object.id());
    super.net_destroy();
  }

  /**
   * todo: Description.
   */
  public override update(delta: TDuration): void {
    this.delta += delta;

    if (this.delta >= UPDATE_THROTTLE) {
      super.update(this.delta);

      this.delta = 0;
    } else {
      return;
    }

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

      for (const it of $range(1, respawnTries)) {
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

  /**
   * todo: Description.
   */
  public onArtefactTaken(object: XR_game_object | XR_cse_alife_item_artefact): void {
    logger.info("On artefact take:", this.object.name());

    const id: number =
      type(object.id) === "number" ? (object as XR_cse_alife_object).id : (object as XR_game_object).id();

    registry.artefacts.ways.delete(id);
    registry.artefacts.points.delete(id);

    this.artefactWaysByArtefactId.delete(id);
    this.artefactPointsByArtefactId.delete(id);

    this.spawnedArtefactsCount = this.spawnedArtefactsCount - 1;

    MapDisplayManager.getInstance().updateAnomalyZonesDisplay();
  }

  /**
   * todo: Description.
   */
  public override net_save_relevant(): boolean {
    return true;
  }

  /**
   * todo: Description.
   */
  public override save(packet: XR_net_packet): void {
    openSaveMarker(packet, AnomalyZoneBinder.__name);
    super.save(packet);

    let count: number = 0;

    /**
     * Artefact ways save.
     * todo: Custom utils for len?
     */
    for (const [k, v] of this.artefactWaysByArtefactId) {
      count = count + 1;
    }

    packet.w_u16(count);

    for (const [k, v] of this.artefactWaysByArtefactId) {
      packet.w_u16(k);
      packet.w_stringZ(v);
    }

    /**
     * Artefact points save.
     */

    count = 0;

    for (const [k, v] of this.artefactPointsByArtefactId) {
      count = count + 1;
    }

    packet.w_u16(count);

    for (const [k, v] of this.artefactPointsByArtefactId) {
      packet.w_u16(k);
      packet.w_u8(v);
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
    const layerNumber: number = tonumber(
      string.sub(this.currentZoneLayer, foundIndex + 1, string.len(this.currentZoneLayer))
    ) as number;

    if (layerNumber !== null) {
      packet.w_u8(layerNumber);
    } else {
      packet.w_u8(MAX_U8);
    }

    packet.w_bool(this.isTurnedOff);

    closeSaveMarker(packet, AnomalyZoneBinder.__name);
  }

  /**
   * todo: Description.
   */
  public override load(reader: XR_reader): void {
    openLoadMarker(reader, AnomalyZoneBinder.__name);

    super.load(reader);

    const waysCount: number = reader.r_u16();

    for (const i of $range(1, waysCount)) {
      const artefactId: number = reader.r_u16();
      const wayName: string = reader.r_stringZ();

      this.artefactWaysByArtefactId.set(artefactId, wayName);

      registry.artefacts.ways.set(artefactId, wayName);
      registry.artefacts.parentZones.set(artefactId, this);
    }

    const pointsCount: number = reader.r_u16();

    for (const i of $range(1, pointsCount)) {
      const artefactId: number = reader.r_u16();
      const pointName: number = reader.r_u8();

      registry.artefacts.points.set(artefactId, pointName);
      this.artefactPointsByArtefactId.set(artefactId, pointName);
    }

    this.spawnedArtefactsCount = reader.r_u8();
    this.shouldRespawnArtefactsIfPossible = reader.r_bool();
    this.isForcedToSpawn = reader.r_bool();
    this.hasForcedSpawnOverride = reader.r_bool();
    this.forcedArtefact = reader.r_stringZ();

    const currentLayer: number = reader.r_u8();

    if (currentLayer !== MAX_U8) {
      this.currentZoneLayer = ANOMAL_ZONE_LAYER + currentLayer;
    }

    this.isTurnedOff = reader.r_bool();

    closeLoadMarker(reader, AnomalyZoneBinder.__name);
  }

  /**
   * todo: Description.
   */
  public getArtefactsListForSection(section: string, defaultArtefacts: Optional<string>): LuaTable<number, string> {
    const baseArtefactsList: Optional<string> = readIniString(
      this.ini,
      section,
      "artefacts",
      false,
      "",
      defaultArtefacts
    );

    if (baseArtefactsList === null) {
      abort("There is no field 'artefacts' in section [%s] in obj [%s]", section, this.object.name());
    }

    return parseStringsList(baseArtefactsList);
  }
}
