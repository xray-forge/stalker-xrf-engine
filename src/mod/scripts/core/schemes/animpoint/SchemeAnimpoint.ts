import { level, stalker_ids, vector, world_property, XR_game_object, XR_ini_file, XR_vector } from "xray16";

import { Optional } from "@/mod/lib/types";
import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { registered_smartcovers } from "@/mod/scripts/core/alife/SmartCover";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { ActionAnimpoint, ActionReachAnimpoint } from "@/mod/scripts/core/schemes/animpoint/actions";
import { associations } from "@/mod/scripts/core/schemes/animpoint/animpoint_predicates";
import { EvaluatorNeedAnimpoint, EvaluatorReachAnimpoint } from "@/mod/scripts/core/schemes/animpoint/evaluators";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme, action_ids, evaluators_id } from "@/mod/scripts/core/schemes/base";
import { CampStoryManager } from "@/mod/scripts/core/schemes/camper/CampStoryManager";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { states } from "@/mod/scripts/core/state_management/lib/state_lib";
import {
  getConfigBoolean,
  getConfigNumber,
  getConfigString,
  getConfigSwitchConditions,
} from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { parseNames } from "@/mod/scripts/utils/parse";
import { addCommonPrecondition } from "@/mod/scripts/utils/scheme";

const logger: LuaLogger = new LuaLogger("SchemeAnimpoint");

function angle_to_direction(oangle: XR_vector): XR_vector {
  const yaw = oangle.y;
  const pitch = oangle.x;

  return new vector().setHP(yaw, pitch).normalize();
}

const assoc_tbl: LuaTable<
  string,
  {
    director: LuaTable<number, string>;
    listener: LuaTable<number, string>;
  }
> = {
  idle: {
    director: ["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", "_weapon"],
    listener: ["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", "_weapon"],
  },
  harmonica: {
    director: ["_harmonica"],
    listener: ["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", "_weapon"],
  },
  guitar: {
    director: ["_guitar"],
    listener: ["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", "_weapon"],
  },
  story: {
    director: ["", "_weapon"],
    listener: ["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", "_weapon"],
  },
} as any;

export class SchemeAnimpoint extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.ANIMPOINT;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override addToBinder(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    const operators = {
      action_animpoint: action_ids.animpoint_action + 1,
      action_reach_animpoint: action_ids.animpoint_action + 2,
    };
    const properties = {
      need_animpoint: evaluators_id.animpoint_property + 1,
      reach_animpoint: evaluators_id.animpoint_property + 2,
      state_mgr_logic_active: evaluators_id.state_mgr + 4,
    };

    const manager = npc.motivation_action_manager();

    manager.add_evaluator(properties.need_animpoint, new EvaluatorNeedAnimpoint(state));
    manager.add_evaluator(properties.reach_animpoint, new EvaluatorReachAnimpoint(state));

    state.animpoint = new SchemeAnimpoint(npc, state);

    subscribeActionForEvents(npc, state, state.animpoint);

    const actionReachAnimpoint: ActionReachAnimpoint = new ActionReachAnimpoint(state);

    actionReachAnimpoint.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionReachAnimpoint.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    actionReachAnimpoint.add_precondition(new world_property(stalker_ids.property_enemy, false));
    actionReachAnimpoint.add_precondition(new world_property(properties.need_animpoint, true));
    actionReachAnimpoint.add_precondition(new world_property(properties.reach_animpoint, false));
    addCommonPrecondition(actionReachAnimpoint);
    actionReachAnimpoint.add_effect(new world_property(properties.need_animpoint, false));
    actionReachAnimpoint.add_effect(new world_property(properties.state_mgr_logic_active, false));
    manager.add_action(operators.action_reach_animpoint, actionReachAnimpoint);
    subscribeActionForEvents(npc, state, actionReachAnimpoint);

    const actionAnimpoint: ActionAnimpoint = new ActionAnimpoint(state);

    actionAnimpoint.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionAnimpoint.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    actionAnimpoint.add_precondition(new world_property(stalker_ids.property_enemy, false));
    actionAnimpoint.add_precondition(new world_property(properties.need_animpoint, true));
    actionAnimpoint.add_precondition(new world_property(properties.reach_animpoint, true));
    addCommonPrecondition(actionAnimpoint);
    actionAnimpoint.add_effect(new world_property(properties.need_animpoint, false));
    actionAnimpoint.add_effect(new world_property(properties.state_mgr_logic_active, false));
    manager.add_action(operators.action_animpoint, actionAnimpoint);
    subscribeActionForEvents(npc, state, actionAnimpoint);

    manager.action(action_ids.alife).add_precondition(new world_property(properties.need_animpoint, false));
  }

  public static override setScheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    additional: string
  ): void {
    const st = assignStorageAndBind(object, ini, scheme, section);

    st.logic = getConfigSwitchConditions(ini, section, object);
    st.cover_name = getConfigString(ini, section, "cover_name", object, false, "", "$script_id$_cover");
    st.use_camp = getConfigBoolean(ini, section, "use_camp", object, false, true);
    st.reach_distance = getConfigNumber(ini, section, "reach_distance", object, false, 0.75);
    st.reach_movement = getConfigString(ini, section, "reach_movement", object, false, "", "walk");

    st.reach_distance = st.reach_distance * st.reach_distance;

    const tmp = getConfigString(ini, section, "avail_animations", object, false, "", null);

    if (tmp !== null) {
      st.avail_animations = parseNames(tmp);
    } else {
      st.avail_animations = null;
    }
  }

  public camp: Optional<CampStoryManager> = null;
  public current_action: Optional<string> = null;
  public position: Optional<XR_vector> = null;
  public position_vertex: Optional<number> = null;
  public vertex_position: Optional<XR_vector> = null;
  public smart_direction: Optional<XR_vector> = null;
  public look_position: Optional<XR_vector> = null;
  public avail_actions: Optional<LuaTable<number>> = null;
  public cover_name: Optional<string> = null;
  public npc_id: Optional<number> = null;
  public started: boolean = false;

  public constructor(object: XR_game_object, state: IStoredObject) {
    super(object, state);

    this.npc_id = object.id();
  }

  public initialize(): void {
    this.camp = null;
    this.state.base_action = null;
    this.current_action = null;
    this.position = null;
    this.smart_direction = null;
    this.look_position = null;
    this.avail_actions = new LuaTable();
    this.state.approved_actions = new LuaTable();
    this.state.description = null;
    this.started = false;
    this.cover_name = null;
  }

  public activateScheme(loading: boolean, object: XR_game_object, switching_scheme: boolean): void {
    this.state.signals = {};
    this.calculate_position();

    if (this.started === true) {
      if (!this.state.use_camp && this.cover_name === this.state.cover_name) {
        this.fill_approved_actions();

        const target_action = this.state.approved_actions!.get(math.random(this.state.approved_actions!.length())).name;

        const current_st_animstate = states.get(target_action).animstate;
        const target_st_animstate = states.get(this.current_action!).animstate;

        if (current_st_animstate === target_st_animstate) {
          if (target_action !== this.current_action) {
            this.current_action = this.state.approved_actions!.get(
              math.random(this.state.approved_actions!.length())
            ).name;
          }

          return;
        }
      }

      this.stop();
    }
  }

  public calculate_position(): void {
    const smartcover = registered_smartcovers.get(this.state.cover_name);

    if (smartcover === null) {
      abort("There is no smart_cover with name [%s]", this.state.cover_name);
    }

    this.position = registered_smartcovers.get(this.state.cover_name).position;
    this.position_vertex = level.vertex_id(this.position);
    this.vertex_position = level.vertex_position(this.position_vertex);

    this.smart_direction = angle_to_direction(smartcover.angle);

    const look_dir = this.smart_direction!.normalize();

    this.look_position = new vector().set(
      this.position.x + 10 * look_dir.x,
      this.position.y,
      this.position.z + 10 * look_dir.z
    );

    const description_name: string = smartcover.description()!;

    if (associations.get(description_name) === null) {
      if (this.state.avail_animations === null) {
        abort("Wrong animpoint smart_cover description %s, name %s", tostring(description_name), smartcover.name());
      }
    }

    this.state.description = description_name;
    this.avail_actions = associations.get(description_name);
    this.state.approved_actions = new LuaTable();

    /* --[[ ������� ������������� � :start().
        -- ���� ����� ����� ���������, �� �� ������� ���������� � ����� ������������.
        if this.state.avail_animations !== null {
          -- animations are set from custom_data?
          for k, v in pairs(this.state.avail_animations) do
            table.insert(this.state.approved_actions, {predicate = function() return true }, name = v})
      }
      else
      if this.avail_actions !== null {
      for k,v in pairs(this.avail_actions) do
    -- ������� �� ��������, ������� �� �������� �� �����������
    --printf("checking approved actions %s", this.npc_id)
      if v.predicate(this.npc_id)==true {
      table.insert(this.state.approved_actions, v)
    }
    }
    }
    }

    if(#this.state.approved_actions==0) {
      abort("There is no approved actions for stalker[%s] in animpoint[%s]",
       db.storage[this.npc_id].object:name(), this.object:name())
        }
    ]]*/
  }

  public get_animation_params(): LuaMultiReturn<[Optional<XR_vector>, Optional<XR_vector>]> {
    return $multi(this.position, this.smart_direction);
  }

  public position_riched(): boolean {
    if (this.current_action !== null) {
      return true;
    }

    if (this.position === null) {
      return false;
    }

    const npc: XR_game_object = registry.objects.get(this.npc_id!).object!;

    if (npc === null) {
      return false;
    }

    const distance_reached: boolean =
      npc.position().distance_to_sqr(this.vertex_position!) <= this.state.reach_distance;
    const v1: number = -math.deg(math.atan2(this.smart_direction!.x, this.smart_direction!.z));
    const v2: number = -math.deg(math.atan2(npc.direction().x, npc.direction().z));
    const rot_y: number = math.min(math.abs(v1 - v2), 360 - math.abs(v1) - math.abs(v2));
    const direction_reached: boolean = rot_y < 50;

    return distance_reached && direction_reached;
  }

  public fill_approved_actions(): void {
    const is_in_camp = this.camp !== null;

    if (this.state.avail_animations !== null) {
      for (const [k, v] of this.state.avail_animations!) {
        table.insert(this.state.approved_actions!, {
          predicate: () => true,
          name: v,
        });
      }
    } else {
      if (this.avail_actions !== null) {
        for (const [k, v] of this.avail_actions) {
          if (v.predicate(this.npc_id, is_in_camp) === true) {
            table.insert(this.state.approved_actions!, v);
          }
        }
      }
    }

    if (this.state.approved_actions!.length() === 0) {
      abort(
        "There is no approved actions for stalker[%s] in animpoint[%s]",
        registry.objects.get(this.npc_id!).object!.name(),
        this.object.name()
      );
    }
  }

  public start(): void {
    if (this.state.use_camp) {
      this.camp = CampStoryManager.get_current_camp(this.position);
    }

    this.fill_approved_actions();

    if (this.camp !== null) {
      this.camp.register_npc(this.npc_id!);
    } else {
      this.current_action = this.state.approved_actions!.get(math.random(this.state.approved_actions!.length())).name;
    }

    this.started = true;
    this.cover_name = this.state.cover_name;
  }

  public stop(): void {
    if (this.camp !== null) {
      this.camp.unregister_npc(this.npc_id!);
    }

    this.started = false;
    this.current_action = null;
  }

  public get_action(): Optional<string> {
    return this.current_action;
  }

  public override update(): void {
    const tmp_actions: LuaTable<number, string> = new LuaTable();
    const descr = this.state.description;

    if (!this.state.use_camp) {
      if (this.state.avail_animations === null) {
        if (this.state.approved_actions === null) {
          abort("animpoint not in camp and approved_actions is null. Name [%s]", this.state.cover_name);
        }

        for (const [k, v] of this.state.approved_actions!) {
          table.insert(tmp_actions, v.name);
        }
      } else {
        for (const [k, v] of this.state.avail_animations!) {
          table.insert(tmp_actions, v);
        }
      }

      this.current_action = tmp_actions.get(math.random(tmp_actions.length()));

      return;
    }

    if (this.npc_id === null) {
      abort("Trying to use destroyed object!");
    }

    const [camp_action, is_director] = (
      this.camp as { get_camp_action: (npcId: number) => LuaMultiReturn<[string, boolean]> }
    ).get_camp_action(this.npc_id);
    const tbl = is_director ? assoc_tbl.get(camp_action).director : assoc_tbl.get(camp_action).listener;

    let found = false;

    for (const [k, v] of this.state.approved_actions!) {
      for (const i of $range(1, tbl.length())) {
        if (descr + tbl.get(i) === v.name) {
          table.insert(tmp_actions, v.name);
          found = true;
        }
      }
    }

    if (!found) {
      table.insert(tmp_actions, descr);
    }

    const rnd: number = math.random(tmp_actions.length());
    let action = tmp_actions.get(rnd);

    if (this.state.base_action) {
      if (this.state.base_action === descr + "_weapon") {
        action = descr + "_weapon";
      }

      if (action === descr + "_weapon" && this.state.base_action === descr) {
        table.remove(tmp_actions, rnd);
        action = tmp_actions.get(math.random(tmp_actions.length()));
      }
    } else {
      if (action === descr + "_weapon") {
        this.state.base_action = action;
      } else {
        this.state.base_action = descr;
      }
    }

    this.current_action = action;
  }
}
