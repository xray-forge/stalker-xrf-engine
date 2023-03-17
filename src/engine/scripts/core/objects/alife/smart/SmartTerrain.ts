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

import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { MAX_UNSIGNED_16_BIT, MAX_UNSIGNED_8_BIT } from "@/engine/lib/constants/memory";
import { SMART_TERRAIN_SECT } from "@/engine/lib/constants/sections";
import { STRINGIFIED_NIL, STRINGIFIED_TRUE } from "@/engine/lib/constants/words";
import {
  AnyCallable,
  AnyObject,
  ESchemeType,
  LuaArray,
  Optional,
  TName,
  TNumberId,
  TPath,
  TRate,
  TSection,
  TTimestamp,
} from "@/engine/lib/types";
import {
  hardResetOfflineObject,
  IRegistryObjectState,
  loadDynamicLtx,
  registerObjectStoryLinks,
  registry,
  SMART_TERRAIN_MASKS_LTX,
  softResetOfflineObject,
  unregisterStoryLinkByObjectId,
} from "@/engine/scripts/core/database";
import { SimulationBoardManager } from "@/engine/scripts/core/database/SimulationBoardManager";
import { evaluate_prior, getSimulationObjectsRegistry } from "@/engine/scripts/core/database/SimulationObjectsRegistry";
import { get_smart_terrain_name } from "@/engine/scripts/core/database/smart_names";
import { loadGulagJobs } from "@/engine/scripts/core/objects/alife/gulag_general";
import { simulation_activities } from "@/engine/scripts/core/objects/alife/SimulationActivity";
import {
  ESmartTerrainStatus,
  SmartTerrainControl,
} from "@/engine/scripts/core/objects/alife/smart/SmartTerrainControl";
import { Squad } from "@/engine/scripts/core/objects/alife/Squad";
import {
  turn_off_campfires_by_smart_name,
  turn_on_campfires_by_smart_name,
} from "@/engine/scripts/core/objects/binders/CampfireBinder";
import { activateSchemeBySection } from "@/engine/scripts/core/schemes/base/activateSchemeBySection";
import { configureObjectSchemes } from "@/engine/scripts/core/schemes/base/configureObjectSchemes";
import { determine_section_to_activate } from "@/engine/scripts/core/schemes/determine_section_to_activate";
import { initializeGameObject } from "@/engine/scripts/core/schemes/initializeGameObject";
import { switchToSection } from "@/engine/scripts/core/schemes/switchToSection";
import { isMonster, isStalker } from "@/engine/scripts/utils/check/is";
import { abort } from "@/engine/scripts/utils/debug";
import { setLoadMarker, setSaveMarker } from "@/engine/scripts/utils/game_save";
import { pickSectionFromCondList } from "@/engine/scripts/utils/ini_config/config";
import {
  getConfigBoolean,
  getConfigNumber,
  getConfigString,
  getSchemeByIniSection,
} from "@/engine/scripts/utils/ini_config/getters";
import { LuaLogger } from "@/engine/scripts/utils/logging";
import { areObjectsOnSameLevel } from "@/engine/scripts/utils/object";
import { parseConditionsList, parseNames, TConditionList } from "@/engine/scripts/utils/parse";
import { readCTimeFromPacket, writeCTimeToPacket } from "@/engine/scripts/utils/time";

const logger: LuaLogger = new LuaLogger($filename);

export const ALARM_TIMEOUT: number = 21_600;
export const DEATH_IDLE_TIME: number = 10 * 60;
export const RESPAWN_IDLE: number = 1_000;
export const RESPAWN_RADIUS: number = 150;

export const smart_terrains_by_name: LuaTable<TName, SmartTerrain> = new LuaTable();
export const nearest_to_actor_smart = { id: null as Optional<number>, dist: math.huge };

export const path_fields: LuaTable<number, string> = ["path_walk", "path_main", "path_home", "center_point"] as any;

/**
 * todo;
 */
interface INpcInfo {
  se_obj: any;
  is_monster: boolean;
  need_job: string;
  job_prior: number;
  job_id: number;
  job_link: any;
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
@LuabindClass()
export class SmartTerrain extends cse_alife_smart_zone {
  public ini!: XR_ini_file;

  public showtime: Optional<number> = null;
  public player_name!: string;

  public smrt_showed_spot: Optional<string> = null;
  public sim_type: string = "default";
  public squad_id: number = 0;
  public respawn_sector: Optional<TConditionList> = null;
  public respawn_radius: number = 150;
  public mutant_lair: boolean = false;
  public no_mutant: boolean = false;
  public forbidden_point: string = "";
  public arrive_dist: number = 30;

  public disabled: boolean = false;
  public campfires_on: boolean = false;
  public sim_avail: Optional<TConditionList> = null;
  public initialized: boolean = false;
  public b_registred: boolean = false;
  public respawn_only_smart: boolean = false;
  public need_init_npc: boolean = true;
  public population: number = 0;
  public check_time: number = -1;
  public respawn_point: boolean = false;

  public smart_alarm_time: Optional<XR_CTime> = null;
  public last_respawn_update: Optional<XR_CTime> = null;

  public traveler_actor_path: string = "";
  public traveler_squad_path: string = "";

  public def_restr: Optional<string> = null;
  public att_restr: Optional<string> = null;
  public safe_restr: Optional<string> = null;
  public spawn_point: Optional<string> = null;

  public base_on_actor_control!: SmartTerrainControl;

  public max_population: number = -1;

  public npc_to_register: LuaTable<number, XR_cse_alife_creature_abstract> = new LuaTable();
  public npc_by_job_section: LuaTable<string, number> = new LuaTable();
  public dead_time: LuaTable<number, XR_CTime> = new LuaTable();

  public npc_info: LuaTable<TNumberId, INpcInfo> = new LuaTable();
  public arriving_npc: LuaTable<TNumberId> = new LuaTable();

  public smart_alife_task: Optional<XR_CALifeSmartTerrainTask> = null;

  public jobs: any;
  public job_data: LuaArray<ISmartTerrainJob> = new LuaTable();

  public ltx!: XR_ini_file;
  public ltx_name!: string;

  public props!: AnyObject;
  public board!: SimulationBoardManager;
  public smart_level: string = "";

  public respawn_params!: LuaTable<string, { squads: LuaArray<string>; num: TConditionList }>;
  public already_spawned!: LuaTable<string, { num: number }>;

  /**
   * todo;
   */
  public override on_before_register(): void {
    super.on_before_register();

    this.board = SimulationBoardManager.getInstance();
    this.board.register_smart(this);
    this.smart_level = alife().level_name(game_graph().vertex(this.m_game_vertex_id).level_id());
  }

  /**
   * todo;
   */
  public override on_register(): void {
    super.on_register();

    logger.info("Register:", this.id, this.name(), this.section_name());
    registerObjectStoryLinks(this);

    getSimulationObjectsRegistry().register(this);

    if (gameConfig.DEBUG.IS_SMARTS_DEBUG_ENABLED) {
      this.refresh();
    }

    this.smart_alife_task = new CALifeSmartTerrainTask(this.m_game_vertex_id, this.m_level_vertex_id);

    smart_terrains_by_name.set(this.name(), this);
    this.b_registred = true;

    this.load_jobs();

    this.board.init_smart(this);

    if (this.need_init_npc === true) {
      this.need_init_npc = false;
      this.init_npc_after_load();
    }

    this.register_delayed_npc();
    this.check_time = time_global();
  }

  /**
   * todo;
   */
  public override on_unregister(): void {
    super.on_unregister();
    this.board.unregister_smart(this);
    smart_terrains_by_name.delete(this.name());
    unregisterStoryLinkByObjectId(this.id);
    getSimulationObjectsRegistry().unregister(this);
  }

  public read_params(): void {
    this.ini = this.spawn_ini();

    if (!this.ini.section_exist(SMART_TERRAIN_SECT)) {
      abort("[smart_terrain %s] no configuration!", this.name());
      this.disabled = true;

      return;
    }

    const filename = getConfigString(this.ini, SMART_TERRAIN_SECT, "cfg", this, false, "");
    const fs = getFS();

    if (filename !== null) {
      if (fs.exist("$game_config$", filename)) {
        this.ini = new ini_file(filename);
      } else {
        abort("There is no configuration file [%s] in smart_terrain [%s]", filename, this.name());
      }
    }

    const ini = this.ini;

    this.sim_type = getConfigString(ini, SMART_TERRAIN_SECT, "sim_type", this, false, "", "default");

    if (valid_territory.get(this.sim_type) === null) {
      abort("Wrong sim_type value [%s] in smart [%s]", this.sim_type, this.name());
    }

    this.squad_id = getConfigNumber(ini, SMART_TERRAIN_SECT, "squad_id", this, false, 0);
    this.respawn_radius = getConfigNumber(ini, SMART_TERRAIN_SECT, "respawn_radius", this, false, 150);

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

    this.mutant_lair = getConfigBoolean(ini, SMART_TERRAIN_SECT, "mutant_lair", this, false);
    this.no_mutant = getConfigBoolean(ini, SMART_TERRAIN_SECT, "no_mutant", this, false);

    if (this.no_mutant === true) {
      logger.info("Found no mutant point:", this.name());
    }

    this.forbidden_point = getConfigString(ini, SMART_TERRAIN_SECT, "forbidden_point", this, false, "");
    this.def_restr = getConfigString(ini, SMART_TERRAIN_SECT, "def_restr", this, false, "", null);
    this.att_restr = getConfigString(ini, SMART_TERRAIN_SECT, "att_restr", this, false, "", null);
    this.safe_restr = getConfigString(ini, SMART_TERRAIN_SECT, "safe_restr", this, false, "", null);
    this.spawn_point = getConfigString(ini, SMART_TERRAIN_SECT, "spawn_point", this, false, "");
    this.arrive_dist = getConfigNumber(ini, SMART_TERRAIN_SECT, "arrive_dist", this, false, 30);

    const max_population: string = getConfigString(ini, SMART_TERRAIN_SECT, "max_population", this, false, "", "0");
    const parsed_condlist = parseConditionsList(max_population);

    this.max_population = tonumber(pickSectionFromCondList(registry.actor, null, parsed_condlist))!;

    const respawn_params = getConfigString(ini, SMART_TERRAIN_SECT, "respawn_params", this, false, "", null);

    this.respawn_only_smart = getConfigBoolean(ini, SMART_TERRAIN_SECT, "respawn_only_smart", this, false, false);

    const smart_control_section = getConfigString(ini, SMART_TERRAIN_SECT, "smart_control", this, false, "", null);

    if (smart_control_section !== null) {
      this.base_on_actor_control = new SmartTerrainControl(this, ini, smart_control_section);
    }

    this.respawn_point = false;

    if (respawn_params !== null) {
      this.check_respawn_params(respawn_params);
    }

    if (level.patrol_path_exists(this.name() + "_traveller_actor")) {
      this.traveler_actor_path = this.name() + "_traveller_actor";
    }

    if (level.patrol_path_exists(this.name() + "_traveller_squad")) {
      // logger.warn("No traveller_squad path:", this.name());
      this.traveler_squad_path = this.name() + "_traveller_squad";
    }

    if (!SMART_TERRAIN_MASKS_LTX.section_exist(this.name())) {
      logger.warn("No terrain_mask section in smart_terrain_masks.ltx:", this.name());
    }
  }

  /**
   * todo;
   */
  public fill_npc_info(object: XR_cse_alife_creature_abstract): INpcInfo {
    const npcInfo: INpcInfo = {} as any;

    logger.info("Filling npc_info for object:", object.name());

    const isObjectStalker: boolean = isStalker(object);

    npcInfo.se_obj = object;
    npcInfo.is_monster = !isObjectStalker;
    npcInfo.need_job = STRINGIFIED_NIL;
    npcInfo.job_prior = -1;
    npcInfo.job_id = -1;
    npcInfo.begin_job = false;

    if (isObjectStalker) {
      npcInfo.stype = ESchemeType.STALKER;
    } else {
      npcInfo.stype = ESchemeType.MONSTER;
    }

    return npcInfo;
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
   * todo;
   */
  public override register_npc(object: XR_cse_alife_creature_abstract): void {
    logger.info("Register npc:", this.name(), object.name());
    this.population = this.population + 1;

    if (this.b_registred === false) {
      table.insert(this.npc_to_register, object);

      return;
    }

    if (!isStalker(object)) {
      (object as any).smart_terrain_task_activate();
    }

    (object as any).m_smart_terrain_id = this.id;

    if (arrived_to_smart(object, this)) {
      this.npc_info.set(object.id, this.fill_npc_info(object));
      this.dead_time = new LuaTable();
      this.select_npc_job(this.npc_info.get(object.id));
    } else {
      this.arriving_npc.set(object.id, object);
    }
  }

  /**
   * todo;
   */
  public register_delayed_npc(): void {
    logger.info("Registering delayed NPCs:", this.name(), this.npc_to_register.length);

    for (const [k, v] of this.npc_to_register) {
      this.register_npc(v);
    }

    this.npc_to_register = new LuaTable();
  }

  /**
   * todo;
   */
  public override unregister_npc(object: XR_cse_alife_creature_abstract): void {
    logger.info("Unregister npc:", this.name(), object.name());

    this.population = this.population - 1;

    if (this.npc_info.get(object.id) !== null) {
      this.npc_info.get(object.id).job_link.npc_id = null;
      this.npc_info.delete(object.id);

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

    if (this.arriving_npc.get(object.id) !== null) {
      this.arriving_npc.delete(object.id);
      object.clear_smart_terrain();

      return;
    }

    abort("this.npc_info[obj.id] = null !!! obj.id=%d", object.id);
  }

  /**
   * todo;
   */
  public clear_dead(object: XR_cse_alife_creature_abstract): void {
    logger.info("Clear dead:", this.name(), object.name());

    if (this.npc_info.get(object.id) !== null) {
      this.dead_time.set(this.npc_info.get(object.id).job_id, game.get_game_time());

      this.npc_info.get(object.id).job_link.npc_id = null;
      this.npc_info.delete(object.id);
      object.clear_smart_terrain();

      return;
    }

    if (this.arriving_npc.get(object.id) !== null) {
      this.arriving_npc.delete(object.id);
      object.clear_smart_terrain();

      return;
    }

    abort("this.npc_info[obj.id] = null !!! obj.id=%d", object.id);
  }

  /**
   * todo;
   */
  public override task(object: XR_cse_alife_creature_abstract): Optional<XR_CALifeSmartTerrainTask> {
    logger.info("Task:", this.name(), object.name());

    if (this.arriving_npc.get(object.id) !== null) {
      return this.smart_alife_task;
    }

    return this.job_data.get(this.npc_info.get(object.id).job_id).alife_task;
  }

  /**
   * todo;
   */
  public load_jobs(): void {
    logger.info("Load jobs:", this.name());

    const [jobs, ltxContent] = loadGulagJobs(this);
    const [ltx, ltx_name] = loadDynamicLtx(this.name(), ltxContent);

    this.jobs = jobs;
    this.ltx = ltx;
    this.ltx_name = ltx_name;

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

    this.job_data = new LuaTable();

    const get_jobs_data = (jobs: LuaTable) => {
      for (const [k, v] of jobs) {
        if (v.jobs !== null) {
          get_jobs_data(v.jobs);
        } else {
          if (v.job_id === null) {
            abort("Incorrect job table");
          }

          this.job_data.set(id, v.job_id);
          this.job_data.get(id)._prior = v._prior;

          v.job_id = id;
          id = id + 1;
        }
      }
    };

    get_jobs_data(this.jobs);

    for (const [index, job] of this.job_data) {
      const section = job.section;
      const ltx: XR_ini_file = job.ini_file || this.ltx;

      if (!ltx.line_exist(section, "active")) {
        abort("gulag: ltx=%s  no 'active' in section %s", this.ltx_name, section);
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
        job.alife_task = this.smart_alife_task as XR_CALifeSmartTerrainTask;
      }

      job.game_vertex_id = job.alife_task.game_vertex_id();
      job.level_id = game_graph().vertex(job.game_vertex_id).level_id();
      job.position = job.alife_task.position();
    }
  }

  /**
   * todo;
   */
  public update_jobs(): void {
    this.check_alarm();

    for (const [k, v] of this.arriving_npc) {
      if (arrived_to_smart(v, this)) {
        this.npc_info.set(v.id, this.fill_npc_info(v));

        this.dead_time = new LuaTable();

        this.select_npc_job(this.npc_info.get(v.id));

        this.arriving_npc.delete(k);
      }
    }

    table.sort(this.npc_info as any, (a: any, b: any) => a.job_prior < b.job_prior);

    for (const [k, v] of this.npc_info) {
      this.select_npc_job(v);
    }
  }

  /**
   * todo;
   */
  public select_npc_job(npcInfo: INpcInfo): void {
    // log.info("Select npc job:", this.name(), npc_info.se_obj.id);

    const [selected_job_id, selected_job_prior, selected_job_link] = job_iterator(this.jobs, npcInfo, 0, this);

    if (selected_job_id === null) {
      abort("Insufficient smart_terrain jobs: %s, %s, %s", this.name(), npcInfo.se_obj.id, this.sim_type);
    }

    if (selected_job_id !== npcInfo.job_id && selected_job_link !== null) {
      if (npcInfo.job_link !== null) {
        this.npc_by_job_section.delete(this.job_data.get(npcInfo.job_link.job_id).section);
        npcInfo.job_link.npc_id = null;
      }

      selected_job_link.npc_id = npcInfo.se_obj.id;
      this.npc_by_job_section.set(this.job_data.get(selected_job_link.job_id).section, selected_job_link.npc_id);

      npcInfo.job_id = selected_job_link.job_id;
      npcInfo.job_prior = selected_job_link._prior;
      npcInfo.begin_job = false;
      npcInfo.job_link = selected_job_link;

      const obj_storage = registry.objects.get(npcInfo.se_obj.id);

      if (obj_storage !== null) {
        switchToSection(obj_storage.object!, this.ltx, STRINGIFIED_NIL);
      }
    }

    if (npcInfo.begin_job !== true) {
      const job_data = this.job_data.get(npcInfo.job_id);

      logger.info("Begin job in gulag", this.name(), npcInfo.se_obj.name(), job_data.section);

      hardResetOfflineObject(npcInfo.se_obj.id);

      npcInfo.begin_job = true;

      const obj_storage = registry.objects.get(npcInfo.se_obj.id);

      if (obj_storage !== null) {
        this.setup_logic(obj_storage.object!);
      }
    }
  }

  /**
   * todo;
   */
  public setup_logic(object: XR_game_object): void {
    logger.info("Setup logic:", this.name(), object.name());

    const npc_data: INpcInfo = this.npc_info.get(object.id());
    const job = this.job_data.get(npc_data.job_id);
    const ltx = job.ini_file || this.ltx;
    const ltx_name = job.ini_path || this.ltx_name;

    configureObjectSchemes(object, ltx, ltx_name, npc_data.stype, job.section, job.prefix_name || this.name());

    const sect: TSection = determine_section_to_activate(object, ltx, job.section, registry.actor);

    if (getSchemeByIniSection(job.section) === STRINGIFIED_NIL) {
      abort("[smart_terrain %s] section=%s, don't use section 'null'!", this.name(), sect);
    }

    activateSchemeBySection(object, ltx, sect, job.prefix_name || this.name(), false);
  }

  /**
   * todo;
   */
  public getJob(objectId: TNumberId): Optional<ISmartTerrainJob> {
    return this.npc_info.get(objectId) && this.job_data.get(this.npc_info.get(objectId).job_id);
  }

  /**
   * todo;
   */
  public idNPCOnJob(jobName: TName): TNumberId {
    return this.npc_by_job_section.get(jobName);
  }

  /**
   * todo;
   */
  public switch_to_desired_job(object: XR_game_object): void {
    logger.info("Switch to desired job:", this.name(), object.name());

    const objectId: TNumberId = object.id();
    const objectInfo: INpcInfo = this.npc_info.get(objectId);
    const changingObjectId: TNumberId = this.npc_by_job_section.get(objectInfo.need_job);

    if (changingObjectId === null) {
      objectInfo.job_link = null;
      objectInfo.job_id = -1;
      objectInfo.job_prior = -1;
      this.select_npc_job(objectInfo);

      return;
    }

    if (this.npc_info.get(changingObjectId) === null) {
      objectInfo.job_link = null;
      objectInfo.job_id = -1;
      objectInfo.job_prior = -1;
      this.select_npc_job(objectInfo);

      return;
    }

    const desired_job = this.npc_info.get(changingObjectId).job_id;

    if (objectInfo.job_link !== null) {
      this.npc_by_job_section.delete(this.job_data.get(objectInfo.job_link.job_id).section);
      objectInfo.job_link.npc_id = null;
    }

    const selectedJobLink = this.npc_info.get(changingObjectId).job_link;

    selectedJobLink.npc_id = objectInfo.se_obj.id;

    this.npc_by_job_section.set(this.job_data.get(selectedJobLink.job_id).section, selectedJobLink.npc_id);

    objectInfo.job_id = selectedJobLink.job_id;
    objectInfo.job_prior = selectedJobLink._prior;
    objectInfo.begin_job = true;

    objectInfo.job_link = selectedJobLink;
    objectInfo.need_job = STRINGIFIED_NIL;

    const objectStorage = registry.objects.get(objectId);

    if (objectStorage !== null) {
      this.setup_logic(objectStorage.object!);
    }

    const changingObjectInfo: INpcInfo = this.npc_info.get(changingObjectId);

    changingObjectInfo.job_link = null;
    changingObjectInfo.job_id = -1;
    changingObjectInfo.job_prior = -1;

    this.select_npc_job(changingObjectInfo);
  }

  /**
   * todo;
   */
  public override STATE_Write(packet: XR_net_packet): void {
    super.STATE_Write(packet);

    setSaveMarker(packet, false, SmartTerrain.__name);

    let n = 0;

    for (const [k, v] of this.arriving_npc) {
      n = n + 1;
    }

    packet.w_u8(n);

    for (const [k, v] of this.arriving_npc) {
      packet.w_u16(k);
    }

    n = 0;

    for (const [k, v] of this.npc_info) {
      n = n + 1;
    }

    packet.w_u8(n);

    for (const [k, v] of this.npc_info) {
      packet.w_u16(k);
      packet.w_u8(v.job_prior);
      packet.w_u8(v.job_id);
      packet.w_bool(v.begin_job);
      packet.w_stringZ(v.need_job);
    }

    n = 0;

    for (const [k, v] of this.dead_time) {
      n = n + 1;
    }

    packet.w_u8(n);

    for (const [k, v] of this.dead_time) {
      packet.w_u8(k);
      writeCTimeToPacket(packet, v);
    }

    if (this.base_on_actor_control !== null) {
      packet.w_bool(true);
      this.base_on_actor_control.save(packet);
    } else {
      packet.w_bool(false);
    }

    if (this.respawn_point) {
      packet.w_bool(true);

      n = 0;
      for (const [k, v] of this.already_spawned) {
        n = n + 1;
      }

      packet.w_u8(n);

      for (const [k, v] of this.already_spawned) {
        packet.w_stringZ(k);
        packet.w_u8(v.num);
      }

      if (this.last_respawn_update !== null) {
        packet.w_bool(true);
        writeCTimeToPacket(packet, this.last_respawn_update);
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
   * todo;
   */
  public override STATE_Read(packet: XR_net_packet, size: number): void {
    super.STATE_Read(packet, size);

    if (editor()) {
      return;
    }

    setLoadMarker(packet, false, SmartTerrain.__name);
    this.read_params();

    let n = packet.r_u8();

    this.arriving_npc = new LuaTable();

    for (const it of $range(1, n)) {
      const id = packet.r_u16();

      this.arriving_npc.set(id, false);
    }

    n = packet.r_u8();
    this.npc_info = new LuaTable();

    for (const it of $range(1, n)) {
      const id = packet.r_u16();

      const npc_info: INpcInfo = {} as INpcInfo;

      this.npc_info.set(id, npc_info);

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
    this.dead_time = new LuaTable();

    for (const it of $range(1, n)) {
      const job_id = packet.r_u8();
      const dead_time = readCTimeFromPacket(packet)!;

      this.dead_time.set(job_id, dead_time);
    }

    this.need_init_npc = true;

    if (this.script_version > 9) {
      if (packet.r_bool() === true) {
        this.base_on_actor_control.load(packet);
      }
    }

    const respawn_point = packet.r_bool();

    if (respawn_point) {
      n = packet.r_u8();
      for (const it of $range(1, n)) {
        const id = packet.r_stringZ();
        const num = packet.r_u8();

        this.already_spawned.get(id).num = num;
      }

      if (this.script_version > 11) {
        const exist: boolean = packet.r_bool();

        if (exist) {
          this.last_respawn_update = readCTimeFromPacket(packet);
        } else {
          this.last_respawn_update = null;
        }
      }
    }

    this.population = packet.r_u8();
    setLoadMarker(packet, true, SmartTerrain.__name);
  }

  /**
   * todo;
   */
  public init_npc_after_load(): void {
    logger.info("Init npc after load:", this.name());

    const find_job = (jobs: LuaTable<number>, npc_info: INpcInfo) => {
      for (const [k, v] of jobs) {
        if (v.jobs !== null) {
          find_job(v.jobs, npc_info);
        } else {
          if (v.job_id === npc_info.job_id) {
            npc_info.job_link = v;
            v.npc_id = npc_info.se_obj.id;

            return;
          }
        }
      }
    };

    const sim = alife();

    for (const [k, v] of this.arriving_npc!) {
      const sobj = sim.object(k);

      if (sobj !== null) {
        this.arriving_npc.set(k, sobj);
      } else {
        this.arriving_npc.delete(k);
      }
    }

    for (const [k, v] of this.npc_info) {
      const sobj = sim.object(k) as XR_cse_alife_creature_abstract;

      if (sobj !== null) {
        const npc_info = this.fill_npc_info(sobj);

        npc_info.job_prior = v.job_prior;
        npc_info.job_id = v.job_id;
        npc_info.begin_job = v.begin_job;
        npc_info.need_job = v.need_job;

        find_job(this.jobs, npc_info);

        this.npc_info.set(k, npc_info);

        if (npc_info.job_link !== null) {
          this.npc_by_job_section.set(this.job_data.get(npc_info.job_link.job_id).section, k);
        }
      } else {
        this.npc_info.delete(k);
      }
    }
  }

  /**
   * todo;
   */
  public get_smart_props(): string {
    let props: Optional<string> = get_smart_terrain_name(this);

    if (props === null || gameConfig.DEBUG.IS_SMARTS_DEBUG_ENABLED) {
      props =
        this.name() +
        "  [" +
        this.id +
        "]\\n" +
        this.sim_type +
        "\\n" +
        "squad_id = " +
        tostring(this.id) +
        "\\n" +
        "capacity = " +
        tostring(this.max_population) +
        " (" +
        SimulationBoardManager.getInstance().get_smart_population(this) +
        ")\\n";

      if (this.respawn_point !== null && this.already_spawned !== null) {
        props = props + "\\nalready_spawned :\n";
        for (const [k, v] of this.already_spawned) {
          props =
            props +
            "[" +
            k +
            "] = " +
            v.num +
            "(" +
            pickSectionFromCondList(registry.actor, null, this.respawn_params.get(k).num as any) +
            ")\\n";
        }

        if (this.last_respawn_update) {
          props =
            props +
            "\\ntime_to_spawn:" +
            tostring(RESPAWN_IDLE - game.get_game_time().diffSec(this.last_respawn_update)) +
            "\\n";
        }
      }

      for (const [k, v] of SimulationBoardManager.getInstance().smarts.get(this.id).squads) {
        props = props + tostring(v.id) + "\\n";
      }
    }

    return props;
  }

  /**
   * todo;
   */
  public show(): void {
    const time: TTimestamp = time_global();

    if (this.showtime !== null && this.showtime + 200 >= time) {
      return;
    }

    this.showtime = time;

    let spot = "neutral";

    if (
      this.sim_avail === null ||
      pickSectionFromCondList(registry.actor, this, this.sim_avail as any) === STRINGIFIED_TRUE
    ) {
      spot = "friend";
    } else {
      spot = "enemy";
    }

    if (this.smrt_showed_spot === spot) {
      level.map_change_spot_hint(
        this.id,
        "alife_presentation_smart_" + this.sim_type + "_" + this.smrt_showed_spot,
        this.get_smart_props()
      );

      return;
    }

    if (gameConfig.DEBUG.IS_SMARTS_DEBUG_ENABLED) {
      if (this.smrt_showed_spot !== null) {
        level.map_remove_object_spot(
          this.id,
          "alife_presentation_smart_" + this.sim_type + "_" + this.smrt_showed_spot
        );
      }

      level.map_add_object_spot(
        this.id,
        "alife_presentation_smart_" + this.sim_type + "_" + spot,
        this.get_smart_props()
      );
      this.smrt_showed_spot = spot;
    } else {
      if (
        this.smrt_showed_spot !== null &&
        level.map_has_object_spot(
          this.id,
          "alife_presentation_smart_" + this.sim_type + "_" + this.smrt_showed_spot
        ) !== 0
      ) {
        level.map_remove_object_spot(this.id, "alife_presentation_smart_base_" + this.smrt_showed_spot);
      }
    }
  }

  /**
   * todo;
   */
  public refresh(): void {
    this.show();
  }

  /**
   * todo;
   */
  public hide(): void {
    if (this.smrt_showed_spot === null) {
      return;
    }

    level.map_remove_object_spot(this.id, "alife_presentation_smart_" + this.sim_type + "_" + this.smrt_showed_spot);
  }

  /**
   * todo;
   */
  public override update(): void {
    super.update();

    if (gameConfig.DEBUG.IS_SMARTS_DEBUG_ENABLED) {
      this.refresh();
    }

    const current_time = time_global();

    if (areObjectsOnSameLevel(this, alife().actor())) {
      const dist_to_actor = this.position.distance_to(alife().actor()!.position);
      const old_dist_to_actor =
        (nearest_to_actor_smart.id === null && nearest_to_actor_smart.dist) ||
        alife().object(nearest_to_actor_smart.id!)!.position.distance_to(alife().actor().position);

      if (dist_to_actor < old_dist_to_actor) {
        nearest_to_actor_smart.id = this.id;
        nearest_to_actor_smart.dist = dist_to_actor;
      }
    }

    if (this.respawn_params !== null) {
      this.try_respawn();
    }

    if (this.check_time !== null && current_time < this.check_time) {
      return;
    }

    if (is_only_monsters_on_jobs(this.npc_info) && this.campfires_on) {
      turn_off_campfires_by_smart_name(this.name());
      this.campfires_on = false;
    } else if (!is_only_monsters_on_jobs(this.npc_info) && !this.campfires_on) {
      turn_on_campfires_by_smart_name(this.name());
      this.campfires_on = true;
    }

    const actor = registry.actor;

    if (actor !== null) {
      const distance = actor.position().distance_to_sqr(this.position);
      const idle_time = math.max(60, 0.003 * distance);

      this.check_time = current_time + idle_time;
    } else {
      this.check_time = current_time + 10;
    }

    const current_game_time = game.get_game_time();

    for (const [k, v] of this.dead_time) {
      if (current_game_time.diffSec(v) >= DEATH_IDLE_TIME) {
        this.dead_time.delete(k);
      }
    }

    this.update_jobs();

    if (this.base_on_actor_control !== null) {
      this.base_on_actor_control.update();
    }

    getSimulationObjectsRegistry().update_avaliability(this);
  }

  /**
   * todo;
   */
  public set_alarm(): void {
    this.smart_alarm_time = game.get_game_time();
  }

  /**
   * todo;
   */
  public check_alarm(): void {
    if (this.smart_alarm_time === null) {
      return;
    }

    if (game.get_game_time().diffSec(this.smart_alarm_time) > ALARM_TIMEOUT) {
      this.smart_alarm_time = null;
    }
  }

  /**
   * todo;
   */
  public get_location(): LuaMultiReturn<[XR_vector, number, number]> {
    return $multi(this.position, this.m_level_vertex_id, this.m_game_vertex_id);
  }

  /**
   * todo;
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

    return squad.always_arrived || squad_pos.distance_to_sqr(target_pos) <= this.arrive_dist * this.arrive_dist;
  }

  /**
   * todo;
   */
  public on_after_reach(squad: Squad): void {
    for (const k of squad.squad_members()) {
      const obj = k.object;

      squad.board.setup_squad_and_group(obj);
    }

    squad.current_target_id = this.id;
  }

  /**
   * todo;
   */
  public on_reach_target(squad: Squad): void {
    squad.set_location_types(this.name());
    this.board.assign_squad_to_smart(squad, this.id);

    for (const it of squad.squad_members()) {
      softResetOfflineObject(it.id);
    }
  }

  /**
   * todo;
   */
  public get_alife_task(): Optional<XR_CALifeSmartTerrainTask> {
    return this.smart_alife_task;
  }

  /**
   * todo;
   */
  public evaluate_prior(squad: Squad): number {
    return evaluate_prior(this, squad);
  }

  /**
   * todo;
   */
  public check_respawn_params(respawn_params: any): void {
    this.respawn_params = new LuaTable();
    this.already_spawned = new LuaTable();
    this.respawn_point = true;

    if (!this.ini.section_exist(respawn_params)) {
      abort("Wrong smatr_terrain respawn_params section [%s](there is no section)", respawn_params);
    }

    const n = this.ini.line_count(respawn_params);

    if (n === 0) {
      abort("Wrong smatr_terrain respawn_params section [%s](empty params)", respawn_params);
    }

    for (const j of $range(0, n - 1)) {
      const [result, prop_name, prop_condlist] = this.ini.r_line(respawn_params, j, "", "");

      if (!this.ini.section_exist(prop_name)) {
        abort(
          "Wrong smatr_terrain respawn_params section [%s] prop [%s](there is no section)",
          respawn_params,
          prop_name
        );
      }

      const spawn_squads = getConfigString(this.ini, prop_name, "spawn_squads", this, false, "", null);
      const spawn_num = getConfigString(this.ini, prop_name, "spawn_num", this, false, "", null);

      if (spawn_squads === null) {
        abort(
          "Wrong smatr_terrain respawn_params section [%s] prop [%s] line [spawn_squads](there is no line)",
          respawn_params,
          prop_name
        );
      } else if (spawn_num === null) {
        abort(
          "Wrong smatr_terrain respawn_params section [%s] prop [%s] line [spawn_num](there is no line)",
          respawn_params,
          prop_name
        );
      }

      this.respawn_params.set(prop_name, {} as any);
      this.already_spawned.set(prop_name, {} as any);

      this.respawn_params.get(prop_name).squads = parseNames(spawn_squads);
      this.respawn_params.get(prop_name).num = parseConditionsList(spawn_num);
      this.already_spawned.get(prop_name).num = 0;
    }
  }

  /**
   * todo;
   */
  public call_respawn(): void {
    logger.info("Call respawn:", this.name());

    const available_sects: LuaTable<number> = new LuaTable();

    for (const [k, v] of this.respawn_params) {
      if (tonumber(pickSectionFromCondList(registry.actor, null, v.num as any))! > this.already_spawned.get(k).num) {
        table.insert(available_sects, k);
      }
    }

    if (available_sects.length() > 0) {
      const sect_to_spawn = available_sects.get(math.random(1, available_sects.length()));
      const sect_to_spawn_params: any = this.respawn_params.get(sect_to_spawn);
      let squad = sect_to_spawn_params.squads[math.random(1, (sect_to_spawn_params.squads as LuaTable).length())];

      squad = this.board.create_squad(this, squad);
      squad.respawn_point_id = this.id;
      squad.respawn_point_prop_section = sect_to_spawn;

      this.board.enter_smart(squad, this.id);

      for (const it of squad.squad_members() as LuaIterable<any>) {
        this.board.setup_squad_and_group(it.object);
      }

      this.already_spawned.get(sect_to_spawn).num = this.already_spawned.get(sect_to_spawn).num + 1;
    }
  }

  /**
   * todo;
   */
  public try_respawn(): void {
    const curr_time = game.get_game_time();

    if (this.last_respawn_update === null || curr_time.diffSec(this.last_respawn_update) > RESPAWN_IDLE) {
      this.last_respawn_update = curr_time;

      if (this.sim_avail !== null && pickSectionFromCondList(registry.actor, this, this.sim_avail as any) !== "true") {
        return;
      }

      const squad_count = smart_terrain_squad_count(this.board.smarts.get(this.id).squads);

      if (this.max_population <= squad_count) {
        logger.info("%s cannot respawn due to squad_count %s of %s", this.name(), this.max_population, squad_count);

        return;
      }

      const dist_to_actor = alife().actor().position.distance_to_sqr(this.position);

      if (dist_to_actor < (RESPAWN_RADIUS && RESPAWN_RADIUS)) {
        logger.info("%s cannot respawn due to distance", this.name());

        return;
      }

      this.call_respawn();
    }
  }

  /**
   * todo;
   */
  public sim_available(): boolean {
    return !(this.base_on_actor_control !== null && this.base_on_actor_control.status !== ESmartTerrainStatus.NORMAL);
  }

  /**
   * todo;
   */
  public target_precondition(squad: Squad, need_to_dec_population?: boolean): boolean {
    if (this.respawn_only_smart) {
      return false;
    }

    let squad_count = smart_terrain_squad_count(this.board.smarts.get(this.id).squads);

    if (need_to_dec_population) {
      squad_count = squad_count - 1;
    }

    if (squad_count !== null && this.max_population <= squad_count) {
      return false;
    }

    const squad_params = simulation_activities[squad.player_id!];

    if (squad_params === null || squad_params.smart === null) {
      return false;
    }

    if (tonumber(this.props["resource"])! > 0) {
      const smart_params = squad_params.smart.resource;

      if (smart_params !== null && smart_params!.prec(squad, this)) {
        return true;
      }
    }

    if (tonumber(this.props["base"])! > 0) {
      const smart_params = squad_params.smart.base;

      if (smart_params !== null && smart_params!.prec(squad, this)) {
        return true;
      }
    }

    if (tonumber(this.props["lair"])! > 0) {
      const smart_params = squad_params.smart.lair;

      if (smart_params !== null && smart_params!.prec(squad, this)) {
        return true;
      }
    }

    if (tonumber(this.props["territory"])! > 0) {
      const smart_params = squad_params.smart.territory;

      if (smart_params !== null && smart_params!.prec(squad, this)) {
        return true;
      }
    }

    if (tonumber(this.props["surge"])! > 0) {
      const smart_params = squad_params.smart.surge;

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
export function setup_gulag_and_logic_on_spawn(
  obj: XR_game_object,
  st: IRegistryObjectState,
  sobject: any,
  stype: ESchemeType,
  loaded: boolean
): void {
  logger.info("Setup gulag logic on spawn:", obj.name(), stype);

  const sim = alife();

  sobject = alife()!.object(obj.id());

  if (sim !== null && sobject !== null) {
    const strn_id = sobject.m_smart_terrain_id;

    if (strn_id !== null && strn_id !== MAX_UNSIGNED_16_BIT) {
      const strn: SmartTerrain = sim.object(strn_id) as SmartTerrain;
      const need_setup_logic = !loaded && strn.npc_info.get(obj.id()) && strn.npc_info.get(obj.id()).begin_job === true;

      if (need_setup_logic) {
        strn.setup_logic(obj);
      } else {
        initializeGameObject(obj, st, loaded, registry.actor, stype);
      }
    } else {
      initializeGameObject(obj, st, loaded, registry.actor, stype);
    }
  } else {
    initializeGameObject(obj, st, loaded, registry.actor, stype);
  }
}

/**
 * todo;
 */
function smart_terrain_squad_count(board_smart_squads: LuaTable<number, Squad>): number {
  let count = 0;

  for (const [k, v] of board_smart_squads) {
    if ((v as any).get_script_target() !== null) {
      count = count + 1;
    }
  }

  return count;
}

/**
 * todo;
 */
function job_avail_to_npc(npc_info: INpcInfo, job_info: any, smart: SmartTerrain): boolean {
  if (smart.dead_time.get(job_info.job_id) !== null) {
    return false;
  }

  if (job_info._precondition_is_monster !== null && job_info._precondition_is_monster !== npc_info.is_monster) {
    return false;
  }

  if (job_info._precondition_function !== null) {
    if (
      !(job_info._precondition_function as AnyCallable)(npc_info.se_obj, smart, job_info._precondition_params, npc_info)
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
  npc_data: INpcInfo,
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

    if (job_avail_to_npc(npc_data, v, smart)) {
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
function arrived_to_smart(obj: XR_cse_alife_creature_abstract, smart: SmartTerrain): boolean {
  const st = registry.objects.get(obj.id);

  let obj_gv;
  let obj_pos;

  if (st === null) {
    obj_gv = game_graph().vertex(obj.m_game_vertex_id);
    obj_pos = obj.position;
  } else {
    const it = registry.objects.get(obj.id).object!;

    obj_gv = game_graph().vertex(it.game_vertex_id());
    obj_pos = it.position();
  }

  const smart_gv: XR_GameGraph__CVertex = game_graph().vertex(smart.m_game_vertex_id);

  if (obj.group_id !== null) {
    const squad = smart.board.squads.get(obj.group_id);

    if (squad !== null && squad.current_action) {
      if (squad.current_action.name === "reach_target") {
        const squad_target = getSimulationObjectsRegistry().objects.get(squad.assigned_target_id!);

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

  if (obj_gv.level_id() === smart_gv.level_id()) {
    return obj_pos.distance_to_sqr(smart.position) <= 10000;
  } else {
    return false;
  }
}

/**
 * todo;
 */
function is_only_monsters_on_jobs(objectInfos: LuaArray<INpcInfo>): boolean {
  for (const [index, objectInfo] of objectInfos) {
    if (objectInfo.is_monster === false) {
      return false;
    }
  }

  return true;
}

/**
 * todo;
 */
export function on_death(object: XR_cse_alife_creature_abstract): void {
  const simulator: XR_alife_simulator = alife();

  if (simulator !== null) {
    object = simulator.object(object.id) as XR_cse_alife_creature_abstract;

    if (object === null) {
      return;
    }

    const smartTerrainId: TNumberId = object.smart_terrain_id();

    if (smartTerrainId !== MAX_UNSIGNED_16_BIT) {
      logger.info("Clear dead object:", object.name());
      (simulator.object(smartTerrainId) as SmartTerrain).clear_dead(object);
    }
  }
}
