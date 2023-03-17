import { clsid, XR_cse_alife_object } from "xray16";

import { STRINGIFIED_TRUE } from "@/mod/globals/lua";
import { Optional, TNumberId, TRate } from "@/mod/lib/types";
import { SIMULATION_OBJECTS_PROPS_LTX } from "@/mod/scripts/core/database/ini";
import { registry } from "@/mod/scripts/core/database/registry";
import { Actor } from "@/mod/scripts/core/objects/alife/Actor";
import { SmartTerrain } from "@/mod/scripts/core/objects/alife/smart/SmartTerrain";
import { Squad } from "@/mod/scripts/core/objects/alife/Squad";
import { areOnSameAlifeLevel, getAlifeDistanceBetween } from "@/mod/scripts/utils/alife";
import { pickSectionFromCondList } from "@/mod/scripts/utils/config";
import { parseConditionsList } from "@/mod/scripts/utils/parse";

let sim_objects_registry: Optional<SimulationObjectsRegistry> = null;

/**
 * todo;
 */
export class SimulationObjectsRegistry {
  public readonly objects: LuaTable<TNumberId, Actor | Squad | SmartTerrain> = new LuaTable();

  public register(object: SmartTerrain | Squad | Actor): void {
    this.get_props(object);
    this.update_avaliability(object);
  }

  public update_avaliability(object: SmartTerrain | Squad | Actor): void {
    if (
      pickSectionFromCondList(registry.actor, object, object.sim_avail as any) === STRINGIFIED_TRUE &&
      object.sim_available()
    ) {
      this.objects.set(object.id, object);
    } else {
      this.objects.delete(object.id);
    }
  }

  public get_props(obj: SmartTerrain | Squad | Actor) {
    obj.props = new LuaTable();

    let props_section: string = obj.name();

    if (obj.clsid() === clsid.online_offline_group_s) {
      props_section = obj.section_name();
    }

    if (!SIMULATION_OBJECTS_PROPS_LTX.section_exist(props_section)) {
      props_section = "default";

      if (obj.clsid() === clsid.online_offline_group_s) {
        props_section = "default_squad";
      }

      if (obj.clsid() === clsid.script_actor) {
        props_section = "actor";
      }
    }

    const n: number = SIMULATION_OBJECTS_PROPS_LTX.line_count(props_section);

    for (const j of $range(0, n - 1)) {
      const [result, prop_name, prop_condlist] = SIMULATION_OBJECTS_PROPS_LTX.r_line(props_section, j, "", "");

      if (prop_name === "sim_avail") {
        obj.sim_avail = parseConditionsList(null, "simulation_object", "sim_avail", prop_condlist);
      } else {
        obj.props[prop_name] = prop_condlist;
      }
    }

    if (obj.sim_avail === null) {
      obj.sim_avail = parseConditionsList(null, "simulation_object", "sim_avail", "true");
    }
  }

  public unregister(obj: XR_cse_alife_object): void {
    this.objects.delete(obj.id);
  }
}

/**
 * todo;
 */
export function getSimulationObjectsRegistry(): SimulationObjectsRegistry {
  if (sim_objects_registry === null) {
    sim_objects_registry = new SimulationObjectsRegistry();
  }

  return sim_objects_registry;
}

export function evaluate_prior_by_dist(target: SmartTerrain | Actor | Squad, squad: Squad): number {
  const dist = math.max(getAlifeDistanceBetween(target, squad), 1);

  return 1 + 1 / dist;
}

export function evaluate_prior(target: SmartTerrain | Actor | Squad, squad: Squad): number {
  let prior = 0;

  if (!target.target_precondition(squad) || !areOnSameAlifeLevel(target, squad)) {
    return 0;
  } else {
    prior = 3;
  }

  for (const [k, v] of squad.behaviour) {
    const squad_koeff: TRate = tonumber(v)!;
    let target_koeff: TRate = 0;

    if (target.props[k] !== null) {
      target_koeff = tonumber(target.props[k])!;
    }

    prior = prior + squad_koeff * target_koeff;
  }

  return prior * evaluate_prior_by_dist(target, squad);
}
