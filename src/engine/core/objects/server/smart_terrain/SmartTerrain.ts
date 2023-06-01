import {
  alife,
  CALifeSmartTerrainTask,
  cse_alife_smart_zone,
  editor,
  game,
  game_graph,
  getFS,
  ini_file,
  level,
  LuabindClass,
  time_global,
} from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  hardResetOfflineObject,
  IRegistryObjectState,
  loadDynamicIni,
  openSaveMarker,
  registerObjectStoryLinks,
  registry,
  SMART_TERRAIN_MASKS_LTX,
  softResetOfflineObject,
  unregisterStoryLinkByObjectId,
} from "@/engine/core/database";
import { openLoadMarker } from "@/engine/core/database/save_markers";
import {
  registerSimulationObject,
  unregisterSimulationObject,
  updateSimulationObjectAvailability,
} from "@/engine/core/database/simulation";
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import {
  areOnlyMonstersOnJobs,
  jobIterator,
  loadSmartTerrainJobs,
} from "@/engine/core/objects/server/smart_terrain/jobs_general";
import { SmartTerrainControl } from "@/engine/core/objects/server/smart_terrain/SmartTerrainControl";
import {
  ESmartTerrainStatus,
  IObjectJobDescriptor,
  ISmartTerrainJob,
  TJobDescriptor,
} from "@/engine/core/objects/server/smart_terrain/types";
import { SquadReachTargetAction, SquadStayOnTargetAction } from "@/engine/core/objects/server/squad/action";
import { simulationActivities } from "@/engine/core/objects/server/squad/simulation_activities";
import { Squad } from "@/engine/core/objects/server/squad/Squad";
import {
  ESimulationTerrainRole,
  ISimulationActivityDescriptor,
  ISimulationActivityPrecondition,
  ISimulationTarget,
  TSimulationObject,
} from "@/engine/core/objects/server/types";
import {
  activateSchemeBySection,
  getObjectSectionToActivate,
  switchObjectSchemeToSection,
} from "@/engine/core/schemes/base/utils";
import { configureObjectSchemes } from "@/engine/core/schemes/base/utils/configureObjectSchemes";
import { initializeObjectSchemeLogic } from "@/engine/core/schemes/base/utils/initializeObjectSchemeLogic";
import { abort, assert, assertDefined } from "@/engine/core/utils/assertion";
import { isMonster, isStalker } from "@/engine/core/utils/check/is";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { getSchemeByIniSection, readIniBoolean, readIniNumber, readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { areObjectsOnSameLevel } from "@/engine/core/utils/object";
import {
  IConfigSwitchCondition,
  parseConditionsList,
  parseStringsList,
  TConditionList,
} from "@/engine/core/utils/parse";
import { getTableSize, isEmpty } from "@/engine/core/utils/table";
import { readTimeFromPacket, writeTimeToPacket } from "@/engine/core/utils/time";
import { toJSON } from "@/engine/core/utils/transform/json";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { TCaption } from "@/engine/lib/constants/captions/captions";
import { MAX_U8 } from "@/engine/lib/constants/memory";
import { relations, TRelation } from "@/engine/lib/constants/relations";
import { roots } from "@/engine/lib/constants/roots";
import { SMART_TERRAIN_SECTION } from "@/engine/lib/constants/sections";
import { NIL, TRUE } from "@/engine/lib/constants/words";
import {
  AlifeSimulator,
  ALifeSmartTerrainTask,
  AnyObject,
  ClientObject,
  ESchemeType,
  GameGraphVertex,
  IniFile,
  LuaArray,
  NetPacket,
  Optional,
  ServerCreatureObject,
  TCount,
  TDistance,
  TDuration,
  Time,
  TIndex,
  TLabel,
  TName,
  TNumberId,
  TRate,
  TSection,
  TStringId,
  TTimestamp,
  Vector,
  ZoneCampfire,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

export const path_fields: LuaArray<string> = $fromArray(["path_walk", "path_main", "path_home", "center_point"]);

/**
 * todo;
 */
export const valid_territory: LuaTable<string, boolean> = {
  default: true,
  base: true,
  resource: true,
  territory: true,
} as any;

/**
 * todo;
 */
@LuabindClass()
export class SmartTerrain extends cse_alife_smart_zone implements ISimulationTarget {
  public ini!: IniFile;
  public ltxConfig!: IniFile;
  public ltxConfigName!: string;

  public squadId: TNumberId = 0;
  public level: TName = "";

  public simulationRole: ESimulationTerrainRole = ESimulationTerrainRole.DEFAULT;
  public smartTerrainDisplayedMapSpot: Optional<TRelation> = null;
  public respawnSector: Optional<TConditionList> = null;
  public forbiddenPoint: string = "";

  public isRegistered: boolean = false;
  public isRespawnPoint: boolean = false;
  public isObjectsInitializationNeeded: boolean = false; // Whether after game start / load.
  public isSimulationAvailableConditionList: TConditionList = parseConditionsList(TRUE);
  public isMutantDisabled: boolean = false;
  public isMutantLair: boolean = false;
  public isRespawnOnlySmart: boolean = false;
  public areCampfiresOn: boolean = false;

  /**
   * If smart terrain is attacked, all active squads will react.
   */
  public alarmStartedAt: Optional<Time> = null;

  public arrivalDistance: TNumberId = logicsConfig.SMART_TERRAIN.DEFAULT_ARRIVAL_DISTANCE;

  public population: TCount = 0;
  public maxPopulation: TCount = -1;

  public nextCheckAt: TTimestamp = 0;
  public lastRespawnUpdatedAt: Optional<Time> = null;

  public travelerActorPath: TName = "";
  public travelerSquadPath: TName = "";

  public defendRestrictor: Optional<string> = null;
  public attackRestrictor: Optional<TName> = null;
  public safeRestrictor: Optional<TName> = null;
  public spawnPointName: Optional<TName> = null;

  public smartTerrainActorControl: Optional<SmartTerrainControl> = null;

  /**
   * Already working on smart descriptors.
   */
  public objectJobDescriptors: LuaTable<TNumberId, IObjectJobDescriptor> = new LuaTable();
  /**
   * Starting working on smart descriptors objects.
   */
  public arrivingObjects: LuaTable<TNumberId, ServerCreatureObject> = new LuaTable();

  public objectByJobSection: LuaTable<TSection, TNumberId> = new LuaTable();
  public objectsToRegister: LuaTable<TIndex, ServerCreatureObject> = new LuaTable();

  public smartTerrainAlifeTask!: ALifeSmartTerrainTask;

  /**
   * Tree-like representation of available smart terrain jobs.
   */
  public jobs!: LuaArray<TJobDescriptor>;
  /**
   * Flat representation of available smart terrain jobs.
   */
  public jobsData: LuaArray<ISmartTerrainJob> = new LuaTable();
  public jobDeadTimeById: LuaTable<TNumberId, Time> = new LuaTable(); // job id -> time

  public simulationProperties!: AnyObject;
  public simulationBoardManager!: SimulationBoardManager;

  public respawnConfiguration!: LuaTable<TSection, { squads: LuaArray<TSection>; num: TConditionList }>;
  public alreadySpawned!: LuaTable<TSection, { num: TCount }>;

  public override on_before_register(): void {
    super.on_before_register();

    this.simulationBoardManager = SimulationBoardManager.getInstance();
    this.simulationBoardManager.registerSmartTerrain(this);
    this.level = alife().level_name(game_graph().vertex(this.m_game_vertex_id).level_id());
  }

  public override on_register(): void {
    super.on_register();

    registerObjectStoryLinks(this);
    registerSimulationObject(this);

    if (gameConfig.DEBUG.IS_SIMULATION_DEBUG_ENABLED) {
      this.updateMapDisplay();
    }

    this.smartTerrainAlifeTask = new CALifeSmartTerrainTask(this.m_game_vertex_id, this.m_level_vertex_id);
    this.isRegistered = true;

    this.loadJobs();

    this.simulationBoardManager.initializeSmartTerrain(this);

    if (this.isObjectsInitializationNeeded) {
      this.isObjectsInitializationNeeded = false;
      this.initializeObjectsAfterLoad();
    }

    this.registerDelayedObjects();
    this.nextCheckAt = time_global();
  }

  public override on_unregister(): void {
    super.on_unregister();

    unregisterStoryLinkByObjectId(this.id);
    unregisterSimulationObject(this);

    this.simulationBoardManager.unregisterSmartTerrain(this);
  }

  /**
   * Register provided object in smart terrain.
   */
  public override register_npc(object: ServerCreatureObject): void {
    logger.info("Register object in smart:", this.name(), object.name(), this.population);

    this.population += 1;

    if (!this.isRegistered) {
      return table.insert(this.objectsToRegister, object);
    }

    if (!isStalker(object)) {
      object.smart_terrain_task_activate();
    }

    object.m_smart_terrain_id = this.id;

    if (this.onObjectArrived(object)) {
      this.objectJobDescriptors.set(object.id, this.createObjectSmartJobDescriptor(object));
      this.jobDeadTimeById = new LuaTable();
      this.selectObjectJob(this.objectJobDescriptors.get(object.id));
    } else {
      this.arrivingObjects.set(object.id, object);
    }
  }

  /**
   * Unregister provided object from current smart.
   */
  public override unregister_npc(object: ServerCreatureObject): void {
    logger.info("Unregister object:", this.name(), object.name(), this.population);

    this.population -= 1;

    if (this.objectJobDescriptors.get(object.id) !== null) {
      this.objectJobDescriptors.get(object.id).job_link!.npc_id = null;
      this.objectJobDescriptors.delete(object.id);

      object.clear_smart_terrain();

      if (registry.objects.get(object.id) !== null) {
        const registryState: IRegistryObjectState = registry.objects.get(object.id);

        initializeObjectSchemeLogic(
          registryState.object,
          registryState,
          false,
          registry.actor,
          isStalker(object) ? ESchemeType.STALKER : ESchemeType.MONSTER
        );
      }

      return;
    }

    if (this.arrivingObjects.get(object.id) !== null) {
      this.arrivingObjects.delete(object.id);
      object.clear_smart_terrain();

      return;
    }

    abort("this.npc_info[obj.id] = null !!! obj.id=%d", object.id);
  }

  /**
   * todo: Description.
   */
  public override task(object: ServerCreatureObject): Optional<CALifeSmartTerrainTask> {
    logger.info("Task:", this.name(), object.name());

    if (this.arrivingObjects.get(object.id) !== null) {
      return this.smartTerrainAlifeTask;
    }

    return this.jobsData.get(this.objectJobDescriptors.get(object.id).job_id).alife_task;
  }

  /**
   * todo: Description.
   */
  public override STATE_Write(packet: NetPacket): void {
    super.STATE_Write(packet);

    openSaveMarker(packet, SmartTerrain.__name);

    packet.w_u8(getTableSize(this.arrivingObjects));

    for (const [k, v] of this.arrivingObjects) {
      packet.w_u16(k);
    }

    packet.w_u8(getTableSize(this.objectJobDescriptors));

    for (const [k, v] of this.objectJobDescriptors) {
      packet.w_u16(k);
      packet.w_u8(v.job_prior);
      packet.w_u8(v.job_id);
      packet.w_bool(v.begin_job);
      packet.w_stringZ(v.need_job);
    }

    packet.w_u8(getTableSize(this.jobDeadTimeById));

    for (const [k, v] of this.jobDeadTimeById) {
      packet.w_u8(k);
      writeTimeToPacket(packet, v);
    }

    if (this.smartTerrainActorControl !== null) {
      packet.w_bool(true);
      this.smartTerrainActorControl.save(packet);
    } else {
      packet.w_bool(false);
    }

    if (this.isRespawnPoint) {
      packet.w_bool(true);
      packet.w_u8(getTableSize(this.alreadySpawned));

      for (const [k, v] of this.alreadySpawned) {
        packet.w_stringZ(k);
        packet.w_u8(v.num);
      }

      if (this.lastRespawnUpdatedAt !== null) {
        packet.w_bool(true);
        writeTimeToPacket(packet, this.lastRespawnUpdatedAt);
      } else {
        packet.w_bool(false);
      }
    } else {
      packet.w_bool(false);
    }

    if (this.population < 0) {
      abort("Smart_terrain [%s] population can't be less than zero!", this.name());
    }

    packet.w_u8(this.population);

    closeSaveMarker(packet, SmartTerrain.__name);
  }

  /**
   * todo: Description.
   */
  public override STATE_Read(packet: NetPacket, size: number): void {
    super.STATE_Read(packet, size);

    if (editor()) {
      return;
    }

    openLoadMarker(packet, SmartTerrain.__name);
    this.initialize();

    let count: TCount = packet.r_u8();

    this.arrivingObjects = new LuaTable();

    for (const it of $range(1, count)) {
      const id: TNumberId = packet.r_u16();

      // Will be updated with init.
      this.arrivingObjects.set(id, false as unknown as ServerCreatureObject);
    }

    count = packet.r_u8();
    this.objectJobDescriptors = new LuaTable();

    for (const it of $range(1, count)) {
      const id = packet.r_u16();

      const jobDescriptor: IObjectJobDescriptor = {} as IObjectJobDescriptor;

      this.objectJobDescriptors.set(id, jobDescriptor);

      jobDescriptor.job_prior = packet.r_u8();

      if (jobDescriptor.job_prior === MAX_U8) {
        jobDescriptor.job_prior = -1;
      }

      jobDescriptor.job_id = packet.r_u8();

      if (jobDescriptor.job_id === MAX_U8) {
        jobDescriptor.job_id = -1;
      }

      jobDescriptor.begin_job = packet.r_bool();
      jobDescriptor.need_job = packet.r_stringZ();
    }

    count = packet.r_u8();
    this.jobDeadTimeById = new LuaTable();

    for (const it of $range(1, count)) {
      const jobId = packet.r_u8();
      const deadTime = readTimeFromPacket(packet)!;

      this.jobDeadTimeById.set(jobId, deadTime);
    }

    this.isObjectsInitializationNeeded = true;

    if (this.script_version > 9) {
      if (packet.r_bool() === true) {
        this.smartTerrainActorControl?.load(packet);
      }
    }

    const isRespawnPoint: boolean = packet.r_bool();

    if (isRespawnPoint) {
      count = packet.r_u8();
      for (const it of $range(1, count)) {
        const id = packet.r_stringZ();
        const num = packet.r_u8();

        this.alreadySpawned.get(id).num = num;
      }

      const exist: boolean = packet.r_bool();

      if (exist) {
        this.lastRespawnUpdatedAt = readTimeFromPacket(packet);
      } else {
        this.lastRespawnUpdatedAt = null;
      }
    }

    this.population = packet.r_u8();

    closeLoadMarker(packet, SmartTerrain.__name);
  }

  /**
   * todo: Description.
   */
  public override update(): void {
    super.update();

    if (gameConfig.DEBUG.IS_SIMULATION_DEBUG_ENABLED || this.smartTerrainDisplayedMapSpot !== null) {
      this.updateMapDisplay();
    }

    const now: TTimestamp = time_global();

    if (areObjectsOnSameLevel(this, alife().actor())) {
      const distanceToActor: TDistance = this.position.distance_to(alife().actor()!.position);
      const previousDistanceToActor: TDistance =
        registry.smartTerrainNearest.id === null
          ? registry.smartTerrainNearest.distance
          : alife().object(registry.smartTerrainNearest.id)!.position.distance_to(alife().actor().position);

      if (distanceToActor < previousDistanceToActor) {
        registry.smartTerrainNearest.id = this.id;
        registry.smartTerrainNearest.distance = distanceToActor;
      }
    }

    if (this.respawnConfiguration !== null) {
      this.tryRespawnSquad();
    }

    if (now < this.nextCheckAt) {
      return;
    }

    if (this.areCampfiresOn && areOnlyMonstersOnJobs(this.objectJobDescriptors)) {
      this.turnOffCampfires();
    } else if (!this.areCampfiresOn && !areOnlyMonstersOnJobs(this.objectJobDescriptors)) {
      this.turnOnCampfires();
    }

    if (registry.actor === null) {
      this.nextCheckAt = now + 10;
    } else {
      const distance: TDistance = registry.actor.position().distance_to_sqr(this.position);
      const idleTime: TDuration = math.max(60, 0.003 * distance);

      this.nextCheckAt = now + idleTime;
    }

    const currentGameTime: Time = game.get_game_time();

    for (const [k, v] of this.jobDeadTimeById) {
      if (currentGameTime.diffSec(v) >= logicsConfig.SMART_TERRAIN.DEATH_IDLE_TIME) {
        this.jobDeadTimeById.delete(k);
      }
    }

    this.update_jobs();

    if (this.smartTerrainActorControl !== null) {
      this.smartTerrainActorControl.update();
    }

    updateSimulationObjectAvailability(this);
  }

  /**
   * Get smart terrain name label.
   * Used for UI display or mentioning in strings.
   */
  public getNameCaption(): TCaption {
    return string.format("st_%s_name", this.name());
  }

  /**
   * Initialize smart terrain from ini files.
   */
  public initialize(): void {
    this.ini = this.spawn_ini();

    assert(this.ini.section_exist(SMART_TERRAIN_SECTION), "[smart_terrain %s] no configuration!", this.name());

    const filename: Optional<TName> = readIniString(this.ini, SMART_TERRAIN_SECTION, "cfg", false, "");

    if (filename !== null) {
      if (getFS().exist(roots.gameConfig, filename)) {
        this.ini = new ini_file(filename);
      } else {
        abort("There is no configuration file [%s] in smart_terrain [%s]", filename, this.name());
      }
    }

    this.simulationRole = readIniString(
      this.ini,
      SMART_TERRAIN_SECTION,
      "sim_type",
      false,
      "",
      ESimulationTerrainRole.DEFAULT
    ) as ESimulationTerrainRole;

    if (valid_territory.get(this.simulationRole) === null) {
      abort("Wrong sim_type value [%s] in smart [%s]", this.simulationRole, this.name());
    }

    this.squadId = readIniNumber(this.ini, SMART_TERRAIN_SECTION, "squad_id", false, 0);

    let respawnSectorData: Optional<string> = readIniString(
      this.ini,
      SMART_TERRAIN_SECTION,
      "respawn_sector",
      false,
      ""
    );

    if (respawnSectorData !== null) {
      if (respawnSectorData === "default") {
        respawnSectorData = "all";
      }

      this.respawnSector = parseConditionsList(respawnSectorData);
    } else {
      this.respawnSector = null;
    }

    this.isMutantLair = readIniBoolean(this.ini, SMART_TERRAIN_SECTION, "mutant_lair", false);
    this.isMutantDisabled = readIniBoolean(this.ini, SMART_TERRAIN_SECTION, "no_mutant", false);

    if (this.isMutantDisabled) {
      logger.info("Found no mutant point:", this.name());
    }

    this.forbiddenPoint = readIniString(this.ini, SMART_TERRAIN_SECTION, "forbidden_point", false, "");
    this.defendRestrictor = readIniString(this.ini, SMART_TERRAIN_SECTION, "def_restr", false, "", null);
    this.attackRestrictor = readIniString(this.ini, SMART_TERRAIN_SECTION, "att_restr", false, "", null);
    this.safeRestrictor = readIniString(this.ini, SMART_TERRAIN_SECTION, "safe_restr", false, "", null);
    this.spawnPointName = readIniString(this.ini, SMART_TERRAIN_SECTION, "spawn_point", false, "");
    this.arrivalDistance = readIniNumber(this.ini, SMART_TERRAIN_SECTION, "arrive_dist", false, 30);

    const maxPopulationData: string = readIniString(this.ini, SMART_TERRAIN_SECTION, "max_population", false, "", "0");
    const parsedConditionsList: LuaArray<IConfigSwitchCondition> = parseConditionsList(maxPopulationData);

    this.maxPopulation = tonumber(pickSectionFromCondList(registry.actor, null, parsedConditionsList)) as TCount;

    this.isRespawnOnlySmart = readIniBoolean(this.ini, SMART_TERRAIN_SECTION, "respawn_only_smart", false, false);

    const respawnSection: Optional<TSection> = readIniString(
      this.ini,
      SMART_TERRAIN_SECTION,
      "respawn_params",
      false,
      "",
      null
    );
    const smartControlSection: Optional<TSection> = readIniString(
      this.ini,
      SMART_TERRAIN_SECTION,
      "smart_control",
      false,
      "",
      null
    );

    if (smartControlSection !== null) {
      this.smartTerrainActorControl = new SmartTerrainControl(this, this.ini, smartControlSection);
    }

    if (respawnSection === null) {
      this.isRespawnPoint = false;
    } else {
      this.applyRespawnSection(respawnSection);
    }

    if (level.patrol_path_exists(this.name() + "_traveller_actor")) {
      this.travelerActorPath = this.name() + "_traveller_actor";
    }

    if (level.patrol_path_exists(this.name() + "_traveller_squad")) {
      this.travelerSquadPath = this.name() + "_traveller_squad";
    }

    if (!SMART_TERRAIN_MASKS_LTX.section_exist(this.name())) {
      logger.warn("No terrain_mask section in smart_terrain_masks.ltx:", this.name());
    }
  }

  /**
   * todo: Description.
   */
  public createObjectSmartJobDescriptor(object: ServerCreatureObject): IObjectJobDescriptor {
    logger.info("Create object job descriptor:", object.name());

    const isObjectStalker: boolean = isStalker(object);

    return {
      serverObject: object,
      isMonster: !isObjectStalker,
      need_job: NIL,
      job_prior: -1,
      job_link: null,
      job_id: -1,
      begin_job: false,
      schemeType: isObjectStalker ? ESchemeType.STALKER : ESchemeType.MONSTER,
    };
  }

  /**
   * Register all objects that were registered before smart terrains.
   */
  public registerDelayedObjects(): void {
    logger.info("Registering delayed NPCs:", this.name(), this.objectsToRegister.length);

    for (const [k, v] of this.objectsToRegister) {
      this.register_npc(v);
    }

    this.objectsToRegister = new LuaTable();
  }

  /**
   * todo: Description.
   */
  public onObjectDeath(object: ServerCreatureObject): void {
    logger.info("Clear dead:", this.name(), object.name());

    if (this.objectJobDescriptors.get(object.id) !== null) {
      this.jobDeadTimeById.set(this.objectJobDescriptors.get(object.id).job_id, game.get_game_time());

      this.objectJobDescriptors.get(object.id).job_link!.npc_id = null;
      this.objectJobDescriptors.delete(object.id);
      object.clear_smart_terrain();

      return;
    }

    if (this.arrivingObjects.get(object.id) !== null) {
      this.arrivingObjects.delete(object.id);
      object.clear_smart_terrain();

      return;
    }

    abort("this.npc_info[obj.id] = null !!! obj.id=%d", object.id);
  }

  /**
   * todo: Description.
   */
  public loadJobs(): void {
    logger.info("Load jobs:", this.name());

    const [jobs, ltxContent] = loadSmartTerrainJobs(this);
    const [ltx, ltxName] = loadDynamicIni(this.name(), ltxContent);

    this.jobs = jobs;
    this.ltxConfig = ltx;
    this.ltxConfigName = ltxName;

    const sortJobs = (jobs: LuaArray<TJobDescriptor>) => {
      for (const [index, descriptor] of jobs) {
        if ("jobs" in descriptor) {
          sortJobs(descriptor.jobs);
        }
      }

      table.sort(jobs as any, (a: any, b: any) => a.priority > b.priority);
    };

    sortJobs(this.jobs);

    let id = 0;

    this.jobsData = new LuaTable();

    const initializeJobsData = (jobs: LuaTable<any, any>) => {
      for (const [k, v] of jobs) {
        if (v.jobs !== null) {
          initializeJobsData(v.jobs);
        } else {
          if (v.job_id === null) {
            abort("Incorrect job table");
          }

          this.jobsData.set(id, v.job_id);
          this.jobsData.get(id).priority = v.priority;

          v.job_id = id;
          id = id + 1;
        }
      }
    };

    initializeJobsData(this.jobs);

    for (const [index, job] of this.jobsData) {
      const section = job.section;
      const ltx: IniFile = job.ini_file || this.ltxConfig;

      if (!ltx.line_exist(section, "active")) {
        abort("gulag: ltx=%s  no 'active' in section %s", this.ltxConfigName, section);
      }

      const active_section = ltx.r_string(section, "active");

      if (job.job_type === "path_job") {
        let path_field: string = "";

        for (const [i, vv] of path_fields) {
          if (ltx.line_exist(active_section, vv)) {
            path_field = vv;
            break;
          }
        }

        let pathName = ltx.r_string(active_section, path_field);

        if (job.prefix_name !== null) {
          pathName = job.prefix_name + "_" + pathName;
        } else {
          pathName = this.name() + "_" + pathName;
        }

        if (pathName === "center_point") {
          if (level.patrol_path_exists(pathName + "_task")) {
            pathName = pathName + "_task";
          }
        }

        job.alife_task = new CALifeSmartTerrainTask(pathName);
      } else if (job.job_type === "smartcover_job") {
        const smartcover_name = ltx.r_string(active_section, "cover_name");
        const smartcover = registry.smartCovers.get(smartcover_name);

        if (smartcover === null) {
          abort(
            "There is an exclusive job with wrong smatrcover name [%s]    smartterrain [%s]",
            tostring(smartcover_name),
            this.name()
          );
        }

        job.alife_task = new CALifeSmartTerrainTask(smartcover.m_game_vertex_id, smartcover.m_level_vertex_id);
      } else if (job.job_type === "point_job") {
        job.alife_task = this.smartTerrainAlifeTask as CALifeSmartTerrainTask;
      }

      job.game_vertex_id = job.alife_task.game_vertex_id();
      job.level_id = game_graph().vertex(job.game_vertex_id).level_id();
      job.position = job.alife_task.position();
    }
  }

  /**
   * todo: Description.
   */
  public update_jobs(): void {
    this.updateAlarmStatus();

    for (const [id, object] of this.arrivingObjects) {
      if (this.onObjectArrived(object)) {
        this.objectJobDescriptors.set(object.id, this.createObjectSmartJobDescriptor(object));
        this.jobDeadTimeById = new LuaTable();
        this.selectObjectJob(this.objectJobDescriptors.get(object.id));
        this.arrivingObjects.delete(id);
      }
    }

    table.sort(this.objectJobDescriptors, (a, b) => a.job_prior < b.job_prior);

    for (const [k, v] of this.objectJobDescriptors) {
      this.selectObjectJob(v);
    }
  }

  /**
   * todo: Description.
   */
  public selectObjectJob(objectJobDescriptor: IObjectJobDescriptor): void {
    const [selectedJobId, selectedJobPriority, selectedJobLink] = jobIterator(this, this.jobs, objectJobDescriptor, 0);

    assertDefined(
      selectedJobId,
      "Insufficient smart_terrain jobs: %s, %s, %s",
      this.name(),
      objectJobDescriptor.serverObject.id,
      this.simulationRole
    );

    if (selectedJobId !== objectJobDescriptor.job_id && selectedJobLink !== null) {
      if (objectJobDescriptor.job_link !== null) {
        this.objectByJobSection.delete(this.jobsData.get(objectJobDescriptor.job_link.job_id).section);
        objectJobDescriptor.job_link.npc_id = null;
      }

      selectedJobLink.npc_id = objectJobDescriptor.serverObject.id;
      this.objectByJobSection.set(this.jobsData.get(selectedJobLink.job_id).section, selectedJobLink.npc_id);

      objectJobDescriptor.job_id = selectedJobLink.job_id;
      objectJobDescriptor.job_prior = selectedJobLink.priority;
      objectJobDescriptor.begin_job = false;
      objectJobDescriptor.job_link = selectedJobLink;

      const objectState: Optional<IRegistryObjectState> = registry.objects.get(objectJobDescriptor.serverObject.id);

      if (objectState !== null) {
        switchObjectSchemeToSection(objectState.object!, this.ltxConfig, NIL);
      }
    }

    if (!objectJobDescriptor.begin_job) {
      const job_data = this.jobsData.get(objectJobDescriptor.job_id);

      logger.info("Begin job in smart", this.name(), objectJobDescriptor.serverObject.name(), job_data.section);

      hardResetOfflineObject(objectJobDescriptor.serverObject.id);

      objectJobDescriptor.begin_job = true;

      const objectState: Optional<IRegistryObjectState> = registry.objects.get(objectJobDescriptor.serverObject.id);

      if (objectState !== null) {
        this.setupObjectLogic(objectState.object!);
      }
    }
  }

  /**
   * todo: Description.
   */
  public setupObjectLogic(object: ClientObject): void {
    logger.info("Setup logic:", this.name(), object.name());

    const objectJobDescriptor: IObjectJobDescriptor = this.objectJobDescriptors.get(object.id());
    const job = this.jobsData.get(objectJobDescriptor.job_id);
    const ltx = job.ini_file || this.ltxConfig;
    const ltx_name = job.ini_path || this.ltxConfigName;

    configureObjectSchemes(
      object,
      ltx,
      ltx_name,
      objectJobDescriptor.schemeType,
      job.section,
      job.prefix_name || this.name()
    );

    const section: TSection = getObjectSectionToActivate(object, ltx, job.section, registry.actor);

    if (getSchemeByIniSection(job.section) === NIL) {
      abort("[smart_terrain %s] section=%s, don't use section 'null'!", this.name(), section);
    }

    activateSchemeBySection(object, ltx, section, job.prefix_name || this.name(), false);
  }

  /**
   * todo: Description.
   */
  public getJob(objectId: TNumberId): Optional<ISmartTerrainJob> {
    return this.objectJobDescriptors.get(objectId) && this.jobsData.get(this.objectJobDescriptors.get(objectId).job_id);
  }

  /**
   * todo: Description.
   */
  public idNPCOnJob(jobName: TName): TNumberId {
    return this.objectByJobSection.get(jobName);
  }

  /**
   * todo: Description.
   */
  public switch_to_desired_job(object: ClientObject): void {
    logger.info("Switch to desired job:", this.name(), object.name());

    const objectId: TNumberId = object.id();
    const objectInfo: IObjectJobDescriptor = this.objectJobDescriptors.get(objectId);
    const changingObjectId: TNumberId = this.objectByJobSection.get(objectInfo.need_job);

    if (changingObjectId === null) {
      objectInfo.job_link = null;
      objectInfo.job_id = -1;
      objectInfo.job_prior = -1;
      this.selectObjectJob(objectInfo);

      return;
    }

    if (this.objectJobDescriptors.get(changingObjectId) === null) {
      objectInfo.job_link = null;
      objectInfo.job_id = -1;
      objectInfo.job_prior = -1;
      this.selectObjectJob(objectInfo);

      return;
    }

    const desired_job = this.objectJobDescriptors.get(changingObjectId).job_id;

    if (objectInfo.job_link !== null) {
      this.objectByJobSection.delete(this.jobsData.get(objectInfo.job_link.job_id).section);
      objectInfo.job_link.npc_id = null;
    }

    const selectedJobLink = this.objectJobDescriptors.get(changingObjectId).job_link!;

    selectedJobLink.npc_id = objectInfo.serverObject.id;

    this.objectByJobSection.set(this.jobsData.get(selectedJobLink.job_id).section, selectedJobLink.npc_id);

    objectInfo.job_id = selectedJobLink.job_id;
    objectInfo.job_prior = selectedJobLink.priority;
    objectInfo.begin_job = true;

    objectInfo.job_link = selectedJobLink;
    objectInfo.need_job = NIL;

    const objectStorage = registry.objects.get(objectId);

    if (objectStorage !== null) {
      this.setupObjectLogic(objectStorage.object!);
    }

    const changingObjectInfo: IObjectJobDescriptor = this.objectJobDescriptors.get(changingObjectId);

    changingObjectInfo.job_link = null;
    changingObjectInfo.job_id = -1;
    changingObjectInfo.job_prior = -1;

    this.selectObjectJob(changingObjectInfo);
  }

  /**
   * todo: Description.
   */
  public initializeObjectsAfterLoad(): void {
    logger.info("Initialize objects after load:", this.name());

    const findNewJob = (jobs: LuaTable<any, any>, objectJobDescriptor: IObjectJobDescriptor) => {
      for (const [, job] of jobs) {
        if (job.jobs !== null) {
          findNewJob(job.jobs, objectJobDescriptor);
        } else if (job.job_id === objectJobDescriptor.job_id) {
          objectJobDescriptor.job_link = job;
          job.npc_id = objectJobDescriptor.serverObject.id;

          return logger.info("Update job:", this.name(), job.npc_id);
        }
      }
    };

    const alifeSimulator: AlifeSimulator = alife();

    for (const [id] of this.arrivingObjects) {
      const serverObject: Optional<ServerCreatureObject> = alifeSimulator.object(id);

      if (serverObject !== null) {
        this.arrivingObjects.set(id, serverObject);
      } else {
        this.arrivingObjects.delete(id);
      }
    }

    for (const [objectId, jobDescriptor] of this.objectJobDescriptors) {
      const serverObject: Optional<ServerCreatureObject> = alifeSimulator.object(objectId);

      if (serverObject === null) {
        logger.info("Discard job for object:", this.name(), objectId);
        this.objectJobDescriptors.delete(objectId);
      } else {
        logger.info("Re-init job for object:", this.name(), objectId);

        const newJobDescriptor: IObjectJobDescriptor = this.createObjectSmartJobDescriptor(serverObject);

        newJobDescriptor.job_prior = jobDescriptor.job_prior;
        newJobDescriptor.job_id = jobDescriptor.job_id;
        newJobDescriptor.begin_job = jobDescriptor.begin_job;
        newJobDescriptor.need_job = jobDescriptor.need_job;

        findNewJob(this.jobs, newJobDescriptor);

        this.objectJobDescriptors.set(objectId, newJobDescriptor);

        if (newJobDescriptor.job_link !== null) {
          this.objectByJobSection.set(this.jobsData.get(newJobDescriptor.job_link.job_id).section, objectId);
        }
      }
    }
  }

  /**
   * todo: Description.
   */
  public getMapDisplayHint(): TLabel {
    if (gameConfig.DEBUG.IS_SIMULATION_DEBUG_ENABLED) {
      let caption: TLabel = string.format(
        "%s (%s) \\nonline = %s\\nsimulation_type = %s\\nsquad_id = %s\\ncapacity = %s\\%s\\n",
        game.translate_string(this.getNameCaption()),
        this.name(),
        this.online,
        this.simulationRole,
        this.squadId,
        this.maxPopulation,
        SimulationBoardManager.getInstance().getSmartTerrainPopulation(this)
      );

      if (this.isRespawnPoint !== null && this.alreadySpawned !== null) {
        caption = caption + "\\nalready_spawned:\\n";

        for (const [section, descriptor] of this.alreadySpawned) {
          caption += string.format(
            "[%s] = %s\\%s\\n",
            section,
            descriptor.num,
            pickSectionFromCondList(registry.actor, null, this.respawnConfiguration.get(section).num)
          );
        }

        if (this.lastRespawnUpdatedAt) {
          caption += string.format(
            "\ntime_to_spawn: %.2f\n\n",
            logicsConfig.SMART_TERRAIN.RESPAWN_IDLE - game.get_game_time().diffSec(this.lastRespawnUpdatedAt)
          );
        }
      } else {
        caption = caption + "\\nnot respawn point\\n";
      }

      for (const [id, squad] of SimulationBoardManager.getInstance().getSmartTerrainDescriptorById(this.id)!
        .assignedSquads) {
        caption += tostring(squad.name()) + "\\n";
      }

      caption += "\\n\\n" + toJSON(this.simulationProperties);

      return caption;
    } else {
      return this.getNameCaption();
    }
  }

  /**
   * todo: Description.
   */
  public updateMapDisplay(): void {
    /**
     * If debug enabled, render map spots.
     */
    if (gameConfig.DEBUG.IS_SIMULATION_DEBUG_ENABLED) {
      let spot: TRelation = relations.neutral;

      if (
        this.isSimulationAvailableConditionList === null ||
        pickSectionFromCondList(registry.actor, this, this.isSimulationAvailableConditionList) === TRUE
      ) {
        spot = relations.friend;
      } else {
        spot = relations.enemy;
      }

      const previousSelector: TName = string.format(
        "alife_presentation_smart_%s_%s",
        tostring(this.simulationRole),
        tostring(this.smartTerrainDisplayedMapSpot)
      );

      if (this.smartTerrainDisplayedMapSpot === spot) {
        level.map_change_spot_hint(this.id, previousSelector, this.getMapDisplayHint());

        return;
      }

      // If previous mark is defined.
      if (this.smartTerrainDisplayedMapSpot !== null) {
        level.map_remove_object_spot(this.id, previousSelector);
      }

      // If next mark is defined.
      if (spot !== null) {
        const nextSelector: TName = string.format(
          "alife_presentation_smart_%s_%s",
          tostring(this.simulationRole),
          tostring(spot)
        );

        level.map_add_object_spot(this.id, nextSelector, this.getMapDisplayHint());
      }

      this.smartTerrainDisplayedMapSpot = spot;

      return;
    }

    /**
     * If not enabled rendering, just remove map spot if needed.
     */
    if (
      this.smartTerrainDisplayedMapSpot !== null &&
      level.map_has_object_spot(
        this.id,
        "alife_presentation_smart_" + this.simulationRole + "_" + this.smartTerrainDisplayedMapSpot
      )
    ) {
      level.map_remove_object_spot(
        this.id,
        "alife_presentation_smart_" + this.simulationRole + "_" + this.smartTerrainDisplayedMapSpot
      );
      this.smartTerrainDisplayedMapSpot = null;
    }
  }

  /**
   * todo: Description.
   */
  public hide(): void {
    if (this.smartTerrainDisplayedMapSpot === null) {
      return;
    }

    level.map_remove_object_spot(
      this.id,
      "alife_presentation_smart_" + this.simulationRole + "_" + this.smartTerrainDisplayedMapSpot
    );
  }

  /**
   * Trigger smart terrain alarm.
   */
  public startAlarm(): void {
    this.alarmStartedAt = game.get_game_time();
  }

  /**
   * todo: Description.
   */
  public updateAlarmStatus(): void {
    if (this.alarmStartedAt === null) {
      return;
    }

    if (game.get_game_time().diffSec(this.alarmStartedAt) > logicsConfig.SMART_TERRAIN.ALARM_SMART_TERRAIN_GENERIC) {
      this.alarmStartedAt = null;
    }
  }

  /**
   * todo: Description.
   */
  public applyRespawnSection(respawnSection: TSection): void {
    this.isRespawnPoint = true;
    this.respawnConfiguration = new LuaTable();
    this.alreadySpawned = new LuaTable();

    if (!this.ini.section_exist(respawnSection)) {
      abort("Wrong smart_terrain respawn_params section [%s] (there is no section).", respawnSection);
    }

    const parametersCount: TCount = this.ini.line_count(respawnSection);

    if (parametersCount === 0) {
      abort("Wrong smatr_terrain respawn_params section [%s](empty params)", respawnSection);
    }

    for (const it of $range(0, parametersCount - 1)) {
      const [, sectionName] = this.ini.r_line(respawnSection, it, "", "");

      if (!this.ini.section_exist(sectionName)) {
        abort(
          "Wrong smart_terrain respawn_params section [%s] prop [%s](there is no section).",
          respawnSection,
          sectionName
        );
      }

      const squadsCount: Optional<string> = readIniString(this.ini, sectionName, "spawn_num", false, "", null);
      const squadsToSpawn: Optional<string> = readIniString(this.ini, sectionName, "spawn_squads", false, "", null);

      if (squadsToSpawn === null) {
        abort(
          "Wrong smart_terrain respawn_params section [%s] prop [%s] line [spawn_squads](there is no line)",
          respawnSection,
          sectionName
        );
      } else if (squadsCount === null) {
        abort(
          "Wrong smart_terrain respawn_params section [%s] prop [%s] line [spawn_num](there is no line)",
          respawnSection,
          sectionName
        );
      }

      this.alreadySpawned.set(sectionName, { num: 0 });
      this.respawnConfiguration.set(sectionName, {
        num: parseConditionsList(squadsCount),
        squads: parseStringsList(squadsToSpawn),
      });
    }
  }

  /**
   * todo: Description.
   */
  public respawnSquad(): void {
    logger.info("Respawn squad in smart:", this.name());

    const availableSections: LuaArray<TSection> = new LuaTable();

    // Pick section that can be used for spawn and have available spots.
    for (const [section, descriptor] of this.respawnConfiguration) {
      if (
        tonumber(pickSectionFromCondList(registry.actor, null, descriptor.num))! > this.alreadySpawned.get(section).num
      ) {
        table.insert(availableSections, section);
      }
    }

    if (availableSections.length() > 0) {
      const sectionToSpawn: TSection = availableSections.get(math.random(1, availableSections.length()));
      const sectionParams = this.respawnConfiguration.get(sectionToSpawn);
      const squadId: TStringId = sectionParams.squads.get(math.random(1, sectionParams.squads.length()));
      const squad: Squad = this.simulationBoardManager.createSmartSquad(this, squadId);

      squad.respawnPointId = this.id;
      squad.respawnPointSection = sectionToSpawn;

      this.simulationBoardManager.enterSmartTerrain(squad, this.id);

      for (const squadMember of squad.squad_members()) {
        this.simulationBoardManager.setupObjectSquadAndGroup(squadMember.object);
      }

      this.alreadySpawned.get(sectionToSpawn).num += 1;
    }
  }

  /**
   * todo: Description.
   */
  public tryRespawnSquad(): void {
    const currentTime: Time = game.get_game_time();

    if (
      this.lastRespawnUpdatedAt === null ||
      currentTime.diffSec(this.lastRespawnUpdatedAt) > logicsConfig.SMART_TERRAIN.RESPAWN_IDLE
    ) {
      this.lastRespawnUpdatedAt = currentTime;

      if (pickSectionFromCondList(registry.actor, this, this.isSimulationAvailableConditionList) !== TRUE) {
        return;
      }

      const squadsCount: TCount = this.simulationBoardManager.getSmartTerrainActiveSquads(this.id);

      if (this.maxPopulation <= squadsCount) {
        return;
      }

      if (
        alife().actor().position.distance_to_sqr(this.position) <
        logicsConfig.SMART_TERRAIN.RESPAWN_RADIUS_RESTRICTION_SQR
      ) {
        return;
      }

      this.respawnSquad();
    }
  }

  /**
   * todo;
   */
  public turnOnCampfires(): void {
    logger.info("Turn on campfires for:", this.name());

    const smartTerrainCampfires: Optional<LuaTable<TNumberId, ZoneCampfire>> = registry.smartTerrainsCampfires.get(
      this.name()
    );

    if (smartTerrainCampfires !== null && !isEmpty(smartTerrainCampfires)) {
      for (const [id, campfire] of smartTerrainCampfires) {
        if (!campfire.is_on()) {
          campfire.turn_on();
        }
      }
    }

    this.areCampfiresOn = true;
  }

  /**
   * todo;
   */
  public turnOffCampfires(): void {
    logger.info("Turn off campfires for:", this.name());

    const smartTerrainCampfires: Optional<LuaTable<TNumberId, ZoneCampfire>> = registry.smartTerrainsCampfires.get(
      this.name()
    );

    if (smartTerrainCampfires !== null && !isEmpty(smartTerrainCampfires)) {
      for (const [id, campfire] of smartTerrainCampfires) {
        if (campfire.is_on()) {
          campfire.turn_off();
        }
      }
    }

    this.areCampfiresOn = false;
  }

  /**
   * When object arrived.
   */
  public onObjectArrived(object: ServerCreatureObject): boolean {
    const state: Optional<IRegistryObjectState> = registry.objects.get(object.id);

    let objectGameVertex: GameGraphVertex;
    let objectPosition: Vector;

    if (state === null) {
      objectGameVertex = game_graph().vertex(object.m_game_vertex_id);
      objectPosition = object.position;
    } else {
      const it = registry.objects.get(object.id).object!;

      objectGameVertex = game_graph().vertex(it.game_vertex_id());
      objectPosition = it.position();
    }

    const smartTerrainGameVertex: GameGraphVertex = game_graph().vertex(this.m_game_vertex_id);

    if (object.group_id !== null) {
      const squad = this.simulationBoardManager.getSquads().get(object.group_id);

      if (squad !== null && squad.currentAction) {
        if (squad.currentAction.name === SquadReachTargetAction.ACTION_NAME) {
          const squadTarget: Optional<TSimulationObject> = registry.simulationObjects.get(squad.assignedTargetId!);

          if (squadTarget !== null) {
            return squadTarget.isReachedBySquad(squad);
          } else {
            return alife().object<SmartTerrain>(squad.assignedTargetId!)!.isReachedBySquad(squad);
          }
        } else if (squad.currentAction.name === SquadStayOnTargetAction.ACTION_NAME) {
          return true;
        }
      }
    }

    if (objectGameVertex.level_id() === smartTerrainGameVertex.level_id()) {
      return objectPosition.distance_to_sqr(this.position) <= 10000;
    } else {
      return false;
    }
  }

  /**
   * todo: Description.
   */
  public isSimulationAvailable(): boolean {
    if (pickSectionFromCondList(registry.actor, this, this.isSimulationAvailableConditionList) !== TRUE) {
      return false;
    }

    return !(
      this.smartTerrainActorControl !== null && this.smartTerrainActorControl.status !== ESmartTerrainStatus.NORMAL
    );
  }

  /**
   * @param squad - squad checking availability of current smart terrain
   * @param isPopulationDecreaseNeeded - whether population decrease should be estimated with check
   * @return whether current smart terrain is valid simulation target for provided squad
   */
  public isValidSquadTarget(squad: Squad, isPopulationDecreaseNeeded?: boolean): boolean {
    if (this.isRespawnOnlySmart) {
      return false;
    }

    let squadsCount: TCount = this.simulationBoardManager.getSmartTerrainActiveSquads(this.id);

    if (isPopulationDecreaseNeeded) {
      squadsCount -= 1;
    }

    // Cannot select smart as target due to max population constraints.
    if (squadsCount !== null && squadsCount >= this.maxPopulation) {
      return false;
    }

    const squadParameters: ISimulationActivityDescriptor = simulationActivities.get(squad.faction);

    if (squadParameters === null || squadParameters.smart === null) {
      return false;
    }

    if ((tonumber(this.simulationProperties[ESimulationTerrainRole.RESOURCE]) as number) > 0) {
      const simulationProperties: Optional<ISimulationActivityPrecondition> = squadParameters.smart
        .resource as Optional<ISimulationActivityPrecondition>;

      if (simulationProperties?.canSelect(squad, this)) {
        return true;
      }
    }

    if ((tonumber(this.simulationProperties[ESimulationTerrainRole.BASE]) as number) > 0) {
      if (squadParameters.smart.base?.canSelect(squad, this)) {
        return true;
      }
    }

    if (tonumber(this.simulationProperties[ESimulationTerrainRole.LAIR])! > 0) {
      if (squadParameters.smart.lair?.canSelect(squad, this)) {
        return true;
      }
    }

    if (tonumber(this.simulationProperties[ESimulationTerrainRole.TERRITORY])! > 0) {
      if (squadParameters.smart.territory?.canSelect(squad, this)) {
        return true;
      }
    }

    if (tonumber(this.simulationProperties[ESimulationTerrainRole.SURGE])! > 0) {
      if (squadParameters.smart.surge?.canSelect(squad, this)) {
        return true;
      }
    }

    return false;
  }

  /**
   * todo: Description.
   */
  public getGameLocation(): LuaMultiReturn<[Vector, TNumberId, TNumberId]> {
    return $multi(this.position, this.m_level_vertex_id, this.m_game_vertex_id);
  }

  /**
   * todo: Description.
   */
  public isReachedBySquad(squad: Squad): boolean {
    const [squadPosition, squadLevelVertexId, squadGameVertexId] = squad.getGameLocation();
    const [targetPosition, targetLevelVertexId, targetVertexId] = this.getGameLocation();

    if (game_graph().vertex(squadGameVertexId).level_id() !== game_graph().vertex(targetVertexId).level_id()) {
      return false;
    }

    if (isMonster(alife().object(squad.commander_id())!) && squad.getScriptTarget() === null) {
      return squadPosition.distance_to_sqr(targetPosition) <= logicsConfig.SMART_TERRAIN.DEFAULT_ARRIVAL_DISTANCE;
    }

    return (
      squad.isAlwaysArrived ||
      squadPosition.distance_to_sqr(targetPosition) <= this.arrivalDistance * this.arrivalDistance
    );
  }

  /**
   * todo: Description.
   */
  public onEndedBeingReachedBySquad(squad: Squad): void {
    for (const squadMember of squad.squad_members()) {
      squad.simulationBoardManager.setupObjectSquadAndGroup(squadMember.object);
    }

    squad.currentTargetId = this.id;
  }

  /**
   * todo: Description.
   */
  public onStartedBeingReachedBySquad(squad: Squad): void {
    squad.setLocationTypes(this.name());
    this.simulationBoardManager.assignSquadToSmartTerrain(squad, this.id);

    for (const it of squad.squad_members()) {
      softResetOfflineObject(it.id);
    }
  }

  /**
   * todo: Description.
   */
  public getAlifeSmartTerrainTask(): CALifeSmartTerrainTask {
    return this.smartTerrainAlifeTask;
  }
}
