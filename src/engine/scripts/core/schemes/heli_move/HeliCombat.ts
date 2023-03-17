import {
  level,
  system_ini,
  time_global,
  vector,
  XR_CHelicopter,
  XR_game_object,
  XR_ini_file,
  XR_net_packet,
  XR_reader,
  XR_vector,
} from "xray16";

import { STRINGIFIED_NIL } from "@/engine/lib/constants/lua";
import { Optional } from "@/engine/lib/types";
import { getIdBySid, IRegistryObjectState, registry } from "@/engine/scripts/core/database";
import { get_heli_health } from "@/engine/scripts/core/schemes/heli_move/heli_utils";
import { isLevelChanging } from "@/engine/scripts/utils/check/check";
import { setLoadMarker, setSaveMarker } from "@/engine/scripts/utils/game_save";
import { randomChoice } from "@/engine/scripts/utils/general";
import { pickSectionFromCondList } from "@/engine/scripts/utils/ini_config/config";
import { getConfigBoolean, getConfigNumber, getConfigString } from "@/engine/scripts/utils/ini_config/getters";
import { LuaLogger } from "@/engine/scripts/utils/logging";
import { parseConditionsList, TConditionList } from "@/engine/scripts/utils/parse";
import { distanceBetween2d } from "@/engine/scripts/utils/physics";

const logger: LuaLogger = new LuaLogger($filename);

const combat_type_flyby = 0;
const combat_type_round = 1;
const combat_type_search = 2;
const combat_type_retreat = 3;

const flyby_state_to_attack_dist = 0;
const flyby_state_to_enemy = 1;

const combat_type_change_delay = 5000;
const visibility_delay = 3000;
const search_shoot_delay = 2000;
const round_shoot_delay = 2000;
const dummy_vector = new vector();

export class HeliCombat {
  public readonly object: XR_game_object;
  public readonly heliObject: XR_CHelicopter;
  public readonly st: IRegistryObjectState;

  public initialized: boolean;
  public retreat_initialized: boolean = false;

  public flyby_initialized: boolean = false;
  public round_initialized: boolean = false;
  public search_initialized: boolean = false;
  public was_callback!: boolean;
  public state_initialized!: boolean;

  public level_max_y: number;

  public flyby_attack_dist: number;
  public search_attack_dist: number;
  public default_velocity: number;
  public search_velocity: number;
  public round_velocity: number;
  public m_max_mgun_dist: number;
  public default_safe_altitude: number;
  public vis_threshold: number;
  public vis_inc: number;
  public vis_dec: number;
  public vis: number;
  public vis_next_time: number;
  public vis_time_quant: number;

  public max_velocity!: number;
  public safe_altitude!: number;

  public forget_timeout: number;
  public flame_start_health: number;

  public attack_before_retreat: boolean;
  public enemy_forgetable: boolean;
  public section_changed: boolean;
  public can_forget_enemy!: boolean;
  public change_combat_type_allowed!: boolean;
  public flyby_states_for_one_pass!: number;
  public round_begin_shoot_time: Optional<number> = null;

  public combat_use_rocket!: boolean;
  public combat_use_mgun!: boolean;
  public combat_ignore!: Optional<TConditionList>;

  public combat_type!: number;
  public enemy_id: Optional<number> = null;
  public enemy: Optional<XR_game_object> = null;
  public enemy_last_seen_pos: Optional<XR_vector> = null;
  public enemy_last_seen_time: Optional<number> = null;
  public enemy_last_spot_time: Optional<number> = null;
  public change_combat_type_time: Optional<number> = null;
  public flight_direction!: boolean;
  public center_pos!: XR_vector;
  public speed_is_0!: boolean;

  public change_dir_time!: number;
  public change_pos_time!: number;
  public change_speed_time!: number;

  public search_begin_shoot_time: Optional<number> = null;

  public state!: number;

  public constructor(object: XR_game_object, heliObject: XR_CHelicopter) {
    this.st = registry.objects.get(object.id());
    this.object = object;
    this.heliObject = heliObject;
    this.initialized = false;

    this.level_max_y = level.get_bounding_volume().max.y;

    const ltx: XR_ini_file = system_ini();

    this.flyby_attack_dist = getConfigNumber(ltx, "helicopter", "flyby_attack_dist", this.object, true);
    this.search_attack_dist = getConfigNumber(ltx, "helicopter", "search_attack_dist", this.object, true);
    this.default_safe_altitude =
      getConfigNumber(ltx, "helicopter", "safe_altitude", this.object, true) + this.level_max_y;
    this.m_max_mgun_dist = getConfigNumber(ltx, "helicopter", "max_mgun_attack_dist", this.object, true);

    this.default_velocity = getConfigNumber(ltx, "helicopter", "velocity", this.object, true);
    this.search_velocity = getConfigNumber(ltx, "helicopter", "search_velocity", this.object, true);
    this.round_velocity = getConfigNumber(ltx, "helicopter", "round_velocity", this.object, true);

    this.vis_time_quant = getConfigNumber(ltx, "helicopter", "vis_time_quant", this.object, true);
    this.vis_threshold = getConfigNumber(ltx, "helicopter", "vis_threshold", this.object, true);
    this.vis_inc = getConfigNumber(ltx, "helicopter", "vis_inc", this.object, true) * this.vis_time_quant * 0.001;
    this.vis_dec = getConfigNumber(ltx, "helicopter", "vis_dec", this.object, true) * this.vis_time_quant * 0.001;
    this.vis = 0;
    this.vis_next_time = 0;

    this.forget_timeout = getConfigNumber(ltx, "helicopter", "forget_timeout", this.object, true) * 1000;

    this.flame_start_health = getConfigNumber(ltx, "helicopter", "flame_start_health", this.object, true);

    this.attack_before_retreat = false;
    this.enemy_forgetable = true;
    this.section_changed = false;
  }

  public read_custom_data(ini: XR_ini_file, section: string): void {
    this.combat_use_rocket = getConfigBoolean(ini, section, "combat_use_rocket", this.object, false, true);
    this.combat_use_mgun = getConfigBoolean(ini, section, "combat_use_mgun", this.object, false, true);

    const combat_ignore: Optional<string> = getConfigString(
      ini,
      section,
      "combat_ignore",
      this.object,
      false,
      "",
      null
    );

    if (combat_ignore !== null) {
      this.combat_ignore = parseConditionsList(this.object, section, "combat_ignore", combat_ignore);
    } else {
      this.combat_ignore = null;
    }

    const combat_enemy: Optional<string> = getConfigString(ini, section, "combat_enemy", this.object, false, "", null);

    this.set_enemy_from_custom_data(combat_enemy);
    this.max_velocity = getConfigNumber(ini, section, "combat_velocity", this.object, false, this.default_velocity);
    this.safe_altitude =
      getConfigNumber(ini, section, "combat_safe_altitude", this.object, false, this.default_safe_altitude) +
      this.level_max_y;

    this.section_changed = true;
  }

  public set_enemy_from_custom_data(combat_enemy: Optional<string>): void {
    if (combat_enemy === null) {
      this.enemy_forgetable = true;
    } else {
      if (combat_enemy === "actor") {
        if (registry.actor !== null) {
          this.enemy_id = registry.actor.id();
        } else {
          this.forget_enemy();
        }
      } else if (combat_enemy === STRINGIFIED_NIL) {
        this.forget_enemy();
      } else {
        this.enemy_id = getIdBySid(tonumber(combat_enemy)!);
      }

      if (this.enemy_id) {
        this.enemy_forgetable = false;
        this.initialized = false;
      } else {
        this.enemy_forgetable = true;
        this.forget_enemy();
      }
    }
  }

  public set_combat_type(new_combat_type: number): void {
    if (new_combat_type !== this.combat_type) {
      this.flyby_initialized = false;
      this.round_initialized = false;
      this.search_initialized = false;

      this.combat_type = new_combat_type;
    }
  }

  public initialize(): void {
    this.enemy_last_seen_pos = this.enemy!.position();
    this.enemy_last_seen_time = 0;
    this.enemy_last_spot_time = null;
    this.can_forget_enemy = false;
    this.section_changed = true;

    this.combat_type = combat_type_flyby;
    this.change_combat_type_time = null;
    this.change_combat_type_allowed = true;

    this.heliObject.m_max_mgun_dist = this.m_max_mgun_dist;

    this.flyby_states_for_one_pass = 2;

    this.object.set_fastcall(this.fastcall, this);

    this.initialized = true;
  }

  public save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, HeliCombat.name);

    if (isLevelChanging()) {
      packet.w_bool(false);
      setSaveMarker(packet, true, HeliCombat.name);

      return;
    }

    packet.w_bool(this.initialized);

    if (this.initialized) {
      const t = time_global();

      packet.w_s16(this.enemy_id!);
      packet.w_u32(t - this.enemy_last_seen_time!);
      packet.w_bool(this.can_forget_enemy);
      packet.w_bool(this.enemy_forgetable);
      packet.w_vec3(this.enemy_last_seen_pos!);

      packet.w_u8(this.combat_type);

      if (this.combat_type === combat_type_search) {
        packet.w_u32(this.change_dir_time! - t);
        packet.w_u32(this.change_pos_time! - t);
        packet.w_bool(this.flight_direction);
        packet.w_vec3(this.center_pos);
      } else if (this.combat_type === combat_type_flyby) {
        packet.w_s16(this.flyby_states_for_one_pass);
      }
    }

    setSaveMarker(packet, true, HeliCombat.name);
  }

  public load(reader: XR_reader): void {
    setLoadMarker(reader, false, HeliCombat.name);

    this.initialized = reader.r_bool();

    if (this.initialized) {
      const t = time_global();

      this.enemy_last_seen_pos = new vector();

      this.enemy_id = reader.r_s16();
      this.enemy_last_seen_time = t - reader.r_u32();
      this.can_forget_enemy = reader.r_bool();
      this.enemy_forgetable = reader.r_bool();
      reader.r_vec3(this.enemy_last_seen_pos);
      this.combat_type = reader.r_u8();

      if (this.combat_type === combat_type_search) {
        this.center_pos = new vector();

        this.change_dir_time = reader.r_u32() + t;
        this.change_pos_time = reader.r_u32() + t;
        this.flight_direction = reader.r_bool();
        reader.r_vec3(this.center_pos);
      } else if (this.combat_type === combat_type_flyby) {
        this.flyby_states_for_one_pass = reader.r_s16();
      }
    }

    setLoadMarker(reader, true, HeliCombat.name);
  }

  public waypoint_callback(): boolean {
    if (this.enemy_id && !this.combat_ignore_check()) {
      this.was_callback = true;

      return true;
    } else {
      return false;
    }
  }

  public update_custom_data_settings(): void {
    if (this.section_changed) {
      this.heliObject.m_use_rocket_on_attack = this.combat_use_rocket;
      this.heliObject.m_use_mgun_on_attack = this.combat_use_mgun;

      if (this.combat_type === combat_type_flyby) {
        this.heliObject.SetMaxVelocity(this.max_velocity);
      }

      this.section_changed = false;
    }
  }

  public update_enemy_visibility(): boolean {
    this.object.info_add("vis=" + this.vis);

    if (this.vis >= this.vis_threshold) {
      this.enemy_last_seen_time = time_global();
      this.enemy_last_seen_pos = this.enemy!.position();

      return true;
    } else {
      return false;
    }
  }

  public forget_enemy(): void {
    this.enemy_id = null;
    this.enemy = null;

    this.initialized = false;
  }

  public update_forgetting(): void {
    if (
      (this.enemy_forgetable &&
        this.can_forget_enemy &&
        time_global() - this.enemy_last_seen_time! > this.forget_timeout) ||
      !this.enemy!.alive()
    ) {
      this.forget_enemy();
    }
  }

  public update_combat_type(see_enemy?: boolean): void {
    let ct = this.combat_type;

    if (this.combat_type === combat_type_flyby) {
      if (this.flyby_states_for_one_pass <= 0) {
        if (this.attack_before_retreat) {
          ct = combat_type_retreat;
        } else {
          ct = combat_type_round;
        }
      }
    } else if (this.combat_type === combat_type_round) {
      if (see_enemy) {
        if (distanceBetween2d(this.object.position(), this.enemy!.position()) > this.flyby_attack_dist + 70) {
          // --               not this.flyby_pass_finished
          ct = combat_type_flyby;
        }
      } else {
        ct = combat_type_search;
      }

      if (get_heli_health(this.heliObject, this.st) < this.flame_start_health) {
        this.attack_before_retreat = true;

        this.heliObject.m_use_rocket_on_attack = true;

        ct = combat_type_flyby;
      }
    } else if (this.combat_type === combat_type_search) {
      if (see_enemy) {
        if (distanceBetween2d(this.object.position(), this.enemy!.position()) > this.flyby_attack_dist) {
          ct = combat_type_flyby;
        } else {
          ct = combat_type_round;
        }
      }

      if (get_heli_health(this.heliObject, this.st) < this.flame_start_health) {
        this.attack_before_retreat = true;

        this.heliObject.m_use_rocket_on_attack = true;

        ct = combat_type_flyby;
      }
    }

    this.set_combat_type(ct);
  }

  public combat_ignore_check(): boolean {
    return (
      this.combat_ignore !== null && pickSectionFromCondList(registry.actor, this.object, this.combat_ignore) !== null
    );
  }

  public fastcall(): boolean {
    if (this.initialized) {
      if (this.vis_next_time < time_global()) {
        this.vis_next_time = time_global() + this.vis_time_quant;

        if (this.heliObject.isVisible(this.enemy!)) {
          this.vis = this.vis + this.vis_inc;

          if (this.vis > 100) {
            this.vis = 100;
          }
        } else {
          this.vis = this.vis - this.vis_dec;

          if (this.vis < 0) {
            this.vis = 0;
          }
        }
      }

      return false;
    } else {
      return true;
    }
  }

  public update(): boolean {
    if (this.enemy_id) {
      this.enemy = level.object_by_id(this.enemy_id);
      if (!this.enemy) {
        this.forget_enemy();

        return false;
      }
    } else {
      return false;
    }

    if (this.combat_ignore_check()) {
      return false;
    }

    this.update_custom_data_settings();

    if (!this.initialized) {
      this.initialize();
    }

    const see_enemy = this.update_enemy_visibility();

    this.update_combat_type(see_enemy);
    // -- FIXME
    // --    this.heliObject.GetSpeedInDestPoint(0)

    if (this.combat_type === combat_type_search) {
      this.search_update(see_enemy);
    } else if (this.combat_type === combat_type_round) {
      this.round_update(see_enemy);
    } else if (this.combat_type === combat_type_flyby) {
      this.flyby_update(see_enemy);
    } else if (this.combat_type === combat_type_retreat) {
      this.retreat_update();
    }

    this.update_forgetting();

    return true;
  }

  public calc_position_in_radius(r: number): XR_vector {
    const p = this.object.position();

    p.y = 0;

    const v = this.heliObject.GetCurrVelocityVec();

    v.y = 0;
    v.normalize();

    const o = this.enemy_last_seen_pos!;

    o.y = 0;

    const ret = cross_ray_circle(p, v, o, r);

    ret.y = this.safe_altitude;

    return ret;
  }

  public round_initialize(): void {
    this.change_dir_time = 0;
    this.change_pos_time = 0;
    this.center_pos = this.enemy_last_seen_pos!;
    this.flight_direction = randomChoice(true, false);
    this.change_combat_type_allowed = true;
    this.round_begin_shoot_time = 0;

    this.heliObject.SetMaxVelocity(this.round_velocity);
    this.heliObject.SetSpeedInDestPoint(this.round_velocity);
    this.heliObject.UseFireTrail(false);

    this.round_initialized = true;

    this.round_setup_flight(this.flight_direction!);
  }

  public round_setup_flight(direction: boolean): void {
    this.center_pos = this.enemy_last_seen_pos!;
    this.center_pos.y = this.safe_altitude;

    this.heliObject.GoPatrolByRoundPath(this.center_pos, this.search_attack_dist, direction);
    this.heliObject.LookAtPoint(this.enemy!.position(), true);
  }

  public round_update_shooting(see_enemy: boolean): void {
    if (see_enemy) {
      if (this.round_begin_shoot_time) {
        if (this.round_begin_shoot_time < time_global()) {
          this.heliObject.SetEnemy(this.enemy);
        }
      } else {
        this.round_begin_shoot_time = time_global() + round_shoot_delay;
      }
    } else {
      this.heliObject.ClearEnemy();

      this.round_begin_shoot_time = null;
    }
  }

  public round_update_flight(see_enemy: boolean): void {
    // -- ������ ����� �� ������� ����������� �����
    /* --[[    if this.change_dir_time < time_global() {
        const t

        if see_enemy {
          t = math.random( 6000, 10000 )
        else
          t = math.random( 15000, 20000 )
        }

        this.change_dir_time = time_global() + t // --+ 1000000

        printf( "heli_combat: going by round path, t=%d", t )

        this.flight_direction = not this.flight_direction
        this:round_setup_flight( this.flight_direction )

        return
      }
    ]]*/
    // -- ������������ ��������, �� ������������ �� ���� � ���������� �� � �������� ��������
    if (this.change_pos_time < time_global()) {
      this.change_pos_time = time_global() + 2000;

      if (
        !this.can_forget_enemy &&
        distanceBetween2d(this.object.position(), this.enemy_last_seen_pos!) <= this.search_attack_dist
      ) {
        this.can_forget_enemy = true;
      }

      if (distanceBetween2d(this.center_pos, this.enemy_last_seen_pos!) > 10) {
        this.round_setup_flight(this.flight_direction);
      }
    }
  }

  public round_update(see_enemy: boolean): void {
    if (!this.round_initialized) {
      this.round_initialize();
    }

    // --    printf( "heli_combat: round_update" )

    this.round_update_shooting(see_enemy);
    this.round_update_flight(see_enemy);
  }

  public search_initialize(): void {
    this.change_speed_time = time_global() + math.random(5000, 7000);
    this.speed_is_0 = true;

    this.change_pos_time = 0;
    this.center_pos = this.enemy_last_seen_pos!;

    this.flight_direction = randomChoice(true, false);
    this.change_combat_type_allowed = true;
    this.search_begin_shoot_time = 0;

    this.heliObject.UseFireTrail(false);

    this.search_initialized = true;

    this.search_setup_flight();
  }

  public search_setup_flight(direction?: boolean): void {
    this.center_pos = this.enemy_last_seen_pos!;
    this.center_pos.y = this.safe_altitude;

    let v: number;

    if (this.speed_is_0) {
      v = 0;
    } else {
      v = this.search_velocity;
    }

    this.heliObject.SetMaxVelocity(v);
    this.heliObject.SetSpeedInDestPoint(v);

    this.heliObject.GoPatrolByRoundPath(this.center_pos, this.search_attack_dist, this.flight_direction);
    this.heliObject.LookAtPoint(this.enemy!.position(), true);
  }

  public search_update_shooting(see_enemy: boolean): void {
    if (see_enemy) {
      if (this.search_begin_shoot_time) {
        if (this.search_begin_shoot_time < time_global()) {
          this.heliObject.SetEnemy(this.enemy);
        }
      } else {
        this.search_begin_shoot_time = time_global() + search_shoot_delay;
      }
    } else {
      this.heliObject.ClearEnemy();

      this.search_begin_shoot_time = null;
    }
  }

  public search_update_flight(see_enemy: boolean): void {
    if (this.change_speed_time < time_global()) {
      const t = math.random(8000, 12000);

      this.change_speed_time = time_global() + t;

      this.speed_is_0 = !this.speed_is_0;

      // --        this.flight_direction = not this.flight_direction
      this.search_setup_flight(this.flight_direction);

      return;
    }

    if (this.change_pos_time < time_global()) {
      this.change_pos_time = time_global() + 2000;

      if (
        !this.can_forget_enemy &&
        distanceBetween2d(this.object.position(), this.enemy_last_seen_pos!) <= this.search_attack_dist
      ) {
        this.can_forget_enemy = true;
      }

      if (distanceBetween2d(this.center_pos, this.enemy_last_seen_pos!) > 10) {
        this.search_setup_flight(this.flight_direction);
      }
    }
  }

  public search_update(see_enemy: boolean): void {
    if (!this.search_initialized) {
      this.search_initialize();
    }

    // --    printf( "heli_combat: search_update" )

    this.search_update_shooting(see_enemy);
    this.search_update_flight(see_enemy);
  }

  public flyby_initialize(): void {
    this.flyby_set_initial_state();

    this.state_initialized = false;
    this.was_callback = false;
    this.flyby_states_for_one_pass = 2;
    this.flyby_initialized = true;

    this.heliObject.SetMaxVelocity(this.max_velocity);
    this.heliObject.SetSpeedInDestPoint(this.max_velocity);
    this.heliObject.LookAtPoint(dummy_vector, false);
  }

  public flyby_set_initial_state(): void {
    // --    if this.object:position():distance_to( this.enemy_last_seen_pos ) < this.flyby_attack_dist {
    if (distanceBetween2d(this.object.position(), this.enemy_last_seen_pos!) < this.flyby_attack_dist) {
      // --        this.heliObject.LookAtPoint( dummy_vector, false )

      this.state = flyby_state_to_attack_dist;
    } else {
      // --        this.heliObject.LookAtPoint( this.enemy:position(), true )

      this.state = flyby_state_to_enemy;
    }
  }

  public flyby_update_flight(see_enemy: boolean): void {
    if (this.was_callback) {
      if (this.state === flyby_state_to_attack_dist) {
        this.state = flyby_state_to_enemy;
      } else if (this.state === flyby_state_to_enemy) {
        this.state = flyby_state_to_attack_dist;
      }

      this.was_callback = false;
      this.state_initialized = false;
    }

    if (this.state === flyby_state_to_attack_dist) {
      if (!this.state_initialized) {
        const p = this.calc_position_in_radius(this.flyby_attack_dist);

        // --            printf( "heli_combat:flyby_update_flight 1 SetDestPosition %f %f %f", p.x, p.y, p.z )
        this.heliObject.SetDestPosition(p);

        this.heliObject.ClearEnemy();

        this.change_combat_type_allowed = false;

        this.state_initialized = true;
      }
    } else if (this.state === flyby_state_to_enemy) {
      if (!this.state_initialized) {
        this.heliObject.SetEnemy(this.enemy);
        this.heliObject.UseFireTrail(true);

        this.flyby_states_for_one_pass = this.flyby_states_for_one_pass - 1;

        this.state_initialized = true;
      }

      const p = this.enemy_last_seen_pos!;

      p.set(p.x, this.safe_altitude, p.z);

      this.change_combat_type_allowed = distanceBetween2d(this.object.position(), p) > this.search_attack_dist;

      // --        printf( "heli_combat:flyby_update_flight 2 SetDestPosition %f %f %f", p.x, p.y, p.z )
      this.heliObject.SetDestPosition(p);
    }
  }

  public flyby_update(see_enemy: boolean): void {
    if (!this.flyby_initialized) {
      this.flyby_initialize();
    }

    // --    printf( "heli_combat: flyby_update" )
    this.flyby_update_flight(see_enemy);
    // --    printf( "speed in dest point %d", this.heliObject.GetSpeedInDestPoint(0) )
  }

  public retreat_initialize(): void {
    this.retreat_initialized = true;

    this.heliObject.SetMaxVelocity(this.max_velocity);
    this.heliObject.SetSpeedInDestPoint(this.max_velocity);
    this.heliObject.LookAtPoint(dummy_vector, false);
    this.heliObject.SetDestPosition(this.calc_position_in_radius(5000));
    this.heliObject.ClearEnemy();
  }

  public retreat_update(): void {
    if (!this.retreat_initialized) {
      this.retreat_initialize();
    }

    // --    printf( "heli_combat: retreat_update" )
  }
}

export function cross_ray_circle(p: XR_vector, v: XR_vector, o: XR_vector, r: number): XR_vector {
  const po = new vector().set(o).sub(p);
  const vperp = new vector().set(-v.z, 0, v.x);
  const l = math.sqrt(r ** 2 - new vector().set(po).dotproduct(vperp) ** 2);

  return new vector().set(p).add(new vector().set(v).mul(new vector().set(po).dotproduct(v) + l));
}
