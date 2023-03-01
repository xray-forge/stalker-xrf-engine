import { clsid, ini_file, XR_cse_alife_object } from "xray16";

import { STRINGIFIED_TRUE } from "@/mod/globals/lua";
import { Optional } from "@/mod/lib/types";
import { Actor } from "@/mod/scripts/core/alife/Actor";
import { SimSquad } from "@/mod/scripts/core/alife/SimSquad";
import { SmartTerrain } from "@/mod/scripts/core/alife/SmartTerrain";
import { registry } from "@/mod/scripts/core/database/index";
import { areOnSameAlifeLevel, getAlifeDistanceBetween } from "@/mod/scripts/utils/alife";
import { parseCondList, pickSectionFromCondList } from "@/mod/scripts/utils/configs";

let sim_objects_registry: Optional<SimObjectsRegistry> = null;
const props_ini = new ini_file("misc\\simulation_objects_props.ltx");

/**
 * todo;
 */
export class SimObjectsRegistry {
  public readonly objects: LuaTable<number, Actor | SimSquad | SmartTerrain> = new LuaTable();

  public register(obj: SmartTerrain | SimSquad | Actor): void {
    this.get_props(obj);
    this.update_avaliability(obj);
  }

  public update_avaliability(obj: SmartTerrain | SimSquad | Actor): void {
    if (
      pickSectionFromCondList(registry.actor, obj, obj.sim_avail as any) === STRINGIFIED_TRUE &&
      obj.sim_available()
    ) {
      this.objects.set(obj.id, obj);
    } else {
      this.objects.delete(obj.id);
    }
  }

  public get_props(obj: SmartTerrain | SimSquad | Actor) {
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
        obj.sim_avail = parseCondList(null, "simulation_object", "sim_avail", prop_condlist);
      } else {
        obj.props[prop_name] = prop_condlist;
      }
    }

    if (obj.sim_avail === null) {
      obj.sim_avail = parseCondList(null, "simulation_object", "sim_avail", "true");
    }
  }

  public unregister(obj: XR_cse_alife_object): void {
    this.objects.delete(obj.id);
  }
}

export function get_sim_obj_registry() {
  if (sim_objects_registry === null) {
    sim_objects_registry = new SimObjectsRegistry();
  }

  return sim_objects_registry;
}

export function evaluate_prior_by_dist(target: SmartTerrain | Actor | SimSquad, squad: SimSquad): number {
  const dist = math.max(getAlifeDistanceBetween(target, squad), 1);

  return 1 + 1 / dist;
}

export function evaluate_prior(target: SmartTerrain | Actor | SimSquad, squad: SimSquad): number {
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
