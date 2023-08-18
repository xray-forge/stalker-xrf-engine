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
import { MapDisplayManager } from "@/engine/core/managers/interface";
import { SmartCover } from "@/engine/core/objects";
import { SmartTerrainControl } from "@/engine/core/objects/server/smart_terrain/SmartTerrainControl";
import { ESmartTerrainStatus } from "@/engine/core/objects/server/smart_terrain/types";
import { SquadReachTargetAction, SquadStayOnTargetAction } from "@/engine/core/objects/server/squad/action";
import { simulationActivities } from "@/engine/core/objects/server/squad/simulation_activities";
import { Squad } from "@/engine/core/objects/server/squad/Squad";
import {
  ESimulationTerrainRole,
  ISimulationActivityDescriptor,
  ISimulationActivityPrecondition,
  ISimulationTarget,
  TSimulationObject,
  VALID_SMART_TERRAINS_SIMULATION_ROLES,
} from "@/engine/core/objects/server/types";
import { abort, assert, assertDefined } from "@/engine/core/utils/assertion";
import { readTimeFromPacket, writeTimeToPacket } from "@/engine/core/utils/game/game_time";
import {
  getSchemeFromSection,
  IConfigSwitchCondition,
  parseConditionsList,
  parseStringsList,
  pickSectionFromCondList,
  readIniBoolean,
  readIniNumber,
  readIniString,
  TConditionList,
} from "@/engine/core/utils/ini";
import {
  areOnlyMonstersOnJobs,
  createObjectJobDescriptor,
  createSmartTerrainJobs,
  EJobPathType,
  IObjectJobDescriptor,
  ISmartTerrainJobDescriptor,
  selectSmartTerrainJob,
} from "@/engine/core/utils/job";
import { LuaLogger } from "@/engine/core/utils/logging";
import { areObjectsOnSameLevel, isMonster, isStalker } from "@/engine/core/utils/object";
import { ERelation } from "@/engine/core/utils/relation";
import {
  activateSchemeBySection,
  configureObjectSchemes,
  getSectionToActivate,
  initializeObjectSchemeLogic,
  switchObjectSchemeToSection,
} from "@/engine/core/utils/scheme";
import {
  turnOffSmartTerrainCampfires,
  turnOnSmartTerrainCampfires,
  updateSmartTerrainAlarmStatus,
} from "@/engine/core/utils/smart_terrain";
import { getTableSize } from "@/engine/core/utils/table";
import { toJSON } from "@/engine/core/utils/transform/json";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { TCaption } from "@/engine/lib/constants/captions/captions";
import { MAX_U8 } from "@/engine/lib/constants/memory";
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
  TLabel,
  TName,
  TNumberId,
  TSection,
  TStringId,
  TTimestamp,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 * todo: Ignore jobs not on current level?
 */
@LuabindClass()
export class SmartTerrain extends cse_alife_smart_zone implements ISimulationTarget {
  public ini!: IniFile;
  public jobsConfig!: IniFile;
  public jobsConfigName!: TName;

  public squadId: TNumberId = 0; // Squads identifier spawned by specific smart terrain.
  public level: TName = "";

  public simulationRole: ESimulationTerrainRole = ESimulationTerrainRole.DEFAULT;
  public smartTerrainDisplayedMapSpot: Optional<ERelation> = null;
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

  // Already working on smart descriptors.
  public objectJobDescriptors: LuaTable<TNumberId, IObjectJobDescriptor> = new LuaTable();
  // Stalkers that are entering smart, but still not in correct vertex
  public arrivingObjects: LuaTable<TNumberId, ServerCreatureObject> = new LuaTable();

  public objectByJobSection: LuaTable<TSection, TNumberId> = new LuaTable();
  public objectsToRegister: LuaArray<ServerCreatureObject> = new LuaTable();

  public smartTerrainAlifeTask!: ALifeSmartTerrainTask;

  /**
   * Tree-like representation of available smart terrain jobs.
   */
  public jobs: LuaArray<ISmartTerrainJobDescriptor> = new LuaTable();
  /**
   * Flat representation of available smart terrain jobs.
   */
  public jobDeadTimeById: LuaTable<TNumberId, Time> = new LuaTable(); // job id -> time

  public simulationProperties!: AnyObject;
  public simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();
  public mapDisplayManager: MapDisplayManager = MapDisplayManager.getInstance();

  public respawnConfiguration: LuaTable<TSection, { squads: LuaArray<TSection>; num: TConditionList }> = new LuaTable();
  public alreadySpawned: LuaTable<TSection, { num: TCount }> = new LuaTable();

  public override on_before_register(): void {
    super.on_before_register();

    // Register smart in simulation as first priority, other objects may require it for registering.
    this.simulationBoardManager.registerSmartTerrain(this);
    this.level = alife().level_name(game_graph().vertex(this.m_game_vertex_id).level_id());
  }

  public override on_register(): void {
    super.on_register();

    registerObjectStoryLinks(this);
    registerSimulationObject(this);

    if (gameConfig.DEBUG.IS_SIMULATION_DEBUG_ENABLED) {
      this.mapDisplayManager.updateSmartTerrainMapSpot(this);
    }

    this.smartTerrainAlifeTask = new CALifeSmartTerrainTask(this.m_game_vertex_id, this.m_level_vertex_id);
    this.isRegistered = true;

    this.initializeJobs();

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
    this.isRegistered = false;
  }

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

    if (this.isObjectArrived(object)) {
      this.objectJobDescriptors.set(object.id, createObjectJobDescriptor(object));
      this.jobDeadTimeById = new LuaTable();
      this.selectObjectJob(this.objectJobDescriptors.get(object.id));
    } else {
      this.arrivingObjects.set(object.id, object);
    }
  }

  public override unregister_npc(object: ServerCreatureObject): void {
    // logger.info("Unregister object:", this.name(), object.name(), this.population);

    this.population -= 1;

    if (this.objectJobDescriptors.get(object.id) !== null) {
      this.objectJobDescriptors.get(object.id).job!.objectId = null;
      this.objectJobDescriptors.delete(object.id);

      object.clear_smart_terrain();

      if (registry.objects.get(object.id) !== null) {
        const registryState: IRegistryObjectState = registry.objects.get(object.id);

        initializeObjectSchemeLogic(
          registryState.object,
          registryState,
          false,
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

  public override task(object: ServerCreatureObject): Optional<CALifeSmartTerrainTask> {
    logger.info("Task:", this.name(), object.name());

    if (this.arrivingObjects.get(object.id) !== null) {
      return this.smartTerrainAlifeTask;
    }

    return this.objectJobDescriptors.get(object.id).job?.alifeTask as Optional<CALifeSmartTerrainTask>;
  }

  public override STATE_Write(packet: NetPacket): void {
    super.STATE_Write(packet);

    openSaveMarker(packet, SmartTerrain.__name);

    packet.w_u8(getTableSize(this.arrivingObjects));

    for (const [k, v] of this.arrivingObjects) {
      packet.w_u16(k);
    }

    packet.w_u8(getTableSize(this.objectJobDescriptors));

    for (const [id, descriptor] of this.objectJobDescriptors) {
      packet.w_u16(id);
      packet.w_u8(descriptor.jobPriority);
      packet.w_u8(descriptor.jobId);
      packet.w_bool(descriptor.isBegun);
      packet.w_stringZ(descriptor.desiredJob);
    }

    packet.w_u8(getTableSize(this.jobDeadTimeById));

    for (const [id, time] of this.jobDeadTimeById) {
      packet.w_u8(id);
      writeTimeToPacket(packet, time);
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
      abort("Smart terrain '%s' population can't be less than zero.", this.name());
    }

    packet.w_u8(this.population);

    closeSaveMarker(packet, SmartTerrain.__name);
  }

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

      jobDescriptor.jobPriority = packet.r_u8();

      if (jobDescriptor.jobPriority === MAX_U8) {
        jobDescriptor.jobPriority = -1;
      }

      jobDescriptor.jobId = packet.r_u8();

      if (jobDescriptor.jobId === MAX_U8) {
        jobDescriptor.jobId = -1;
      }

      jobDescriptor.isBegun = packet.r_bool();
      jobDescriptor.desiredJob = packet.r_stringZ();
    }

    count = packet.r_u8();
    this.jobDeadTimeById = new LuaTable();

    for (const it of $range(1, count)) {
      const jobId = packet.r_u8();
      const deadTime = readTimeFromPacket(packet)!;

      this.jobDeadTimeById.set(jobId, deadTime);
    }

    this.isObjectsInitializationNeeded = true;

    if (packet.r_bool() === true) {
      this.smartTerrainActorControl?.load(packet);
    }

    const isRespawnPoint: boolean = packet.r_bool();

    if (isRespawnPoint) {
      count = packet.r_u8();
      for (const it of $range(1, count)) {
        const section: TSection = packet.r_stringZ();
        const num: TCount = packet.r_u8();

        this.alreadySpawned.set(section, { num });
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

  public override update(): void {
    super.update();

    if (this.smartTerrainDisplayedMapSpot !== null || gameConfig.DEBUG.IS_SIMULATION_DEBUG_ENABLED) {
      this.mapDisplayManager.updateSmartTerrainMapSpot(this);
    }

    const now: TTimestamp = time_global();

    // todo: use sqr distance
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
      turnOffSmartTerrainCampfires(this);
    } else if (!this.areCampfiresOn && !areOnlyMonstersOnJobs(this.objectJobDescriptors)) {
      turnOnSmartTerrainCampfires(this);
    }

    if (registry.actor === null) {
      this.nextCheckAt = now + 10;
    } else {
      const distance: TDistance = registry.actor.position().distance_to_sqr(this.position);
      const idleTime: TDuration = math.max(60, 0.003 * distance);

      this.nextCheckAt = now + idleTime;
    }

    const currentGameTime: Time = game.get_game_time();

    for (const [id, time] of this.jobDeadTimeById) {
      if (currentGameTime.diffSec(time) >= logicsConfig.SMART_TERRAIN.DEATH_IDLE_TIME) {
        this.jobDeadTimeById.delete(id);
      }
    }

    updateSmartTerrainAlarmStatus(this);
    this.updateJobs();

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

    assert(this.ini.section_exist(SMART_TERRAIN_SECTION), "Smart terrain '%s' no configuration.", this.name());

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

    // Check if role is defined in enum.
    if (VALID_SMART_TERRAINS_SIMULATION_ROLES.get(this.simulationRole) === null) {
      abort("Wrong simulation role value (sim_type) '%s' in smart terrain '%s'.", this.simulationRole, this.name());
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

    this.travelerActorPath = level.patrol_path_exists(this.name() + "_traveller_actor")
      ? this.name() + "_traveller_actor"
      : "";

    this.travelerSquadPath = level.patrol_path_exists(this.name() + "_traveller_squad")
      ? this.name() + "_traveller_squad"
      : "";

    if (!SMART_TERRAIN_MASKS_LTX.section_exist(this.name())) {
      // logger.warn("No terrain_mask section in smart_terrain_masks.ltx:", this.name());
    }
  }

  /**
   * Register all objects that were registered before smart terrains.
   */
  public registerDelayedObjects(): void {
    // logger.info("Registering delayed NPCs:", this.name(), this.objectsToRegister.length);

    for (const [, object] of this.objectsToRegister) {
      this.register_npc(object);
    }

    this.objectsToRegister = new LuaTable();
  }

  /**
   * todo: Description.
   */
  public onObjectDeath(object: ServerCreatureObject): void {
    logger.info("Clear dead:", this.name(), object.name());

    if (this.objectJobDescriptors.get(object.id) !== null) {
      this.jobDeadTimeById.set(this.objectJobDescriptors.get(object.id).jobId, game.get_game_time());

      this.objectJobDescriptors.get(object.id).job!.objectId = null;
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
   * todo: Move into creation handler some parts
   */
  public initializeJobs(): void {
    const [jobsList, jobsConfig, jobsConfigName] = createSmartTerrainJobs(this);

    this.jobs = jobsList;
    this.jobsConfigName = jobsConfigName;
    this.jobsConfig = jobsConfig;
  }

  /**
   * todo: Description.
   */
  public updateJobs(): void {
    for (const [id, object] of this.arrivingObjects) {
      if (this.isObjectArrived(object)) {
        this.objectJobDescriptors.set(object.id, createObjectJobDescriptor(object));
        this.jobDeadTimeById = new LuaTable();
        this.selectObjectJob(this.objectJobDescriptors.get(object.id));
        this.arrivingObjects.delete(id);
      }
    }

    table.sort(this.objectJobDescriptors, (a, b) => a.jobPriority < b.jobPriority);

    for (const [, objectJobDescriptor] of this.objectJobDescriptors) {
      this.selectObjectJob(objectJobDescriptor);
    }
  }

  /**
   * Select new job for provided object descriptor
   *
   * @param objectJobDescriptor - descriptor of active job for an object
   */
  public selectObjectJob(objectJobDescriptor: IObjectJobDescriptor): void {
    const [selectedJobId, selectedJobPriority, selectedJobLink] = selectSmartTerrainJob(
      this,
      this.jobs,
      objectJobDescriptor,
      0
    );

    assertDefined(
      selectedJobId,
      "Insufficient smart terrain jobs: %s, %s, %s",
      this.name(),
      objectJobDescriptor.object.id,
      this.simulationRole
    );

    const state: Optional<IRegistryObjectState> = registry.objects.get(objectJobDescriptor.object.id);

    // Job changed and current job exists.
    if (selectedJobId !== objectJobDescriptor.jobId && selectedJobLink !== null) {
      this.unlinkObjectJob(objectJobDescriptor);

      logger.format(
        "Select new job: %s ->  %s / %s, in '%s'",
        objectJobDescriptor.object.name(),
        selectedJobLink.id,
        selectedJobLink.section,
        this.name()
      );

      // Link new job.
      selectedJobLink.objectId = objectJobDescriptor.object.id;
      this.objectByJobSection.set(this.jobs.get(selectedJobLink.id as TNumberId).section, selectedJobLink.objectId);

      objectJobDescriptor.jobId = selectedJobLink.id as TNumberId;
      objectJobDescriptor.jobPriority = selectedJobLink.priority;
      objectJobDescriptor.isBegun = false;
      objectJobDescriptor.job = selectedJobLink;

      // Reset object active scheme.
      if (state !== null) {
        switchObjectSchemeToSection(state.object, this.jobsConfig, NIL);
      }
    }

    // Begin job execution.
    if (!objectJobDescriptor.isBegun) {
      hardResetOfflineObject(objectJobDescriptor.object.id);

      objectJobDescriptor.isBegun = true;

      // Setup logic and switch to desired section.
      if (state !== null) {
        this.setupObjectJobLogic(state.object!);
      }
    }
  }

  /**
   * todo: Description.
   */
  public setupObjectJobLogic(object: ClientObject): void {
    // logger.info("Setup logic:", this.name(), object.name());

    const objectJobDescriptor: IObjectJobDescriptor = this.objectJobDescriptors.get(object.id());
    const job: ISmartTerrainJobDescriptor = this.jobs.get(objectJobDescriptor.jobId);
    const ltx: IniFile = job.iniFile || this.jobsConfig;
    const ltxName: TName = job.iniPath || this.jobsConfigName;

    configureObjectSchemes(object, ltx, ltxName, objectJobDescriptor.schemeType, job.section, this.name());

    const section: TSection = getSectionToActivate(object, ltx, job.section);

    assertDefined(
      getSchemeFromSection(job.section),
      "[smart_terrain %s] section=%s, don't use section 'null'!",
      this.name(),
      section
    );

    activateSchemeBySection(object, ltx, section, this.name(), false);
  }

  /**
   * todo: Description.
   */
  public getJobByObjectId(objectId: TNumberId): Optional<ISmartTerrainJobDescriptor> {
    const descriptor: Optional<IObjectJobDescriptor> = this.objectJobDescriptors.get(objectId);

    return descriptor && this.jobs.get(descriptor.jobId);
  }

  /**
   * @param jobSection - section of job to get working object ID
   * @returns ID of game object working with provided section
   */
  public getObjectIdByJobSection(jobSection: TSection): TNumberId {
    return this.objectByJobSection.get(jobSection);
  }

  /**
   * todo: Description.
   */
  public unlinkObjectJob(objectInfo: IObjectJobDescriptor): void {
    if (objectInfo.job) {
      this.objectByJobSection.delete(this.jobs.get(objectInfo.job.id as TNumberId).section);
      objectInfo.job.objectId = null;
    }
  }

  /**
   * todo: Description.
   */
  public switchObjectToDesiredJob(objectId: TNumberId): void {
    logger.info("Switch to desired job:", this.name(), objectId);

    const objectInfo: IObjectJobDescriptor = this.objectJobDescriptors.get(objectId);
    const changingObjectId: Optional<TNumberId> = this.objectByJobSection.get(objectInfo.desiredJob);

    // Just replacing when no another object exists / no jobs for another object.
    if (!changingObjectId || !this.objectJobDescriptors.get(changingObjectId)) {
      this.unlinkObjectJob(objectInfo);

      objectInfo.job = null;
      objectInfo.jobId = -1;
      objectInfo.jobPriority = -1;
      this.selectObjectJob(objectInfo);
    } else {
      this.unlinkObjectJob(objectInfo);

      const selectedJobLink: ISmartTerrainJobDescriptor = this.objectJobDescriptors.get(changingObjectId).job!;

      selectedJobLink.objectId = objectInfo.object.id;

      this.objectByJobSection.set(this.jobs.get(selectedJobLink.id as TNumberId).section, selectedJobLink.objectId);

      objectInfo.jobId = selectedJobLink.id as TNumberId;
      objectInfo.jobPriority = selectedJobLink.priority;
      objectInfo.isBegun = true;
      objectInfo.job = selectedJobLink;
      objectInfo.desiredJob = NIL;

      const state: Optional<IRegistryObjectState> = registry.objects.get(objectId);

      if (state !== null) {
        this.setupObjectJobLogic(state.object!);
      }

      const changingObjectInfo: IObjectJobDescriptor = this.objectJobDescriptors.get(changingObjectId);

      changingObjectInfo.job = null;
      changingObjectInfo.jobId = -1;
      changingObjectInfo.jobPriority = -1;

      this.selectObjectJob(changingObjectInfo);
    }
  }

  /**
   * todo: Description.
   */
  public initializeObjectsAfterLoad(): void {
    logger.info("Initialize objects after load:", this.name());

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
        logger.info("Discard jobs for object:", this.name(), objectId);
        this.objectJobDescriptors.delete(objectId);
        // todo: Also free section?
      } else {
        logger.info("Re-init jobs for object:", this.name(), objectId);

        const newJobDescriptor: IObjectJobDescriptor = createObjectJobDescriptor(serverObject);

        newJobDescriptor.jobPriority = jobDescriptor.jobPriority;
        newJobDescriptor.jobId = jobDescriptor.jobId;
        newJobDescriptor.isBegun = jobDescriptor.isBegun;
        newJobDescriptor.desiredJob = jobDescriptor.desiredJob;

        for (const [, job] of this.jobs) {
          if (job.id === newJobDescriptor.jobId) {
            newJobDescriptor.job = job;
            job.objectId = newJobDescriptor.object.id;

            break;
          }
        }

        this.objectJobDescriptors.set(objectId, newJobDescriptor);

        if (newJobDescriptor.job !== null) {
          this.objectByJobSection.set(newJobDescriptor.job.section, objectId);
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
   * When object arrived.
   */
  public isObjectArrived(object: ServerCreatureObject): boolean {
    const state: Optional<IRegistryObjectState> = registry.objects.get(object.id);

    let objectGameVertex: GameGraphVertex;
    let objectPosition: Vector;

    if (state === null) {
      objectGameVertex = game_graph().vertex(object.m_game_vertex_id);
      objectPosition = object.position;
    } else {
      const it: ClientObject = registry.objects.get(object.id).object!;

      objectGameVertex = game_graph().vertex(it.game_vertex_id());
      objectPosition = it.position();
    }

    const smartTerrainGameVertex: GameGraphVertex = game_graph().vertex(this.m_game_vertex_id);

    if (object.group_id !== null) {
      const squad: Squad = this.simulationBoardManager.getSquads().get(object.group_id);

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
