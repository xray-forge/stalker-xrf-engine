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
  XR_alife_simulator,
  XR_CALifeSmartTerrainTask,
  XR_cse_alife_creature_abstract,
  XR_CTime,
  XR_game_object,
  XR_GameGraph__CVertex,
  XR_ini_file,
  XR_net_packet,
  XR_vector,
} from "xray16";

import {
  hardResetOfflineObject,
  IRegistryObjectState,
  loadDynamicLtx,
  registerObjectStoryLinks,
  registry,
  SMART_TERRAIN_MASKS_LTX,
  softResetOfflineObject,
  unregisterStoryLinkByObjectId,
} from "@/engine/core/database";
import {
  registerSimulationObject,
  unregisterSimulationObject,
  updateSimulationObjectAvailability,
} from "@/engine/core/database/simulation";
import { SimulationBoardManager } from "@/engine/core/managers/SimulationBoardManager";
import { loadGulagJobs } from "@/engine/core/objects/alife/gulag_general";
import { ISimulationActivityDescriptor, simulation_activities } from "@/engine/core/objects/alife/SimulationActivity";
import { ESmartTerrainStatus, SmartTerrainControl } from "@/engine/core/objects/alife/smart/SmartTerrainControl";
import { Squad } from "@/engine/core/objects/alife/Squad";
import {
  turnOffCampfiresBySmartTerrainName,
  turnOnCampfiresBySmartName,
} from "@/engine/core/objects/binders/CampfireBinder";
import { activateSchemeBySection } from "@/engine/core/schemes/base/activateSchemeBySection";
import { configureObjectSchemes } from "@/engine/core/schemes/base/configureObjectSchemes";
import { determine_section_to_activate } from "@/engine/core/schemes/determine_section_to_activate";
import { initializeGameObject } from "@/engine/core/schemes/initializeGameObject";
import { switchToSection } from "@/engine/core/schemes/switchToSection";
import { isMonster, isStalker } from "@/engine/core/utils/check/is";
import { abort } from "@/engine/core/utils/debug";
import { setLoadMarker, setSaveMarker } from "@/engine/core/utils/game_save";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import {
  getConfigBoolean,
  getConfigNumber,
  getConfigString,
  getSchemeByIniSection,
} from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { areObjectsOnSameLevel } from "@/engine/core/utils/object";
import { IConfigSwitchCondition, parseConditionsList, parseNames, TConditionList } from "@/engine/core/utils/parse";
import { readCTimeFromPacket, writeCTimeToPacket } from "@/engine/core/utils/time";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { TCaption } from "@/engine/lib/constants/captions";
import { MAX_UNSIGNED_16_BIT, MAX_UNSIGNED_8_BIT } from "@/engine/lib/constants/memory";
import { TRelation } from "@/engine/lib/constants/relations";
import { SMART_TERRAIN_SECT } from "@/engine/lib/constants/sections";
import { STRINGIFIED_NIL, STRINGIFIED_TRUE } from "@/engine/lib/constants/words";
import {
  AnyCallable,
  AnyObject,
  ESchemeType,
  LuaArray,
  Optional,
  TCount,
  TDistance,
  TDuration,
  TName,
  TNumberId,
  TPath,
  TRate,
  TSection,
  TStringId,
  TTimestamp,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

export const ALARM_TIMEOUT: TDuration = 21_600;
export const DEATH_IDLE_TIME: TDuration = 10 * 60;
export const RESPAWN_IDLE: TDuration = 1_000;

// todo: Move to db.
export const nearest_to_actor_smart = { id: null as Optional<number>, dist: math.huge };

export const path_fields: LuaArray<string> = ["path_walk", "path_main", "path_home", "center_point"] as any;

/**
 * todo;
 */
interface IObjectJobDescriptor {
  se_obj: XR_cse_alife_creature_abstract;
  is_monster: boolean;
  need_job: string;
  job_prior: number;
  job_id: number;
  job_link: Optional<{ npc_id: Optional<TNumberId>; job_id: TNumberId; _prior: TRate }>;
  begin_job: boolean;
  stype: any;
}

/**
 * todo;
 */
export interface ISmartTerrainJob {
  alife_task: XR_CALifeSmartTerrainTask;
  _prior: TRate;
  job_type: string;
  reserve_job: Optional<boolean>;
  section: TSection;
  ini_path: TPath;
  ini_file: XR_ini_file;
  prefix_name: TName;
  game_vertex_id: TNumberId;
  level_id: TNumberId;
  position: XR_vector;
}

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
export enum ESimulationSmartType {
  DEFAULT = "default",
  BASE = "base",
  resource = "resource",
  territory = "territory",
}

/**
 * todo;
 */
@LuabindClass()
export class SmartTerrain extends cse_alife_smart_zone {
  public ini!: XR_ini_file;
  public ltxConfig!: XR_ini_file;
  public ltxConfigName!: string;

  public squadId: TNumberId = 0;
  public level: TName = "";

  public simulationType: ESimulationSmartType = ESimulationSmartType.DEFAULT;
  public smrt_showed_spot: Optional<TRelation> = null;
  public respawn_sector: Optional<TConditionList> = null;
  public respawnRadius: TDistance = 150;
  public forbidden_point: string = "";

  public isRegistered: boolean = false;
  public isRespawnPoint: boolean = false;
  public isObjectsInitializationNeeded: boolean = true; // Whether after game start / load.
  public isSimulationAvailableConditionList: TConditionList = parseConditionsList(STRINGIFIED_TRUE);
  public isMutantDisabled: boolean = false;
  public isMutantLair: boolean = false;
  public isRespawnOnlySmart: boolean = false;
  public areCampfiresOn: boolean = false;

  public arrivalDistance: TNumberId = 30;

  public population: TCount = 0;
  public maxPopulation: TCount = -1;

  public nextCheckAt: TTimestamp = 0;
  public smartAlarmStartedAt: Optional<XR_CTime> = null;
  public lastRespawnUpdatedAt: Optional<XR_CTime> = null;

  public travelerActorPath: TName = "";
  public travelerSquadPath: TName = "";

  public defendRestrictor: Optional<string> = null;
  public attackRestrictor: Optional<TName> = null;
  public safeRestrictor: Optional<TName> = null;
  public spawnPointName: Optional<TName> = null;

  public smartTerrainActorControl!: SmartTerrainControl;

  /**
   * Already working on smart descriptors.
   */
  public objectJobDescriptors: LuaTable<TNumberId, IObjectJobDescriptor> = new LuaTable();
  /**
   * Starting working on smart descriptors objects.
   */
  public arrivingObjects: LuaTable<TNumberId, XR_cse_alife_creature_abstract> = new LuaTable();

  public objectByJobSection: LuaTable<TSection, TNumberId> = new LuaTable();
  public objectsToRegister: LuaTable<number, XR_cse_alife_creature_abstract> = new LuaTable();

  public smartTerrainAlifeTask!: XR_CALifeSmartTerrainTask;

  public jobs: any;
  public jobsData: LuaArray<ISmartTerrainJob> = new LuaTable();
  public jobDeadTimeById: LuaTable<TNumberId, XR_CTime> = new LuaTable(); // job id -> time

  public props!: AnyObject;
  public simulationBoardManager!: SimulationBoardManager;

  public respawnConfiguration!: LuaTable<TSection, { squads: LuaArray<TSection>; num: TConditionList }>;
  public alreadySpawned!: LuaTable<TSection, { num: TCount }>;

  /**
   * todo: Description.
   */
  public override on_before_register(): void {
    super.on_before_register();

    this.simulationBoardManager = SimulationBoardManager.getInstance();
    this.simulationBoardManager.registerSmartTerrain(this);
    this.level = alife().level_name(game_graph().vertex(this.m_game_vertex_id).level_id());
  }

  /**
   * todo: Description.
   */
  public override on_register(): void {
    super.on_register();

    logger.info("Register:", this.id, this.name(), this.section_name());

    registerObjectStoryLinks(this);
    registerSimulationObject(this);

    if (gameConfig.DEBUG.IS_SMARTS_DEBUG_ENABLED) {
      this.refresh();
    }

    this.smartTerrainAlifeTask = new CALifeSmartTerrainTask(this.m_game_vertex_id, this.m_level_vertex_id);
    this.isRegistered = true;

    this.load_jobs();

    this.simulationBoardManager.initializeSmartTerrain(this);

    if (this.isObjectsInitializationNeeded === true) {
      this.isObjectsInitializationNeeded = false;
      this.init_npc_after_load();
    }

    this.register_delayed_npc();
    this.nextCheckAt = time_global();
  }

  /**
   * todo: Description.
   */
  public override on_unregister(): void {
    super.on_unregister();

    unregisterStoryLinkByObjectId(this.id);
    unregisterSimulationObject(this);

    this.simulationBoardManager.unregisterSmartTerrain(this);
  }

  /**
   * Get smart terrain name label.
   * Used for UI display or mentioning in strings.
   */
  public getNameCaption(): TCaption {
    return string.format("st_%s_name", this.name());
  }

  /**
   * todo: Description.
   */
  public read_params(): void {
    this.ini = this.spawn_ini();

    if (!this.ini.section_exist(SMART_TERRAIN_SECT)) {
      abort("[smart_terrain %s] no configuration!", this.name());
    }

    const filename: string = getConfigString(this.ini, SMART_TERRAIN_SECT, "cfg", this, false, "");
    const fs = getFS();

    if (filename !== null) {
      if (fs.exist("$game_config$", filename)) {
        this.ini = new ini_file(filename);
      } else {
        abort("There is no configuration file [%s] in smart_terrain [%s]", filename, this.name());
      }
    }

    const ini: XR_ini_file = this.ini;

    this.simulationType = getConfigString(
      ini,
      SMART_TERRAIN_SECT,
      "sim_type",
      this,
      false,
      "",
      ESimulationSmartType.DEFAULT
    ) as ESimulationSmartType;

    if (valid_territory.get(this.simulationType) === null) {
      abort("Wrong sim_type value [%s] in smart [%s]", this.simulationType, this.name());
    }

    this.squadId = getConfigNumber(ini, SMART_TERRAIN_SECT, "squad_id", this, false, 0);
    this.respawnRadius = getConfigNumber(ini, SMART_TERRAIN_SECT, "respawn_radius", this, false, this.respawnRadius);

    let respawnSectorData: Optional<string> = getConfigString(
      ini,
      SMART_TERRAIN_SECT,
      "respawn_sector",
      this,
      false,
      ""
    );

    if (respawnSectorData !== null) {
      if (respawnSectorData === "default") {
        respawnSectorData = "all";
      }

      this.respawn_sector = parseConditionsList(respawnSectorData);
    } else {
      this.respawn_sector = null;
    }

    this.isMutantLair = getConfigBoolean(ini, SMART_TERRAIN_SECT, "mutant_lair", this, false);
    this.isMutantDisabled = getConfigBoolean(ini, SMART_TERRAIN_SECT, "no_mutant", this, false);

    if (this.isMutantDisabled) {
      logger.info("Found no mutant point:", this.name());
    }

    this.forbidden_point = getConfigString(ini, SMART_TERRAIN_SECT, "forbidden_point", this, false, "");
    this.defendRestrictor = getConfigString(ini, SMART_TERRAIN_SECT, "def_restr", this, false, "", null);
    this.attackRestrictor = getConfigString(ini, SMART_TERRAIN_SECT, "att_restr", this, false, "", null);
    this.safeRestrictor = getConfigString(ini, SMART_TERRAIN_SECT, "safe_restr", this, false, "", null);
    this.spawnPointName = getConfigString(ini, SMART_TERRAIN_SECT, "spawn_point", this, false, "");
    this.arrivalDistance = getConfigNumber(ini, SMART_TERRAIN_SECT, "arrive_dist", this, false, 30);

    const maxPopulationData: string = getConfigString(ini, SMART_TERRAIN_SECT, "max_population", this, false, "", "0");
    const parsedConditionsList: LuaArray<IConfigSwitchCondition> = parseConditionsList(maxPopulationData);

    this.maxPopulation = tonumber(pickSectionFromCondList(registry.actor, null, parsedConditionsList)) as TCount;

    this.isRespawnOnlySmart = getConfigBoolean(ini, SMART_TERRAIN_SECT, "respawn_only_smart", this, false, false);

    const respawnSection: Optional<TSection> = getConfigString(
      ini,
      SMART_TERRAIN_SECT,
      "respawn_params",
      this,
      false,
      "",
      null
    );
    const smartControlSection: Optional<TSection> = getConfigString(
      ini,
      SMART_TERRAIN_SECT,
      "smart_control",
      this,
      false,
      "",
      null
    );

    if (smartControlSection !== null) {
      this.smartTerrainActorControl = new SmartTerrainControl(this, ini, smartControlSection);
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
      // logger.warn("No traveller_squad path:", this.name());
      this.travelerSquadPath = this.name() + "_traveller_squad";
    }

    if (!SMART_TERRAIN_MASKS_LTX.section_exist(this.name())) {
      logger.warn("No terrain_mask section in smart_terrain_masks.ltx:", this.name());
    }
  }

  /**
   * todo: Description.
   */
  public createObjectSmartJobDescriptor(object: XR_cse_alife_creature_abstract): IObjectJobDescriptor {
    logger.info("Create object job descriptor:", object.name());

    const isObjectStalker: boolean = isStalker(object);

    return {
      se_obj: object,
      is_monster: !isObjectStalker,
      need_job: STRINGIFIED_NIL,
      job_prior: -1,
      job_link: null,
      job_id: -1,
      begin_job: false,
      stype: isObjectStalker ? ESchemeType.STALKER : ESchemeType.MONSTER,
    };
  }

  public refresh_script_logic(objectId: TNumberId): void {
    const object = alife().object(objectId)!;
    let schemeType: ESchemeType = ESchemeType.MONSTER;

    if (isStalker(object)) {
      schemeType = ESchemeType.STALKER;
    }

    initializeGameObject(
      registry.objects.get(object.id).object!,
      registry.objects.get(object.id),
      false,
      registry.actor,
      schemeType
    );
  }

  /**
   * todo: Description.
   */
  public override register_npc(object: XR_cse_alife_creature_abstract): void {
    logger.info("Register object in smart:", this.name(), object.name());

    this.population = this.population + 1;

    if (!this.isRegistered) {
      return table.insert(this.objectsToRegister, object);
    }

    if (!isStalker(object)) {
      object.smart_terrain_task_activate();
    }

    object.m_smart_terrain_id = this.id;

    if (onObjectArrivedToSmart(object, this)) {
      this.objectJobDescriptors.set(object.id, this.createObjectSmartJobDescriptor(object));
      this.jobDeadTimeById = new LuaTable();
      this.select_npc_job(this.objectJobDescriptors.get(object.id));
    } else {
      this.arrivingObjects.set(object.id, object);
    }
  }

  /**
   * todo: Description.
   */
  public register_delayed_npc(): void {
    logger.info("Registering delayed NPCs:", this.name(), this.objectsToRegister.length);

    for (const [k, v] of this.objectsToRegister) {
      this.register_npc(v);
    }

    this.objectsToRegister = new LuaTable();
  }

  /**
   * todo: Description.
   */
  public override unregister_npc(object: XR_cse_alife_creature_abstract): void {
    logger.info("Unregister npc:", this.name(), object.name());

    this.population = this.population - 1;

    if (this.objectJobDescriptors.get(object.id) !== null) {
      this.objectJobDescriptors.get(object.id).job_link!.npc_id = null;
      this.objectJobDescriptors.delete(object.id);

      object.clear_smart_terrain();

      if (registry.objects.get(object.id) !== null) {
        const registryObject = registry.objects.get(object.id).object!;
        // todo: Ternary.
        let stype = ESchemeType.MONSTER;

        if (isStalker(object)) {
          stype = ESchemeType.STALKER;
        }

        initializeGameObject(registryObject, registry.objects.get(object.id), false, registry.actor, stype);
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
  public onObjectDeath(object: XR_cse_alife_creature_abstract): void {
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
  public override task(object: XR_cse_alife_creature_abstract): Optional<XR_CALifeSmartTerrainTask> {
    logger.info("Task:", this.name(), object.name());

    if (this.arrivingObjects.get(object.id) !== null) {
      return this.smartTerrainAlifeTask;
    }

    return this.jobsData.get(this.objectJobDescriptors.get(object.id).job_id).alife_task;
  }

  /**
   * todo: Description.
   */
  public load_jobs(): void {
    logger.info("Load jobs:", this.name());

    const [jobs, ltxContent] = loadGulagJobs(this);
    const [ltx, ltx_name] = loadDynamicLtx(this.name(), ltxContent);

    this.jobs = jobs;
    this.ltxConfig = ltx;
    this.ltxConfigName = ltx_name;

    const sort_jobs = (jobs: LuaTable<string>) => {
      for (const [k, v] of jobs) {
        if (v.jobs !== null) {
          sort_jobs(v.jobs);
        }
      }

      table.sort(jobs as any, (a: any, b: any) => a._prior > b._prior);
    };

    sort_jobs(this.jobs);

    let id = 0;

    this.jobsData = new LuaTable();

    const get_jobs_data = (jobs: LuaTable) => {
      for (const [k, v] of jobs) {
        if (v.jobs !== null) {
          get_jobs_data(v.jobs);
        } else {
          if (v.job_id === null) {
            abort("Incorrect job table");
          }

          this.jobsData.set(id, v.job_id);
          this.jobsData.get(id)._prior = v._prior;

          v.job_id = id;
          id = id + 1;
        }
      }
    };

    get_jobs_data(this.jobs);

    for (const [index, job] of this.jobsData) {
      const section = job.section;
      const ltx: XR_ini_file = job.ini_file || this.ltxConfig;

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

        let path_name = ltx.r_string(active_section, path_field);

        if (job.prefix_name !== null) {
          path_name = job.prefix_name + "_" + path_name;
        } else {
          path_name = this.name() + "_" + path_name;
        }

        if (path_name === "center_point") {
          if (level.patrol_path_exists(path_name + "_task")) {
            path_name = path_name + "_task";
          }
        }

        job.alife_task = new CALifeSmartTerrainTask(path_name);
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
        job.alife_task = this.smartTerrainAlifeTask as XR_CALifeSmartTerrainTask;
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
    this.check_alarm();

    for (const [id, object] of this.arrivingObjects) {
      if (onObjectArrivedToSmart(object, this)) {
        this.objectJobDescriptors.set(object.id, this.createObjectSmartJobDescriptor(object));
        this.jobDeadTimeById = new LuaTable();
        this.select_npc_job(this.objectJobDescriptors.get(object.id));
        this.arrivingObjects.delete(id);
      }
    }

    table.sort(this.objectJobDescriptors as any, (a: any, b: any) => a.job_prior < b.job_prior);

    for (const [k, v] of this.objectJobDescriptors) {
      this.select_npc_job(v);
    }
  }

  /**
   * todo: Description.
   */
  public select_npc_job(npcInfo: IObjectJobDescriptor): void {
    const [selected_job_id, selected_job_prior, selected_job_link] = job_iterator(this.jobs, npcInfo, 0, this);

    if (selected_job_id === null) {
      abort("Insufficient smart_terrain jobs: %s, %s, %s", this.name(), npcInfo.se_obj.id, this.simulationType);
    }

    if (selected_job_id !== npcInfo.job_id && selected_job_link !== null) {
      if (npcInfo.job_link !== null) {
        this.objectByJobSection.delete(this.jobsData.get(npcInfo.job_link.job_id).section);
        npcInfo.job_link.npc_id = null;
      }

      selected_job_link.npc_id = npcInfo.se_obj.id;
      this.objectByJobSection.set(this.jobsData.get(selected_job_link.job_id).section, selected_job_link.npc_id);

      npcInfo.job_id = selected_job_link.job_id;
      npcInfo.job_prior = selected_job_link._prior;
      npcInfo.begin_job = false;
      npcInfo.job_link = selected_job_link;

      const obj_storage = registry.objects.get(npcInfo.se_obj.id);

      if (obj_storage !== null) {
        switchToSection(obj_storage.object!, this.ltxConfig, STRINGIFIED_NIL);
      }
    }

    if (npcInfo.begin_job !== true) {
      const job_data = this.jobsData.get(npcInfo.job_id);

      logger.info("Begin job in smart", this.name(), npcInfo.se_obj.name(), job_data.section);

      hardResetOfflineObject(npcInfo.se_obj.id);

      npcInfo.begin_job = true;

      const obj_storage = registry.objects.get(npcInfo.se_obj.id);

      if (obj_storage !== null) {
        this.setup_logic(obj_storage.object!);
      }
    }
  }

  /**
   * todo: Description.
   */
  public setup_logic(object: XR_game_object): void {
    logger.info("Setup logic:", this.name(), object.name());

    const npc_data: IObjectJobDescriptor = this.objectJobDescriptors.get(object.id());
    const job = this.jobsData.get(npc_data.job_id);
    const ltx = job.ini_file || this.ltxConfig;
    const ltx_name = job.ini_path || this.ltxConfigName;

    configureObjectSchemes(object, ltx, ltx_name, npc_data.stype, job.section, job.prefix_name || this.name());

    const sect: TSection = determine_section_to_activate(object, ltx, job.section, registry.actor);

    if (getSchemeByIniSection(job.section) === STRINGIFIED_NIL) {
      abort("[smart_terrain %s] section=%s, don't use section 'null'!", this.name(), sect);
    }

    activateSchemeBySection(object, ltx, sect, job.prefix_name || this.name(), false);
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
  public switch_to_desired_job(object: XR_game_object): void {
    logger.info("Switch to desired job:", this.name(), object.name());

    const objectId: TNumberId = object.id();
    const objectInfo: IObjectJobDescriptor = this.objectJobDescriptors.get(objectId);
    const changingObjectId: TNumberId = this.objectByJobSection.get(objectInfo.need_job);

    if (changingObjectId === null) {
      objectInfo.job_link = null;
      objectInfo.job_id = -1;
      objectInfo.job_prior = -1;
      this.select_npc_job(objectInfo);

      return;
    }

    if (this.objectJobDescriptors.get(changingObjectId) === null) {
      objectInfo.job_link = null;
      objectInfo.job_id = -1;
      objectInfo.job_prior = -1;
      this.select_npc_job(objectInfo);

      return;
    }

    const desired_job = this.objectJobDescriptors.get(changingObjectId).job_id;

    if (objectInfo.job_link !== null) {
      this.objectByJobSection.delete(this.jobsData.get(objectInfo.job_link.job_id).section);
      objectInfo.job_link.npc_id = null;
    }

    const selectedJobLink = this.objectJobDescriptors.get(changingObjectId).job_link!;

    selectedJobLink.npc_id = objectInfo.se_obj.id;

    this.objectByJobSection.set(this.jobsData.get(selectedJobLink.job_id).section, selectedJobLink.npc_id);

    objectInfo.job_id = selectedJobLink.job_id;
    objectInfo.job_prior = selectedJobLink._prior;
    objectInfo.begin_job = true;

    objectInfo.job_link = selectedJobLink;
    objectInfo.need_job = STRINGIFIED_NIL;

    const objectStorage = registry.objects.get(objectId);

    if (objectStorage !== null) {
      this.setup_logic(objectStorage.object!);
    }

    const changingObjectInfo: IObjectJobDescriptor = this.objectJobDescriptors.get(changingObjectId);

    changingObjectInfo.job_link = null;
    changingObjectInfo.job_id = -1;
    changingObjectInfo.job_prior = -1;

    this.select_npc_job(changingObjectInfo);
  }

  /**
   * todo: Description.
   */
  public override STATE_Write(packet: XR_net_packet): void {
    super.STATE_Write(packet);

    setSaveMarker(packet, false, SmartTerrain.__name);

    let n = 0;

    for (const [k, v] of this.arrivingObjects) {
      n = n + 1;
    }

    packet.w_u8(n);

    for (const [k, v] of this.arrivingObjects) {
      packet.w_u16(k);
    }

    n = 0;

    for (const [k, v] of this.objectJobDescriptors) {
      n = n + 1;
    }

    packet.w_u8(n);

    for (const [k, v] of this.objectJobDescriptors) {
      packet.w_u16(k);
      packet.w_u8(v.job_prior);
      packet.w_u8(v.job_id);
      packet.w_bool(v.begin_job);
      packet.w_stringZ(v.need_job);
    }

    n = 0;

    for (const [k, v] of this.jobDeadTimeById) {
      n = n + 1;
    }

    packet.w_u8(n);

    for (const [k, v] of this.jobDeadTimeById) {
      packet.w_u8(k);
      writeCTimeToPacket(packet, v);
    }

    if (this.smartTerrainActorControl !== null) {
      packet.w_bool(true);
      this.smartTerrainActorControl.save(packet);
    } else {
      packet.w_bool(false);
    }

    if (this.isRespawnPoint) {
      packet.w_bool(true);

      n = 0;
      for (const [k, v] of this.alreadySpawned) {
        n = n + 1;
      }

      packet.w_u8(n);

      for (const [k, v] of this.alreadySpawned) {
        packet.w_stringZ(k);
        packet.w_u8(v.num);
      }

      if (this.lastRespawnUpdatedAt !== null) {
        packet.w_bool(true);
        writeCTimeToPacket(packet, this.lastRespawnUpdatedAt);
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

    setSaveMarker(packet, true, SmartTerrain.__name);
  }

  /**
   * todo: Description.
   */
  public override STATE_Read(packet: XR_net_packet, size: number): void {
    super.STATE_Read(packet, size);

    if (editor()) {
      return;
    }

    setLoadMarker(packet, false, SmartTerrain.__name);
    this.read_params();

    const alifeSimulator: XR_alife_simulator = alife();
    let n = packet.r_u8();

    this.arrivingObjects = new LuaTable();

    for (const it of $range(1, n)) {
      const id: TNumberId = packet.r_u16();

      this.arrivingObjects.set(id, alifeSimulator.object(id) as XR_cse_alife_creature_abstract);
    }

    n = packet.r_u8();
    this.objectJobDescriptors = new LuaTable();

    for (const it of $range(1, n)) {
      const id = packet.r_u16();

      const npc_info: IObjectJobDescriptor = {} as IObjectJobDescriptor;

      this.objectJobDescriptors.set(id, npc_info);

      npc_info.job_prior = packet.r_u8();

      if (npc_info.job_prior === 255) {
        npc_info.job_prior = -1;
      }

      npc_info.job_id = packet.r_u8();

      if (npc_info.job_id === MAX_UNSIGNED_8_BIT) {
        npc_info.job_id = -1;
      }

      npc_info.begin_job = packet.r_bool();
      npc_info.need_job = packet.r_stringZ();
    }

    n = packet.r_u8();
    this.jobDeadTimeById = new LuaTable();

    for (const it of $range(1, n)) {
      const job_id = packet.r_u8();
      const dead_time = readCTimeFromPacket(packet)!;

      this.jobDeadTimeById.set(job_id, dead_time);
    }

    this.isObjectsInitializationNeeded = true;

    if (this.script_version > 9) {
      if (packet.r_bool() === true) {
        this.smartTerrainActorControl.load(packet);
      }
    }

    const respawn_point = packet.r_bool();

    if (respawn_point) {
      n = packet.r_u8();
      for (const it of $range(1, n)) {
        const id = packet.r_stringZ();
        const num = packet.r_u8();

        this.alreadySpawned.get(id).num = num;
      }

      if (this.script_version > 11) {
        const exist: boolean = packet.r_bool();

        if (exist) {
          this.lastRespawnUpdatedAt = readCTimeFromPacket(packet);
        } else {
          this.lastRespawnUpdatedAt = null;
        }
      }
    }

    this.population = packet.r_u8();
    setLoadMarker(packet, true, SmartTerrain.__name);
  }

  /**
   * todo: Description.
   */
  public init_npc_after_load(): void {
    logger.info("Init npc after load:", this.name());

    const findNewJob = (jobs: LuaTable<number, any>, objectJobDescriptor: IObjectJobDescriptor) => {
      for (const [k, v] of jobs) {
        if (v.jobs !== null) {
          findNewJob(v.jobs, objectJobDescriptor);
        } else {
          if (v.job_id === objectJobDescriptor.job_id) {
            objectJobDescriptor.job_link = v;
            v.npc_id = objectJobDescriptor.se_obj.id;

            return;
          }
        }
      }
    };

    const alifeSimulator: XR_alife_simulator = alife();

    for (const [id] of this.arrivingObjects) {
      const serverObject: Optional<XR_cse_alife_creature_abstract> = alifeSimulator.object(id);

      if (serverObject !== null) {
        this.arrivingObjects.set(id, serverObject);
      } else {
        this.arrivingObjects.delete(id);
      }
    }

    for (const [objectId, jobDescriptor] of this.objectJobDescriptors) {
      const serverObject: Optional<XR_cse_alife_creature_abstract> = alifeSimulator.object(objectId);

      if (serverObject !== null) {
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
      } else {
        this.objectJobDescriptors.delete(objectId);
      }
    }
  }

  /**
   * todo: Description.
   */
  public get_smart_props(): string {
    let props: Optional<TName> = this.getNameCaption();

    if (props === null || gameConfig.DEBUG.IS_SMARTS_DEBUG_ENABLED) {
      props =
        this.name() +
        "  [" +
        this.id +
        "]\\n" +
        this.simulationType +
        "\\n" +
        "squad_id = " +
        tostring(this.id) +
        "\\n" +
        "capacity = " +
        tostring(this.maxPopulation) +
        " (" +
        SimulationBoardManager.getInstance().getSmartTerrainPopulation(this) +
        ")\\n";

      if (this.isRespawnPoint !== null && this.alreadySpawned !== null) {
        props = props + "\\nalready_spawned :\n";
        for (const [k, v] of this.alreadySpawned) {
          props =
            props +
            "[" +
            k +
            "] = " +
            v.num +
            "(" +
            pickSectionFromCondList(registry.actor, null, this.respawnConfiguration.get(k).num as any) +
            ")\\n";
        }

        if (this.lastRespawnUpdatedAt) {
          props =
            props +
            "\\ntime_to_spawn:" +
            tostring(RESPAWN_IDLE - game.get_game_time().diffSec(this.lastRespawnUpdatedAt)) +
            "\\n";
        }
      }

      for (const [k, v] of SimulationBoardManager.getInstance().getSmartTerrainDescriptorById(this.id)!
        .assignedSquads) {
        props = props + tostring(v.id) + "\\n";
      }
    }

    return props;
  }

  /**
   * todo: Description.
   */
  public show(): void {
    let spot: TRelation = "neutral";

    if (
      this.isSimulationAvailableConditionList === null ||
      pickSectionFromCondList(registry.actor, this, this.isSimulationAvailableConditionList) === STRINGIFIED_TRUE
    ) {
      spot = "friend";
    } else {
      spot = "enemy";
    }

    if (this.smrt_showed_spot === spot) {
      level.map_change_spot_hint(
        this.id,
        "alife_presentation_smart_" + this.simulationType + "_" + this.smrt_showed_spot,
        this.get_smart_props()
      );

      return;
    }

    if (gameConfig.DEBUG.IS_SMARTS_DEBUG_ENABLED) {
      if (this.smrt_showed_spot !== null) {
        level.map_remove_object_spot(
          this.id,
          "alife_presentation_smart_" + this.simulationType + "_" + this.smrt_showed_spot
        );
      }

      level.map_add_object_spot(
        this.id,
        "alife_presentation_smart_" + this.simulationType + "_" + spot,
        this.get_smart_props()
      );
      this.smrt_showed_spot = spot;
    } else {
      if (
        this.smrt_showed_spot !== null &&
        level.map_has_object_spot(
          this.id,
          "alife_presentation_smart_" + this.simulationType + "_" + this.smrt_showed_spot
        ) !== 0
      ) {
        level.map_remove_object_spot(this.id, "alife_presentation_smart_base_" + this.smrt_showed_spot);
      }
    }
  }

  /**
   * todo: Description.
   */
  public refresh(): void {
    this.show();
  }

  /**
   * todo: Description.
   */
  public hide(): void {
    if (this.smrt_showed_spot === null) {
      return;
    }

    level.map_remove_object_spot(
      this.id,
      "alife_presentation_smart_" + this.simulationType + "_" + this.smrt_showed_spot
    );
  }

  /**
   * todo: Description.
   */
  public override update(): void {
    super.update();

    if (gameConfig.DEBUG.IS_SMARTS_DEBUG_ENABLED) {
      this.refresh();
    }

    const now: TTimestamp = time_global();

    if (areObjectsOnSameLevel(this, alife().actor())) {
      const distanceToActor: TDistance = this.position.distance_to(alife().actor()!.position);
      const previousDistanceToActor: TDistance =
        (nearest_to_actor_smart.id === null && nearest_to_actor_smart.dist) ||
        alife().object(nearest_to_actor_smart.id!)!.position.distance_to(alife().actor().position);

      if (distanceToActor < previousDistanceToActor) {
        nearest_to_actor_smart.id = this.id;
        nearest_to_actor_smart.dist = distanceToActor;
      }
    }

    if (this.respawnConfiguration !== null) {
      this.tryRespawnSquad();
    }

    if (now < this.nextCheckAt) {
      return;
    }

    if (areOnlyMonstersOnJobs(this.objectJobDescriptors) && this.areCampfiresOn) {
      this.areCampfiresOn = false;
      turnOffCampfiresBySmartTerrainName(this.name());
    } else if (!areOnlyMonstersOnJobs(this.objectJobDescriptors) && !this.areCampfiresOn) {
      this.areCampfiresOn = true;
      turnOnCampfiresBySmartName(this.name());
    }

    if (registry.actor === null) {
      this.nextCheckAt = now + 10;
    } else {
      const distance: TDistance = registry.actor.position().distance_to_sqr(this.position);
      const idleTime: TDuration = math.max(60, 0.003 * distance);

      this.nextCheckAt = now + idleTime;
    }

    const currentGameTime: XR_CTime = game.get_game_time();

    for (const [k, v] of this.jobDeadTimeById) {
      if (currentGameTime.diffSec(v) >= DEATH_IDLE_TIME) {
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
   * todo: Description.
   */
  public set_alarm(): void {
    this.smartAlarmStartedAt = game.get_game_time();
  }

  /**
   * todo: Description.
   */
  public check_alarm(): void {
    if (this.smartAlarmStartedAt === null) {
      return;
    }

    if (game.get_game_time().diffSec(this.smartAlarmStartedAt) > ALARM_TIMEOUT) {
      this.smartAlarmStartedAt = null;
    }
  }

  /**
   * todo: Description.
   */
  public get_location(): LuaMultiReturn<[XR_vector, number, number]> {
    return $multi(this.position, this.m_level_vertex_id, this.m_game_vertex_id);
  }

  /**
   * todo: Description.
   */
  public am_i_reached(squad: Squad): boolean {
    const [squad_pos, squad_lv_id, squad_gv_id] = squad.get_location();
    const [target_pos, target_lv_id, target_gv_id] = this.get_location();

    if (game_graph().vertex(squad_gv_id).level_id() !== game_graph().vertex(target_gv_id).level_id()) {
      return false;
    }

    if (isMonster(alife().object(squad.commander_id())!) && squad.get_script_target() === null) {
      return squad_pos.distance_to_sqr(target_pos) <= 25;
    }

    return squad.always_arrived || squad_pos.distance_to_sqr(target_pos) <= this.arrivalDistance * this.arrivalDistance;
  }

  /**
   * todo: Description.
   */
  public on_after_reach(squad: Squad): void {
    for (const squadMember of squad.squad_members()) {
      squad.simulationBoardManager.setupObjectSquadAndGroup(squadMember.object);
    }

    squad.current_target_id = this.id;
  }

  /**
   * todo: Description.
   */
  public on_reach_target(squad: Squad): void {
    squad.set_location_types(this.name());
    this.simulationBoardManager.assignSquadToSmartTerrain(squad, this.id);

    for (const it of squad.squad_members()) {
      softResetOfflineObject(it.id);
    }
  }

  /**
   * todo: Description.
   */
  public getAlifeSmartTerrainTask(): XR_CALifeSmartTerrainTask {
    return this.smartTerrainAlifeTask;
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

      const squadsCount: Optional<string> = getConfigString(this.ini, sectionName, "spawn_num", this, false, "", null);
      const squadsToSpawn: Optional<string> = getConfigString(
        this.ini,
        sectionName,
        "spawn_squads",
        this,
        false,
        "",
        null
      );

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
        squads: parseNames(squadsToSpawn),
      });
    }
  }

  /**
   * todo: Description.
   */
  public respawnSquad(): void {
    logger.info("Respawn squad in smart:", this.name());

    const availableSections: LuaArray<TSection> = new LuaTable();

    for (const [section, descriptor] of this.respawnConfiguration) {
      if (
        tonumber(pickSectionFromCondList(registry.actor, null, descriptor.num as any))! >
        this.alreadySpawned.get(section).num
      ) {
        table.insert(availableSections, section);
      }
    }

    if (availableSections.length() > 0) {
      const sectionToSpawn: TSection = availableSections.get(math.random(1, availableSections.length()));
      const sectionParams = this.respawnConfiguration.get(sectionToSpawn);
      const squadId: TStringId = sectionParams.squads.get(math.random(1, sectionParams.squads.length()));
      const squad: Squad = this.simulationBoardManager.createSmartSquad(this, squadId);

      squad.respawn_point_id = this.id;
      squad.respawn_point_prop_section = sectionToSpawn;

      this.simulationBoardManager.enterSmartTerrain(squad, this.id);

      for (const squadMember of squad.squad_members()) {
        this.simulationBoardManager.setupObjectSquadAndGroup(squadMember.object);
      }

      this.alreadySpawned.get(sectionToSpawn).num = this.alreadySpawned.get(sectionToSpawn).num + 1;
    }
  }

  /**
   * todo: Description.
   */
  public tryRespawnSquad(): void {
    const currentTime: XR_CTime = game.get_game_time();

    if (this.lastRespawnUpdatedAt === null || currentTime.diffSec(this.lastRespawnUpdatedAt) > RESPAWN_IDLE) {
      this.lastRespawnUpdatedAt = currentTime;

      if (pickSectionFromCondList(registry.actor, this, this.isSimulationAvailableConditionList) !== STRINGIFIED_TRUE) {
        return;
      }

      const squadsCount: TCount = this.simulationBoardManager.getSmartTerrainActiveSquads(this.id);

      if (this.maxPopulation <= squadsCount) {
        return logger.info("Smart cannot respawn due to squad limit:", this.name(), squadsCount, this.maxPopulation);
      }

      if (alife().actor().position.distance_to_sqr(this.position) < this.respawnRadius * this.respawnRadius) {
        return logger.info("Cannot respawn squad due to actor distance:", this.name());
      }

      this.respawnSquad();
    }
  }

  /**
   * todo: Description.
   */
  public isSimulationAvailable(): boolean {
    if (pickSectionFromCondList(registry.actor, this, this.isSimulationAvailableConditionList) !== STRINGIFIED_TRUE) {
      return false;
    }

    return !(
      this.smartTerrainActorControl !== null && this.smartTerrainActorControl.status !== ESmartTerrainStatus.NORMAL
    );
  }

  /**
   * todo: Description.
   */
  public target_precondition(squad: Squad, isPopulationDecreaseNeeded?: boolean): boolean {
    if (this.isRespawnOnlySmart) {
      return false;
    }

    let squadsCount: TCount = this.simulationBoardManager.getSmartTerrainActiveSquads(this.id);

    if (isPopulationDecreaseNeeded) {
      squadsCount -= 1;
    }

    if (squadsCount !== null && this.maxPopulation <= squadsCount) {
      return false;
    }

    const squadParameters: ISimulationActivityDescriptor = simulation_activities[squad.player_id!];

    if (squadParameters === null || squadParameters.smart === null) {
      return false;
    }

    if (tonumber(this.props["resource"])! > 0) {
      const smart_params = squadParameters.smart.resource;

      if (smart_params !== null && smart_params!.prec(squad, this)) {
        return true;
      }
    }

    if (tonumber(this.props["base"])! > 0) {
      const smart_params = squadParameters.smart.base;

      if (smart_params !== null && smart_params!.prec(squad, this)) {
        return true;
      }
    }

    if (tonumber(this.props["lair"])! > 0) {
      const smart_params = squadParameters.smart.lair;

      if (smart_params !== null && smart_params!.prec(squad, this)) {
        return true;
      }
    }

    if (tonumber(this.props["territory"])! > 0) {
      const smart_params = squadParameters.smart.territory;

      if (smart_params !== null && smart_params!.prec(squad, this)) {
        return true;
      }
    }

    if (tonumber(this.props["surge"])! > 0) {
      const smart_params = squadParameters.smart.surge;

      if (smart_params !== null && smart_params!.prec(squad, this)) {
        return true;
      }
    }

    return false;
  }
}

/**
 * todo;
 */
export function setupSmartJobsAndLogicOnSpawn(
  object: XR_game_object,
  state: IRegistryObjectState,
  serverObject: Optional<XR_cse_alife_creature_abstract>,
  schemeType: ESchemeType,
  loaded: boolean
): void {
  logger.info("Setup smart terrain logic on spawn:", object.name(), schemeType);

  const alifeSimulator: Optional<XR_alife_simulator> = alife();

  // todo: Why?
  serverObject = alife()!.object<XR_cse_alife_creature_abstract>(object.id());

  if (alifeSimulator !== null && serverObject !== null) {
    const smartTerrainId: TNumberId = serverObject.m_smart_terrain_id;

    if (smartTerrainId !== null && smartTerrainId !== MAX_UNSIGNED_16_BIT) {
      const smartTerrain: SmartTerrain = alifeSimulator.object(smartTerrainId) as SmartTerrain;
      const need_setup_logic =
        !loaded &&
        smartTerrain.objectJobDescriptors.get(object.id()) &&
        smartTerrain.objectJobDescriptors.get(object.id()).begin_job === true;

      if (need_setup_logic) {
        smartTerrain.setup_logic(object);
      } else {
        initializeGameObject(object, state, loaded, registry.actor, schemeType);
      }
    } else {
      initializeGameObject(object, state, loaded, registry.actor, schemeType);
    }
  } else {
    initializeGameObject(object, state, loaded, registry.actor, schemeType);
  }
}

/**
 * todo;
 * todo: gulag general update
 */
function isJobAvailableToObject(objectInfo: IObjectJobDescriptor, jobInfo: any, smartTerrain: SmartTerrain): boolean {
  if (smartTerrain.jobDeadTimeById.get(jobInfo.job_id) !== null) {
    return false;
  }

  if (jobInfo._precondition_is_monster !== null && jobInfo._precondition_is_monster !== objectInfo.is_monster) {
    return false;
  }

  if (jobInfo._precondition_function !== null) {
    if (
      !(jobInfo._precondition_function as AnyCallable)(
        objectInfo.se_obj,
        smartTerrain,
        jobInfo._precondition_params,
        objectInfo
      )
    ) {
      return false;
    }
  }

  return true;
}

/**
 * todo;
 */
function job_iterator(
  jobs: LuaTable,
  npc_data: IObjectJobDescriptor,
  selected_job_prior: number,
  smart: SmartTerrain
): LuaMultiReturn<[Optional<number>, number, Optional<any>]> {
  let selected_job_id = null;
  let current_job_prior = selected_job_prior;
  let selected_job_link = null;

  for (const [k, v] of jobs) {
    if (current_job_prior > v._prior) {
      return $multi(selected_job_id, current_job_prior, selected_job_link);
    }

    if (isJobAvailableToObject(npc_data, v, smart)) {
      if (v.job_id === null) {
        [selected_job_id, current_job_prior, selected_job_link] = job_iterator(
          v.jobs,
          npc_data,
          selected_job_prior,
          smart
        );
      } else {
        if (v.npc_id === null) {
          return $multi(v.job_id, v._prior, v);
        } else if (v.job_id === npc_data.job_id) {
          return $multi(v.job_id, v._prior, v);
        }
      }
    }
  }

  return $multi(selected_job_id, current_job_prior, selected_job_link);
}

/**
 * todo;
 */
function onObjectArrivedToSmart(object: XR_cse_alife_creature_abstract, smartTerrain: SmartTerrain): boolean {
  const state: Optional<IRegistryObjectState> = registry.objects.get(object.id);

  let objectGameVertex: XR_GameGraph__CVertex;
  let objectPosition: XR_vector;

  if (state === null) {
    objectGameVertex = game_graph().vertex(object.m_game_vertex_id);
    objectPosition = object.position;
  } else {
    const it = registry.objects.get(object.id).object!;

    objectGameVertex = game_graph().vertex(it.game_vertex_id());
    objectPosition = it.position();
  }

  const smartTerrainGameVertex: XR_GameGraph__CVertex = game_graph().vertex(smartTerrain.m_game_vertex_id);

  if (object.group_id !== null) {
    const squad = smartTerrain.simulationBoardManager.getSquads().get(object.group_id);

    if (squad !== null && squad.current_action) {
      if (squad.current_action.name === "reach_target") {
        const squad_target = registry.simulationObjects.get(squad.assigned_target_id!);

        if (squad_target !== null) {
          return squad_target.am_i_reached(squad);
        } else {
          return alife().object<SmartTerrain>(squad.assigned_target_id!)!.am_i_reached(squad);
        }
      } else if (squad.current_action.name === "stay_point") {
        return true;
      }
    }
  }

  if (objectGameVertex.level_id() === smartTerrainGameVertex.level_id()) {
    return objectPosition.distance_to_sqr(smartTerrain.position) <= 10000;
  } else {
    return false;
  }
}

/**
 * todo;
 */
function areOnlyMonstersOnJobs(objectInfos: LuaArray<IObjectJobDescriptor>): boolean {
  for (const [, objectInfo] of objectInfos) {
    if (!objectInfo.is_monster) {
      return false;
    }
  }

  return true;
}

/**
 * todo;
 */
export function onSmartTerrainObjectDeath(object: XR_cse_alife_creature_abstract): void {
  const alifeSimulator: XR_alife_simulator = alife();

  if (alifeSimulator !== null) {
    object = alifeSimulator.object(object.id) as XR_cse_alife_creature_abstract;

    if (object === null) {
      return;
    }

    const smartTerrainId: TNumberId = object.smart_terrain_id();

    if (smartTerrainId !== MAX_UNSIGNED_16_BIT) {
      logger.info("Clear smart terrain dead object:", object.name());
      (alifeSimulator.object(smartTerrainId) as SmartTerrain).onObjectDeath(object);
    }
  }
}
