import { alife, clsid, ini_file, XR_cse_alife_object, XR_LuaBindBase } from "xray16";

import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { getActor } from "@/mod/scripts/core/db";
import { IActor } from "@/mod/scripts/se/Actor";
import { ISimSquad } from "@/mod/scripts/se/SimSquad";
import { ISmartTerrain } from "@/mod/scripts/se/SmartTerrain";
import { areOnSameAlifeLevel, getAlifeDistanceBetween } from "@/mod/scripts/utils/alife";

let sim_objects_registry: Optional<ISimObjectsRegistry> = null;
const props_ini = new ini_file("misc\\simulation_objects_props.ltx");

export interface ISimObjectsRegistry extends XR_LuaBindBase {
  objects: LuaTable<number, IActor | ISimSquad | ISmartTerrain>;
  register(obj: XR_cse_alife_object): void;
  update_avaliability(obj: XR_cse_alife_object): void;
  get_props(obj: XR_cse_alife_object): void;
  unregister(obj: XR_cse_alife_object): void;
}

export const SimObjectsRegistry: ISimObjectsRegistry = declare_xr_class("SimObjectsRegistry", null, {
  __init(): void {
    this.objects = new LuaTable();
  },
  register(obj: XR_cse_alife_object): void {
    this.get_props(obj);
    this.update_avaliability(obj);
  },
  update_avaliability(obj: ISmartTerrain): void {
    if (
      get_global<AnyCallablesModule>("xr_logic").pick_section_from_condlist(
        getActor() || alife().actor(),
        obj,
        obj.sim_avail
      ) == "true" &&
      obj.sim_available()
    ) {
      this.objects.set(obj.id, obj);
    } else {
      this.objects.delete(obj.id);
    }
  },
  get_props(obj: ISmartTerrain | ISimSquad | IActor) {
    obj.props = new LuaTable();

    let props_section: string = obj.name();

    if (obj.clsid() === clsid.online_offline_group_s) {
      props_section = obj.section_name();
    }

    if (!props_ini.section_exist(props_section)) {
      props_section = "default";

      if (obj.clsid() === clsid.online_offline_group_s) {
        props_section = "default_squad";
      }

      if (obj.clsid() === clsid.script_actor) {
        props_section = "actor";
      }
    }

    const n: number = props_ini.line_count(props_section);

    for (const j of $range(0, n - 1)) {
      const [result, prop_name, prop_condlist] = props_ini.r_line(props_section, j, "", "");

      if (prop_name === "sim_avail") {
        obj.sim_avail = get_global<AnyCallablesModule>("xr_logic").parse_condlist(
          null,
          "simulation_object",
          "sim_avail",
          prop_condlist
        );
      } else {
        obj.props[prop_name] = prop_condlist;
      }
    }

    if (obj.sim_avail == null) {
      obj.sim_avail = get_global<AnyCallablesModule>("xr_logic").parse_condlist(
        null,
        "simulation_object",
        "sim_avail",
        "true"
      );
    }
  },
  unregister(obj: XR_cse_alife_object): void {
    this.objects.delete(obj.id);
  }
} as ISimObjectsRegistry);

export function get_sim_obj_registry() {
  if (sim_objects_registry == null) {
    sim_objects_registry = create_xr_class_instance(SimObjectsRegistry);
  }

  return sim_objects_registry;
}

export function evaluate_prior_by_dist(target: ISmartTerrain | IActor | ISimSquad, squad: ISimSquad): number {
  const dist = math.max(getAlifeDistanceBetween(target, squad), 1);

  return 1 + 1 / dist;
}

export function evaluate_prior(target: ISmartTerrain | IActor | ISimSquad, squad: ISimSquad): number {
  let prior = 0;

  if (!target.target_precondition(squad) || !areOnSameAlifeLevel(target, squad)) {
    return 0;
  } else {
    prior = 3;
  }

  for (const [k, v] of squad.behaviour) {
    const squad_koeff: number = tonumber(v)!;
    let target_koeff: number = 0;

    if (target.props[k] !== null) {
      target_koeff = tonumber(target.props[k])!;
    }

    prior = prior + squad_koeff * target_koeff;
  }

  return prior * evaluate_prior_by_dist(target, squad);
}
