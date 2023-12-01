import {
  CALifeSmartTerrainTask,
  cse_alife_smart_zone,
  game,
  getFS,
  ini_file,
  level,
  LuabindClass,
  time_global,
} from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  IRegistryObjectState,
  openLoadMarker,
  openSaveMarker,
  registerObjectStoryLinks,
  registerSimulationObject,
  registry,
  SMART_TERRAIN_MASKS_LTX,
  softResetOfflineObject,
  unregisterSimulationObject,
  unregisterStoryLinkByObjectId,
  updateSimulationObjectAvailability,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { MapDisplayManager } from "@/engine/core/managers/map";
import {
  ESimulationTerrainRole,
  ISimulationActivityDescriptor,
  ISimulationTarget,
  simulationActivities,
  SimulationBoardManager,
  TSimulationActivityPrecondition,
  VALID_SMART_TERRAINS_SIMULATION_ROLES,
} from "@/engine/core/managers/simulation";
import {
  areNoStalkersWorkingOnJobs,
  createObjectJobDescriptor,
  createSmartTerrainJobs,
  IObjectJobDescriptor,
  selectObjectJob,
  TSmartTerrainJobsList,
  unlinkObjectJob,
  updateSmartTerrainJobs,
} from "@/engine/core/objects/smart_terrain/job";
import { isObjectArrivedToSmartTerrain } from "@/engine/core/objects/smart_terrain/object";
import { ESmartTerrainStatus } from "@/engine/core/objects/smart_terrain/smart_terrain_types";
import { smartTerrainConfig } from "@/engine/core/objects/smart_terrain/SmartTerrainConfig";
import { SmartTerrainControl } from "@/engine/core/objects/smart_terrain/SmartTerrainControl";
import {
  applySmartTerrainRespawnSection,
  tryRespawnSmartTerrainSquad,
} from "@/engine/core/objects/smart_terrain/spawn/smart_terrain_spawn";
import type { Squad } from "@/engine/core/objects/squad";
import { abort, assert } from "@/engine/core/utils/assertion";
import { isMonsterSquad, isStalker } from "@/engine/core/utils/class_ids";
import {
  IConfigSwitchCondition,
  parseConditionsList,
  pickSectionFromCondList,
  readIniBoolean,
  readIniNumber,
  readIniString,
  TConditionList,
} from "@/engine/core/utils/ini";
import { ELuaLoggerMode, LuaLogger } from "@/engine/core/utils/logging";
import { areObjectsOnSameLevel } from "@/engine/core/utils/position";
import { ERelation } from "@/engine/core/utils/relation";
import { initializeObjectSchemeLogic } from "@/engine/core/utils/scheme";
import {
  turnOffSmartTerrainCampfires,
  turnOnSmartTerrainCampfires,
  updateSmartTerrainAlarmStatus,
} from "@/engine/core/utils/smart_terrain";
import { readTimeFromPacket, writeTimeToPacket } from "@/engine/core/utils/time";
import { forgeConfig } from "@/engine/lib/configs/ForgeConfig";
import { MAX_U8 } from "@/engine/lib/constants/memory";
import { roots } from "@/engine/lib/constants/roots";
import { SMART_TERRAIN_SECTION } from "@/engine/lib/constants/sections";
import { TRUE } from "@/engine/lib/constants/words";
import {
  AlifeSimulator,
  ALifeSmartTerrainTask,
  ESchemeType,
  IniFile,
  LuaArray,
  NetPacket,
  Optional,
  ServerCreatureObject,
  TCount,
  TDistance,
  TDuration,
  Time,
  TName,
  TNumberId,
  TSection,
  TTimestamp,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename, { file: "smart_terrain", mode: ELuaLoggerMode.DUAL });

/**
 * Smart terrain server representation.
 * Handles logics of alife, spawning and jobs simulation.
 */
@LuabindClass()
export class SmartTerrain extends cse_alife_smart_zone implements ISimulationTarget {
  public ini!: IniFile;
  public jobsConfig!: IniFile;
  public jobsConfigName!: TName;

  public squadId: TNumberId = 0; // Squads identifier spawned by specific smart terrain.

  public simulationRole: ESimulationTerrainRole = ESimulationTerrainRole.DEFAULT;
  public smartTerrainDisplayedMapSpot: Optional<ERelation> = null;
  public respawnSector: Optional<TConditionList> = null;
  public forbiddenPoint: string = "";

  public isOnLevel: boolean = false;
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

  public arrivalDistance: TNumberId = smartTerrainConfig.DEFAULT_ARRIVAL_DISTANCE;

  public population: TCount = 0;
  public maxPopulation: TCount = -1;

  public nextCheckAt: TTimestamp = 0;
  public lastRespawnUpdatedAt: Optional<Time> = null;

  public travelerActorPath: TName = "";
  public travelerSquadPath: TName = "";

  public defendRestrictor: Optional<string> = null;
  public attackRestrictor: Optional<TName> = null;
  // Name of restrictor where objects are considered safe.
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
  public jobs: TSmartTerrainJobsList = new LuaTable();
  /**
   * Flat representation of available smart terrain jobs.
   */
  public jobDeadTimeById: LuaTable<TNumberId, Time> = new LuaTable(); // job id -> time

  public simulationProperties!: LuaTable<TName, string>;
  public simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();
  public mapDisplayManager: MapDisplayManager = MapDisplayManager.getInstance();

  public respawnConfiguration: LuaTable<TSection, { squads: LuaArray<TSection>; num: TConditionList }> = new LuaTable();
  public alreadySpawned: LuaTable<TSection, { num: TCount }> = new LuaTable();

  public override on_before_register(): void {
    super.on_before_register();

    // Register smart in simulation as first priority, other objects may require it for registering.
    this.simulationBoardManager.registerSmartTerrain(this);
  }

  public override on_register(): void {
    super.on_register();

    this.isOnLevel = areObjectsOnSameLevel(this, registry.actorServer);
    logger.info("Register smart terrain:", this.name(), this.isOnLevel);

    registerObjectStoryLinks(this);
    registerSimulationObject(this);

    if (forgeConfig.DEBUG.IS_SIMULATION_ENABLED) {
      this.mapDisplayManager.updateSmartTerrainMapSpot(this);
    }

    this.smartTerrainAlifeTask = new CALifeSmartTerrainTask(this.m_game_vertex_id, this.m_level_vertex_id);
    this.isRegistered = true;

    logger.info("Initialize smart jobs:", this.name());

    const [jobsList, jobsConfig, jobsConfigName] = createSmartTerrainJobs(this);

    this.jobs = jobsList;
    this.jobsConfigName = jobsConfigName;
    this.jobsConfig = jobsConfig;

    this.simulationBoardManager.initializeSmartTerrainSimulation(this);

    if (this.isObjectsInitializationNeeded) {
      this.isObjectsInitializationNeeded = false;
      this.initializeObjectsAfterLoad();
    }

    this.registerDelayedObjects();
    this.nextCheckAt = time_global();

    EventsManager.emitEvent(EGameEvent.SMART_TERRAIN_REGISTER, this);
  }

  public override on_unregister(): void {
    EventsManager.emitEvent(EGameEvent.SMART_TERRAIN_UNREGISTER, this);

    unregisterStoryLinkByObjectId(this.id);
    unregisterSimulationObject(this);

    this.simulationBoardManager.unregisterSmartTerrain(this);
    this.isRegistered = false;

    super.on_unregister();
  }

  public override register_npc(object: ServerCreatureObject): void {
    logger.info("Register object in smart:", this.name(), object.name(), this.population);

    this.population += 1;

    if (!this.isRegistered) {
      logger.info("Not registered, delay:", this.name(), object.name(), this.population);

      return table.insert(this.objectsToRegister, object);
    }

    if (!isStalker(object)) {
      object.smart_terrain_task_activate();
    }

    object.m_smart_terrain_id = this.id;

    if (isObjectArrivedToSmartTerrain(object, this)) {
      logger.info("Assign to job on register:", this.name(), object.name(), this.population);

      this.objectJobDescriptors.set(object.id, createObjectJobDescriptor(object));
      this.jobDeadTimeById = new LuaTable();
      selectObjectJob(this, this.objectJobDescriptors.get(object.id));
    } else {
      logger.info("Mark as arrived:", this.name(), object.name(), this.population);
      this.arrivingObjects.set(object.id, object);
    }
  }

  public override unregister_npc(object: ServerCreatureObject): void {
    logger.info("Unregister object:", this.name(), object.name(), this.population);

    this.population -= 1;

    const objectJobDescriptor: Optional<IObjectJobDescriptor> = this.objectJobDescriptors.get(
      object.id
    ) as Optional<IObjectJobDescriptor>;

    if (objectJobDescriptor) {
      unlinkObjectJob(this, objectJobDescriptor);

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

    if (this.arrivingObjects.get(object.id) as Optional<ServerCreatureObject>) {
      return this.smartTerrainAlifeTask;
    }

    return this.objectJobDescriptors.get(object.id).job?.alifeTask as Optional<CALifeSmartTerrainTask>;
  }

  public override STATE_Write(packet: NetPacket): void {
    super.STATE_Write(packet);

    openSaveMarker(packet, SmartTerrain.__name);

    packet.w_u8(table.size(this.arrivingObjects));

    for (const [k, v] of this.arrivingObjects) {
      packet.w_u16(k);
    }

    packet.w_u8(table.size(this.objectJobDescriptors));

    for (const [id, descriptor] of this.objectJobDescriptors) {
      packet.w_u16(id);
      packet.w_u8(descriptor.jobPriority);
      packet.w_u8(descriptor.jobId);
      packet.w_bool(descriptor.isBegun);
      packet.w_stringZ(descriptor.desiredJob);
    }

    packet.w_u8(table.size(this.jobDeadTimeById));

    for (const [id, time] of this.jobDeadTimeById) {
      packet.w_u8(id);
      writeTimeToPacket(packet, time);
    }

    if (this.smartTerrainActorControl) {
      packet.w_bool(true);
      this.smartTerrainActorControl.save(packet);
    } else {
      packet.w_bool(false);
    }

    if (this.isRespawnPoint) {
      packet.w_bool(true);
      packet.w_u8(table.size(this.alreadySpawned));

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

    if (packet.r_bool()) {
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

    if (this.smartTerrainDisplayedMapSpot !== null || forgeConfig.DEBUG.IS_SIMULATION_ENABLED) {
      this.mapDisplayManager.updateSmartTerrainMapSpot(this);
    }

    const now: TTimestamp = time_global();

    // Check smart terrain which is nearest / manage visited state.
    if (areObjectsOnSameLevel(this, registry.actorServer)) {
      const distanceToActorSqr: TDistance = this.position.distance_to_sqr(registry.actorServer.position);

      if (registry.smartTerrainNearest.id === this.id) {
        registry.smartTerrainNearest.distanceSqr = distanceToActorSqr;
      } else if (distanceToActorSqr < registry.smartTerrainNearest.distanceSqr) {
        registry.smartTerrainNearest.id = this.id;
        registry.smartTerrainNearest.distanceSqr = distanceToActorSqr;

        EventsManager.emitEvent(EGameEvent.SMART_TERRAIN_NEAREST_CHANGED, this, distanceToActorSqr);
      }
    }

    tryRespawnSmartTerrainSquad(this);

    if (now < this.nextCheckAt) {
      return;
    }

    if (this.areCampfiresOn && areNoStalkersWorkingOnJobs(this.objectJobDescriptors)) {
      turnOffSmartTerrainCampfires(this);
    } else if (!this.areCampfiresOn && !areNoStalkersWorkingOnJobs(this.objectJobDescriptors)) {
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
      if (currentGameTime.diffSec(time) >= smartTerrainConfig.DEATH_IDLE_TIME) {
        this.jobDeadTimeById.delete(id);
      }
    }

    updateSmartTerrainAlarmStatus(this);
    updateSmartTerrainJobs(this);

    if (this.smartTerrainActorControl) {
      this.smartTerrainActorControl.update();
    }

    updateSimulationObjectAvailability(this);
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
   * Initialize smart terrain from ini files.
   */
  public initialize(): void {
    this.ini = this.spawn_ini();

    assert(this.ini.section_exist(SMART_TERRAIN_SECTION), "Smart terrain '%s' no configuration.", this.name());

    const filename: Optional<TName> = readIniString(this.ini, SMART_TERRAIN_SECTION, "cfg", false);

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
      null,
      ESimulationTerrainRole.DEFAULT
    ) as ESimulationTerrainRole;

    // Check if role is defined in enum.
    if (VALID_SMART_TERRAINS_SIMULATION_ROLES.get(this.simulationRole) === null) {
      abort("Wrong simulation role value (sim_type) '%s' in smart terrain '%s'.", this.simulationRole, this.name());
    }

    this.squadId = readIniNumber(this.ini, SMART_TERRAIN_SECTION, "squad_id", false, 0);

    let respawnSectorData: Optional<string> = readIniString(this.ini, SMART_TERRAIN_SECTION, "respawn_sector", false);

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

    this.forbiddenPoint = readIniString(this.ini, SMART_TERRAIN_SECTION, "forbidden_point", false);
    this.defendRestrictor = readIniString(this.ini, SMART_TERRAIN_SECTION, "def_restr", false);
    this.attackRestrictor = readIniString(this.ini, SMART_TERRAIN_SECTION, "att_restr", false);
    this.safeRestrictor = readIniString(this.ini, SMART_TERRAIN_SECTION, "safe_restr", false);
    this.spawnPointName = readIniString(this.ini, SMART_TERRAIN_SECTION, "spawn_point", false);
    this.arrivalDistance = readIniNumber(this.ini, SMART_TERRAIN_SECTION, "arrive_dist", false, 30);

    const maxPopulationData: string = readIniString(
      this.ini,
      SMART_TERRAIN_SECTION,
      "max_population",
      false,
      null,
      "0"
    );
    const parsedConditionsList: LuaArray<IConfigSwitchCondition> = parseConditionsList(maxPopulationData);

    this.maxPopulation = tonumber(pickSectionFromCondList(registry.actor, null, parsedConditionsList)) as TCount;

    this.isRespawnOnlySmart = readIniBoolean(this.ini, SMART_TERRAIN_SECTION, "respawn_only_smart", false, false);

    const respawnSection: Optional<TSection> = readIniString(this.ini, SMART_TERRAIN_SECTION, "respawn_params", false);
    const smartControlSection: Optional<TSection> = readIniString(
      this.ini,
      SMART_TERRAIN_SECTION,
      "smart_control",
      false
    );

    if (smartControlSection) {
      this.smartTerrainActorControl = new SmartTerrainControl(this, this.ini, smartControlSection);
    }

    if (respawnSection) {
      applySmartTerrainRespawnSection(this, respawnSection);
    } else {
      this.isRespawnPoint = false;
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
   * todo: Description.
   */
  public initializeObjectsAfterLoad(): void {
    logger.info("Initialize objects after load:", this.name());

    const alifeSimulator: AlifeSimulator = registry.simulator;

    for (const [id] of this.arrivingObjects) {
      const serverObject: Optional<ServerCreatureObject> = alifeSimulator.object(id);

      if (serverObject) {
        this.arrivingObjects.set(id, serverObject);
      } else {
        this.arrivingObjects.delete(id);
      }
    }

    for (const [objectId, jobDescriptor] of this.objectJobDescriptors) {
      const serverObject: Optional<ServerCreatureObject> = alifeSimulator.object(objectId);

      if (serverObject) {
        logger.info("Re-init jobs for object:", this.name(), objectId);

        const newJobDescriptor: IObjectJobDescriptor = createObjectJobDescriptor(serverObject);

        newJobDescriptor.jobPriority = jobDescriptor.jobPriority;
        newJobDescriptor.jobId = jobDescriptor.jobId;
        newJobDescriptor.isBegun = jobDescriptor.isBegun;
        newJobDescriptor.desiredJob = jobDescriptor.desiredJob;

        // todo: ID is index, probably can find without loop.
        for (const [, job] of this.jobs) {
          if (job.id === newJobDescriptor.jobId) {
            newJobDescriptor.job = job;
            job.objectId = newJobDescriptor.object.id;

            break;
          }
        }

        this.objectJobDescriptors.set(objectId, newJobDescriptor);

        if (newJobDescriptor.job) {
          this.objectByJobSection.set(newJobDescriptor.job.section, objectId);
        }
      } else {
        logger.info("Discard jobs for object:", this.name(), objectId);
        this.objectJobDescriptors.delete(objectId);
        // todo: Also free section?
      }
    }
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

    let squadsCount: TCount = this.simulationBoardManager.getSmartTerrainAssignedSquads(this.id);

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

    if ((tonumber(this.simulationProperties.get(ESimulationTerrainRole.RESOURCE)) as number) > 0) {
      const simulationProperties: Optional<TSimulationActivityPrecondition> = squadParameters.smart
        .resource as Optional<TSimulationActivityPrecondition>;

      if (simulationProperties?.(squad, this)) {
        return true;
      }
    }

    if ((tonumber(this.simulationProperties.get(ESimulationTerrainRole.BASE)) as number) > 0) {
      if (squadParameters.smart.base?.(squad, this)) {
        return true;
      }
    }

    if ((tonumber(this.simulationProperties.get(ESimulationTerrainRole.LAIR)) as number) > 0) {
      if (squadParameters.smart.lair?.(squad, this)) {
        return true;
      }
    }

    if ((tonumber(this.simulationProperties.get(ESimulationTerrainRole.TERRITORY)) as number) > 0) {
      if (squadParameters.smart.territory?.(squad, this)) {
        return true;
      }
    }

    if ((tonumber(this.simulationProperties.get(ESimulationTerrainRole.SURGE)) as number) > 0) {
      if (squadParameters.smart.surge?.(squad, this)) {
        return true;
      }
    }

    return false;
  }

  /**
   * todo: Description.
   */
  public isReachedBySquad(squad: Squad): boolean {
    if (!areObjectsOnSameLevel(squad, this)) {
      return false;
    }

    if (isMonsterSquad(squad) && squad.getLogicsScriptTarget() === null) {
      return squad.position.distance_to_sqr(this.position) <= smartTerrainConfig.DEFAULT_ARRIVAL_DISTANCE;
    }

    return (
      squad.isAlwaysArrived ||
      squad.position.distance_to_sqr(this.position) <= this.arrivalDistance * this.arrivalDistance
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
