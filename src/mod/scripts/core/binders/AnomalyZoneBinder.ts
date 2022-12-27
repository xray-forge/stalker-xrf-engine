import { AnyCallable, AnyObject, Optional } from "@/mod/lib/types";
import { FIELDS_BY_NAME } from "@/mod/scripts/core/binders/AnomalyFieldBinder";
import { addAnomaly, addObject, deleteAnomaly, deleteObject, storage } from "@/mod/scripts/core/db";
import { mapDisplayManager } from "@/mod/scripts/ui/game/MapDisplayManager";
import { getStoryObject } from "@/mod/scripts/utils/alife";
import { getConfigNumber, getConfigString } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { setMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { parseNames, parseNums } from "@/mod/scripts/utils/params";

const log: LuaLogger = new LuaLogger("core/binders/AnomalyZoneBinder");

// todo: Move to db.
export const ARTEFACT_WAYS_BY_ARTEFACT_ID: LuaTable<number, string> = new LuaTable();
// todo: Move to db.
export const ARTEFACT_POINTS_BY_ARTEFACT_ID: LuaTable<number, number> = new LuaTable();
/**
 * todo: Move to DB.
 * Ownership of artefacts linking.
 */
export const PARENT_ZONES_BY_ARTEFACT_ID: LuaTable<number, IAnomalyZoneBinder> = new LuaTable();

/**
 * Section name in ini file, contains configuration
 */
const ANOMAL_ZONE_SECTION: string = "anomal_zone";
const ANOMAL_ZONE_LAYER: string = "layer_";
const MAX_UNSIGNED_8_BIT: number = 255;
const ARTEFACT_SPAWN_CHANCE: number = 17;
const UPDATE_THROTTLE: number = 5_000;

export interface IAnomalyZoneBinder extends XR_object_binder {
  ini: XR_ini_file;

  delta: number;

  isDisabled: boolean;
  isTurnedOff: boolean;
  isCustomPlacement: boolean;
  shouldRespawnArtefactsIfPossible: boolean;

  zoneLayersCount: number;
  currentZoneLayer: string;

  artefactWaysByArtefactId: LuaTable<number, string>;
  artefactPointsByArtefactId: LuaTable<number, number>;

  /**
   * Current state description.
   */
  spawnedArtefactsCount: number;

  respawnTries: number;
  maxArtefactsInZone: number;
  applyingForceXZ: number;
  applyingForceY: number;

  hasForcedSpawnOverride: boolean;
  isForcedToSpawn: boolean;
  forcedArtefact: Optional<string>;

  /**
   * Layers description.
   */
  layersRespawnTriesTable: LuaTable<string, number>;
  layersMaxArtefactsTable: LuaTable<string, number>;
  layersForcesTable: LuaTable<string, { xz: number; y: number }>;

  artefactsStartList: LuaTable<string, LuaTable<number, string>>;
  artefactsSpawnList: LuaTable<string, LuaTable<number, string>>;
  artefactsSpawnCoefficients: LuaTable<string, LuaTable<number, number>>;
  artefactsPathsList: LuaTable<string, LuaTable<number, string>>;

  fieldsTable: LuaTable<string, LuaTable<number, string>>;
  minesTable: LuaTable<string, LuaTable<number, string>>;

  /**
   * todo: used by effectors
   */
  turn_on(forceRespawn: boolean): void;
  turn_off(): void;

  getArtefactsListForSection(section: string, defaultList: Optional<string>): LuaTable<number, string>;

  getRandomArtefactPath(): string;
  disableAnomalyFields(): void;
  spawnRandomArtefact(): void;
  respawnArtefactsAndReplaceAnomalyZones(): void;
  setForcedSpawnOverride(artefactName: string): void;

  onArtefactTaken(object: XR_game_object): void;
}

/**
 * todo: Critically needs simplification of logic.
 */
export const AnomalyZoneBinder: IAnomalyZoneBinder = declare_xr_class("AnomalyZoneBinder", object_binder, {
  delta: UPDATE_THROTTLE,
  __init(object: XR_game_object): void {
    xr_class_super(object);

    log.info("Init anomaly zone:", object.name());

    this.ini = object.spawn_ini();

    if (!this.ini.section_exist(ANOMAL_ZONE_SECTION)) {
      this.isDisabled = true;

      return log.warn("Zone without configuration detected:", object.name());
    }

    const filename: Optional<string> = getConfigString(this.ini, ANOMAL_ZONE_SECTION, "cfg", null, false, "", null);

    log.info("Init anomaly zone from file:", object.name(), filename);

    if (filename !== null) {
      this.ini = new ini_file(filename);
    }

    const ini: XR_ini_file = this.ini;

    this.isDisabled = false;
    this.isTurnedOff = false;

    this.artefactWaysByArtefactId = new LuaTable();
    this.artefactPointsByArtefactId = new LuaTable();
    this.artefactsSpawnList = new LuaTable();
    this.artefactsStartList = new LuaTable();
    this.artefactsSpawnCoefficients = new LuaTable();
    this.artefactsPathsList = new LuaTable();
    this.fieldsTable = new LuaTable();
    this.minesTable = new LuaTable();
    this.layersRespawnTriesTable = new LuaTable();
    this.layersMaxArtefactsTable = new LuaTable();
    this.layersForcesTable = new LuaTable();
    this.spawnedArtefactsCount = 0;

    this.shouldRespawnArtefactsIfPossible = true;
    this.isForcedToSpawn = false;
    this.hasForcedSpawnOverride = false;
    this.forcedArtefact = null;
    this.zoneLayersCount = getConfigNumber(ini, ANOMAL_ZONE_SECTION, "layers_count", null, false, 1);
    this.isCustomPlacement = this.zoneLayersCount > 1;
    this.currentZoneLayer = ANOMAL_ZONE_LAYER + math.random(1, this.zoneLayersCount); // Pick one of possible layers.

    const defaultRespawnTries: number = getConfigNumber(ini, ANOMAL_ZONE_SECTION, "respawn_tries", null, false, 2);
    const defaultMaxArtefacts: number = getConfigNumber(ini, ANOMAL_ZONE_SECTION, "max_artefacts", null, false, 3);
    const defaultForceXZ: number = getConfigNumber(ini, ANOMAL_ZONE_SECTION, "applying_force_xz", null, false, 200);
    const defaultForceY: number = getConfigNumber(ini, ANOMAL_ZONE_SECTION, "applying_force_y", null, false, 400);
    const defaultArtefacts: Optional<string> = getConfigString(
      ini,
      ANOMAL_ZONE_SECTION,
      "artefacts",
      null,
      false,
      "",
      null
    );
    const defaultSpawned: Optional<string> = getConfigString(
      ini,
      ANOMAL_ZONE_SECTION,
      "start_artefact",
      null,
      false,
      "",
      null
    );
    const defaultWays: Optional<string> = getConfigString(
      ini,
      ANOMAL_ZONE_SECTION,
      "artefact_ways",
      null,
      false,
      "",
      null
    );
    const defaultFieldName: Optional<string> = getConfigString(
      ini,
      ANOMAL_ZONE_SECTION,
      "field_name",
      null,
      false,
      "",
      null
    );
    const defaultCoeffs: Optional<string> = getConfigString(ini, ANOMAL_ZONE_SECTION, "coeff", null, false, "", null);
    const defaultCoeffSectionName: string = getConfigString(
      ini,
      ANOMAL_ZONE_SECTION,
      "coeffs_section",
      null,
      false,
      "",
      "{+actor_was_in_many_bad_places} coeff2, coeff"
    );

    log.info("Init zone layers (picked/count):", this.currentZoneLayer, this.zoneLayersCount);

    for (const i of $range(1, this.zoneLayersCount)) {
      const section: string = ANOMAL_ZONE_LAYER + i;

      log.info("Init layer:", section);

      this.layersRespawnTriesTable.set(
        section,
        getConfigNumber(ini, section, "artefact_count", null, false, defaultRespawnTries)
      );

      this.layersRespawnTriesTable.set(
        section,
        getConfigNumber(ini, section, "respawn_tries", null, false, this.layersRespawnTriesTable.get(section))
      );

      this.layersMaxArtefactsTable.set(
        section,
        getConfigNumber(ini, section, "max_artefacts", null, false, defaultMaxArtefacts)
      );

      this.layersForcesTable.set(section, {
        xz: getConfigNumber(ini, section, "applying_force_xz", null, false, defaultForceXZ),
        y: getConfigNumber(ini, section, "applying_force_y", null, false, defaultForceY)
      });

      const listOfAvailableArtefacts: LuaTable<number, string> = this.getArtefactsListForSection(
        section,
        defaultArtefacts
      );

      this.artefactsSpawnList.set(section, listOfAvailableArtefacts);

      const initialArtefacts: Optional<string> = getConfigString(
        ini,
        section,
        "start_artefact",
        null,
        false,
        "",
        defaultSpawned
      );

      if (initialArtefacts !== null) {
        this.isForcedToSpawn = true;
        this.artefactsStartList.set(section, parseNames(initialArtefacts));
      }

      /**
       * todo: Parse coefficients from XR logic.
       */
      const xr_logic: AnyObject = get_global("xr_logic");
      const coeffsSection: string = getConfigString(
        ini,
        section,
        "coeffs_section",
        null,
        false,
        "",
        defaultCoeffSectionName
      );
      const parsedCondlist = (xr_logic.parse_condlist as AnyCallable)(
        null,
        "anomal_zone_binder",
        "coeff_condlist",
        coeffsSection
      );
      const coeffsSectionName = (xr_logic.pick_section_from_condlist as AnyCallable)(
        getStoryObject("actor"),
        null,
        parsedCondlist
      );
      const coeffs: Optional<string> = getConfigString(ini, section, coeffsSectionName, null, false, "", defaultCoeffs);
      /**
       * end todo;
       */

      this.artefactsSpawnCoefficients.set(section, coeffs === null ? new LuaTable() : parseNums(coeffs));

      const path: Optional<string> = getConfigString(ini, section, "artefact_ways", null, false, "", defaultWays);

      if (path == null) {
        abort("There is no field 'artefact_ways' in section [%s] in obj [%s]", section, object.name());
      }

      this.artefactsPathsList.set(section, parseNames(path));

      if (this.isCustomPlacement) {
        const field: Optional<string> = getConfigString(ini, section, "field_name", null, false, "", defaultFieldName);

        if (field === null) {
          this.fieldsTable.set(section, new LuaTable());
          // --abort("There is no field 'field_name' in section [%s] in obj [%s]", section, obj:name())
        } else {
          this.fieldsTable.set(section, parseNames(field));
        }

        const mines_section = getConfigString(ini, section, "mines_section", null, true, "", null);

        if (mines_section == null) {
          abort("There is no field 'mines_section' in section [%s] in obj [%s]", section, object.name());
        }

        this.minesTable.set(section, new LuaTable());

        if (ini.line_count(mines_section) > 0) {
          log.info("Init mines for section:", section, mines_section);
          for (const i of $range(0, ini.line_count(mines_section) - 1)) {
            const [temp1, mine_name, temp2] = ini.r_line(mines_section, i, "", "");

            log.info("Init mines for section:", section, mine_name);
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
  },
  turn_off(): void {
    log.info("Turn off zone:", this.object.name());

    this.isTurnedOff = true;
    this.disableAnomalyFields();

    for (const [k, v] of this.artefactWaysByArtefactId) {
      alife().release(alife().object(tonumber(k)), true);
      ARTEFACT_WAYS_BY_ARTEFACT_ID.delete(k);
      ARTEFACT_POINTS_BY_ARTEFACT_ID.delete(k);
      PARENT_ZONES_BY_ARTEFACT_ID.delete(k);
    }

    this.spawnedArtefactsCount = 0;
    this.artefactWaysByArtefactId = new LuaTable();
    this.artefactPointsByArtefactId = new LuaTable();
  },
  turn_on(forceRespawn: Optional<boolean>): void {
    log.info("Turn on zone:", this.object.name());

    this.isTurnedOff = false;
    this.disableAnomalyFields();

    if (forceRespawn) {
      this.shouldRespawnArtefactsIfPossible = true;
    } else {
      this.shouldRespawnArtefactsIfPossible = false;
    }
  },
  disableAnomalyFields(): void {
    log.info("Disable anomaly fields:", this.object.name());

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
  },
  respawnArtefactsAndReplaceAnomalyZones(): void {
    log.info("Disable artefacts and replace anomaly zone:", this.object.name());

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
  },
  spawnRandomArtefact(): void {
    log.info("Spawn random artefact:", this.object.name(), this.currentZoneLayer);

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

    const artefactObject: XR_cse_alife_creature_abstract = alife().create(
      randomArtefact,
      randomPath.point(randomPathPoint),
      this.object.level_vertex_id(),
      this.object.game_vertex_id()
    );

    PARENT_ZONES_BY_ARTEFACT_ID.set(artefactObject.id, this);
    ARTEFACT_WAYS_BY_ARTEFACT_ID.set(artefactObject.id, randomPathName);
    ARTEFACT_POINTS_BY_ARTEFACT_ID.set(artefactObject.id, randomPathPoint);

    this.artefactWaysByArtefactId.set(artefactObject.id, randomPathName);
    this.artefactPointsByArtefactId.set(artefactObject.id, randomPathPoint);
    this.spawnedArtefactsCount = this.spawnedArtefactsCount + 1;

    log.info("Spawned random artefact:", randomArtefact, artefactObject.id);
  },
  getRandomArtefactPath(): string {
    log.info("Get artefact path:", this.object.name());

    const paths: LuaTable<number, string> = new LuaTable();

    for (const [k, v] of this.artefactsPathsList.get(this.currentZoneLayer)) {
      let f_spawned = false;

      for (const [kk, vv] of this.artefactWaysByArtefactId) {
        if (vv !== null && v == vv) {
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
  },
  setForcedSpawnOverride(artefactName: string): void {
    log.info("Set force override:", this.object.name());

    this.forcedArtefact = artefactName;
    this.hasForcedSpawnOverride = true;

    log.info("Set forced override for zone/artefact:", this.object.name(), artefactName);
  },
  reload(section: string): void {
    object_binder.reload(this, section);
  },
  reinit(): void {
    object_binder.reinit(this);
    storage.set(this.object.id(), {} as any);
  },
  net_spawn(object: XR_cse_alife_creature_abstract): boolean {
    if (!object_binder.net_spawn(this, object)) {
      return false;
    }

    addAnomaly(this);
    addObject(this.object);

    return true;
  },
  net_destroy(): void {
    deleteAnomaly(this);
    deleteObject(this.object);

    storage.delete(this.object.id());
    object_binder.net_destroy(this);
  },
  update(delta: number): void {
    this.delta += delta;

    if (this.delta >= UPDATE_THROTTLE) {
      object_binder.update(this, this.delta);

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
  },
  onArtefactTaken(object: XR_game_object | XR_cse_alife_creature_abstract): void {
    log.info("On artefact take:", this.object.name());

    const id: number =
      type(object.id) === "number" ? (object as XR_cse_alife_creature_abstract).id : (object as XR_game_object).id();

    ARTEFACT_WAYS_BY_ARTEFACT_ID.delete(id);
    ARTEFACT_POINTS_BY_ARTEFACT_ID.delete(id);

    this.artefactWaysByArtefactId.delete(id);
    this.artefactPointsByArtefactId.delete(id);

    this.spawnedArtefactsCount = this.spawnedArtefactsCount - 1;

    mapDisplayManager.updateAnomaliesZones();
  },
  net_save_relevant(): boolean {
    return true;
  },
  save(packet: XR_net_packet): void {
    setMarker(packet, "save", false, "AnomalyZoneBinder");
    object_binder.save(this, packet);

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
    const layerNumber: number = tonumber(
      string.sub(
        this.currentZoneLayer,
        (string.find(this.currentZoneLayer, "_") as number) + 1,
        string.len(this.currentZoneLayer)
      )
    );

    if (layerNumber !== null) {
      packet.w_u8(layerNumber);
    } else {
      packet.w_u8(MAX_UNSIGNED_8_BIT);
    }

    packet.w_bool(this.isTurnedOff);

    setMarker(packet, "save", true, "AnomalyZoneBinder");
  },
  load(packet: XR_net_packet): void {
    setMarker(packet, "load", false, "AnomalyZoneBinder");
    object_binder.load(this, packet);

    const waysCount: number = packet.r_u16();

    for (const i of $range(1, waysCount)) {
      const artefactId: number = packet.r_u16();
      const wayName: string = packet.r_stringZ();

      this.artefactWaysByArtefactId.set(artefactId, wayName);

      ARTEFACT_WAYS_BY_ARTEFACT_ID.set(artefactId, wayName);
      PARENT_ZONES_BY_ARTEFACT_ID.set(artefactId, this);
    }

    const pointsCount: number = packet.r_u16();

    for (const i of $range(1, pointsCount)) {
      const artefactId: number = packet.r_u16();
      const pointName: number = packet.r_u8();

      ARTEFACT_POINTS_BY_ARTEFACT_ID.set(artefactId, pointName);
      this.artefactPointsByArtefactId.set(artefactId, pointName);
    }

    this.spawnedArtefactsCount = packet.r_u8();
    this.shouldRespawnArtefactsIfPossible = packet.r_bool();
    this.isForcedToSpawn = packet.r_bool();
    this.hasForcedSpawnOverride = packet.r_bool();
    this.forcedArtefact = packet.r_stringZ();

    const currentLayer: number = packet.r_u8();

    if (currentLayer !== MAX_UNSIGNED_8_BIT) {
      this.currentZoneLayer = ANOMAL_ZONE_LAYER + currentLayer;
    }

    this.isTurnedOff = packet.r_bool();

    setMarker(packet, "load", true, "AnomalyZoneBinder");
  },
  getArtefactsListForSection(section: string, defaultArtefacts: Optional<string>): LuaTable<number, string> {
    const baseArtefactsList: Optional<string> = getConfigString(
      this.ini,
      section,
      "artefacts",
      null,
      false,
      "",
      defaultArtefacts
    );

    if (baseArtefactsList === null) {
      abort("There is no field 'artefacts' in section [%s] in obj [%s]", section, this.object.name());
    }

    return parseNames(baseArtefactsList);
  }
} as IAnomalyZoneBinder);
