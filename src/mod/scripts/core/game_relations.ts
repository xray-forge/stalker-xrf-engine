import { alife, relation_registry, XR_cse_alife_creature_abstract, XR_game_object } from "xray16";

import { communities, TCommunity } from "@/mod/globals/communities";
import { relations, TRelation } from "@/mod/globals/relations";
import { AnyCallablesModule, Maybe, Optional } from "@/mod/lib/types";
import { getActor, storage } from "@/mod/scripts/core/db";
import { ISimSquad } from "@/mod/scripts/se/SimSquad";
import { getCharacterCommunity, getStorySquad } from "@/mod/scripts/utils/alife";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("game_relations");

export enum ERelation {
  FRIENDS = 1000,
  NEUTRALS = 0,
  ENEMIES = -1000
}

const temp_goodwill_table: { communities: Optional<LuaTable<TCommunity, LuaTable>> } = { communities: null };

export function set_factions_community(
  faction: Optional<TCommunity>,
  faction_to: TCommunity,
  new_community: TRelation
): void {
  if (faction !== null && faction !== communities.none && faction_to !== communities.none) {
    let community: number = 0;

    if (new_community === relations.enemy) {
      community = -5000;
    } else if (new_community === relations.friend) {
      community = 5000;
    }

    set_factions_community_num(faction, faction_to, community);
  } else {
    // --printf("No such faction community: "..tostring(faction))
  }
}

export function set_factions_community_num(
  faction: Optional<TCommunity>,
  faction_to: TCommunity,
  new_community_num: number
): void {
  if (faction !== null && faction !== communities.none && faction_to !== communities.none) {
    relation_registry.set_community_relation(faction, faction_to, new_community_num);
  } else {
    // --printf("No such faction community: "..tostring(faction))
  }
}

export function change_factions_community_num(faction_name: Optional<TCommunity>, obj_id: number, delta: number): void {
  if (faction_name !== null && faction_name !== communities.none && obj_id !== null) {
    relation_registry.change_community_goodwill(faction_name, obj_id, delta);
  } else {
    logger.warn("No such faction community: " + tostring(faction_name));
  }
}
export function get_factions_community(faction: Optional<TCommunity>, faction_to: TCommunity) {
  if (faction !== null && faction !== communities.none && faction_to !== communities.none) {
    return relation_registry.community_relation(faction, faction_to);
  } else {
    // --printf("No such faction community: "..tostring(faction))
    return null;
  }
}

export function is_factions_friends(faction: Optional<TCommunity>, faction_to: TCommunity): boolean {
  if (faction !== null && faction !== communities.none && faction_to !== communities.none) {
    return relation_registry.community_relation(faction, faction_to) >= ERelation.FRIENDS;
  } else {
    // --printf("No such faction community: "..tostring(faction))
    return false;
  }
}

export function is_factions_enemies(faction: Optional<TCommunity>, faction_to: TCommunity): boolean {
  if (faction !== null && faction !== communities.none && faction_to !== communities.none) {
    return relation_registry.community_relation(faction, faction_to) <= ERelation.ENEMIES;
  } else {
    // --printf("No such faction community: "..tostring(faction))
    return false;
  }
}

export function get_npcs_relation(npc1: Optional<XR_game_object>, npc2: Optional<XR_game_object>): Optional<number> {
  return npc1 && npc2 && npc1.relation(npc2);
}

export function set_npcs_relation(
  npc1: Optional<XR_game_object>,
  npc2: Optional<XR_game_object>,
  new_relation: TRelation
): void {
  let goodwill: ERelation = ERelation.NEUTRALS;

  if (new_relation === relations.enemy) {
    goodwill = ERelation.ENEMIES;
  } else if (new_relation === relations.friend) {
    goodwill = ERelation.FRIENDS;
  }

  if (npc1 && npc2) {
    npc1.force_set_goodwill(goodwill, npc2);
  } else {
    abort("Npc not set in goodwill function!!!");
  }
}

export function get_npc_sympathy(npc: XR_game_object): number {
  return npc.sympathy();
}

export function set_npc_sympathy(npc: Optional<XR_game_object>, new_sympathy: number): void {
  if (new_sympathy < 0) {
    new_sympathy = 0;
  } else if (new_sympathy > 1) {
    new_sympathy = 1;
  }

  if (npc !== null) {
    npc.set_sympathy(new_sympathy);
  } else {
    abort("Npc not set in sympathy function.");
  }
}

export function set_squad_goodwill(squad_id: string | number, new_goodwill: TRelation): void {
  logger.info("Applying new game relation between squad and actor:", squad_id, new_goodwill);

  let squad: Optional<ISimSquad> = getStorySquad<ISimSquad>(squad_id as string);

  if (squad === null) {
    if (type(squad_id) === "string") {
      logger.warn("there is no story squad with id [%s]", squad_id);

      return;
    } else {
      squad = alife().object(squad_id as number);
    }
  }

  if (squad) {
    squad.set_squad_relation(new_goodwill);
  } else {
    abort("There is no squad [%s] in sim_board", squad_id);
  }
}
export function set_squad_goodwill_to_npc(
  npc: Optional<XR_game_object>,
  squad_id: string | number,
  new_goodwill: TRelation
): void {
  logger.info("Applying new game relation between squad and npc:", new_goodwill, squad_id, npc?.name());

  let goodwill = 0;

  if (new_goodwill === relations.enemy) {
    goodwill = -1000;
  } else if (new_goodwill === relations.friend) {
    goodwill = 1000;
  }

  let squad: Optional<ISimSquad> = getStorySquad(squad_id as string);

  if (squad === null) {
    if (type(squad_id) === "string") {
      logger.info("there is no story squad with id [%s]", squad_id);

      return;
    } else {
      squad = alife().object(squad_id as number);
    }
  }

  if (squad) {
    for (const k of squad.squad_members()) {
      if (npc !== null) {
        k.object.force_set_goodwill(goodwill, npc.id());
        alife().object<XR_cse_alife_creature_abstract>(npc.id())!.force_set_goodwill(goodwill, k.id);
      }
    }
  } else {
    abort("There is no squad [%s] in sim_board", squad_id);
  }
}

export function set_squad_community_goodwill(
  squad_id: string | number,
  community: TCommunity,
  new_goodwill: TRelation
): void {
  let goodwill: number = ERelation.NEUTRALS;

  if (new_goodwill === relations.enemy) {
    goodwill = ERelation.ENEMIES;
  } else if (new_goodwill === relations.friend) {
    goodwill = ERelation.FRIENDS;
  }

  let squad: Optional<ISimSquad> = getStorySquad<ISimSquad>(squad_id as string);

  if (squad === null) {
    if (type(squad_id) === "string") {
      logger.warn("There is no story squad with id", squad_id);

      return;
    } else {
      squad = alife().object(squad_id as number);
    }
  }

  if (squad) {
    for (const k of squad.squad_members()) {
      const obj: Optional<XR_game_object> = storage.get(k.id)?.object as Optional<XR_game_object>;

      if (obj !== null) {
        obj.set_community_goodwill(community, goodwill);
      }
    }
  } else {
    abort("There is no squad [%s] in sim_board", squad_id);
  }
}

export function set_level_faction_community(obj: XR_game_object) {
  if (temp_goodwill_table.communities !== null) {
    for (const [k, v] of temp_goodwill_table.communities) {
      if (getCharacterCommunity(obj) === k) {
        for (const [kk, vv] of v) {
          if (kk === obj.id() && getActor()) {
            relation_registry.set_community_goodwill(k, getActor()!.id(), vv);
            // -- run_string xr_effects.set_level_faction_community(null, null, {"bandit", "peacemaker_selo", "friend"})
            obj.force_set_goodwill(vv, getActor()!);
            v.delete(kk);
          }
        }
      }
    }
  }
}

export function check_all_squad_members(squad_name: string, goodwill: TRelation): boolean {
  const squad = getStorySquad(squad_name);
  const actor = getActor();

  if (squad === null) {
    return false;
  }

  if (actor === null) {
    return false;
  }

  for (const k of squad.squad_members()) {
    let is_enemy;

    if (goodwill === relations.enemy) {
      const goodwill: Maybe<number> = storage.get(k.id)?.object?.general_goodwill(actor);

      // --printf("npc id  = [%s]", k)
      // --    if (db.storage[k] !== null) && (db.storage[k].object !== null) {
      // --    printf("goodwill is [%s]", tostring(db.storage[k].object:general_goodwill(db.actor)))
      // --}

      is_enemy = goodwill ? goodwill <= ERelation.ENEMIES : false;
    } else {
      const goodwill: Maybe<number> = storage.get(k.id)?.object?.general_goodwill(actor);

      is_enemy = goodwill ? goodwill >= ERelation.ENEMIES : false;
    }

    if (is_enemy) {
      return true;
    }
  }

  return false;
}
export function get_squad_goodwill_to_actor_by_id(squad_id: number): TRelation {
  const squad: Optional<ISimSquad> = alife().object<ISimSquad>(squad_id);

  if (squad === null) {
    abort("No such squad %s in board", tostring(squad_id));
  }

  if (squad.relationship !== null) {
    // --printf(" squad_relation %s", tostring(squad.relationship))
    return squad.relationship;
  } else {
    let goodwill: TRelation = relations.neutral;

    if (
      relation_registry.community_relation(squad.get_squad_community(), alife().actor().community()) >=
      ERelation.FRIENDS
    ) {
      goodwill = relations.friend;
    } else if (
      relation_registry.community_relation(squad.get_squad_community(), alife().actor().community()) <=
      ERelation.ENEMIES
    ) {
      goodwill = relations.enemy;
    }

    return goodwill;
  }
}
export function get_squad_goodwill_to_actor(squad_name: string): TRelation {
  const squad: Optional<ISimSquad> = getStorySquad(squad_name);

  if (squad === null) {
    abort("No such squad %s in board", tostring(squad_name));
  }

  if (squad.relationship !== null) {
    // --printf(" squad_relation %s", tostring(squad.relationship))
    return squad.relationship;
  } else {
    let goodwill: TRelation = relations.neutral;

    if (
      relation_registry.community_relation(squad.get_squad_community(), alife().actor().community()) >=
      ERelation.FRIENDS
    ) {
      goodwill = relations.friend;
    } else if (
      relation_registry.community_relation(squad.get_squad_community(), alife().actor().community()) <=
      ERelation.ENEMIES
    ) {
      goodwill = relations.enemy;
    }

    return goodwill;
  }
}

export function is_squad_enemy_to_actor(squad_name: string): boolean {
  return get_squad_goodwill_to_actor(squad_name) === relations.enemy;
}

export function is_squad_friend_to_actor(squad_name: string): boolean {
  return get_squad_goodwill_to_actor(squad_name) === relations.friend;
}

export function is_squad_neutral_to_actor(squad_name: string): boolean {
  return get_squad_goodwill_to_actor(squad_name) === relations.neutral;
}

export function set_gulag_relation_actor(smart_name: string, relation: TRelation): void {
  const actor = getActor();
  const gulag = get_global<AnyCallablesModule>("xr_gulag").get_gulag_by_name(smart_name);

  let goodwill: number = ERelation.NEUTRALS;

  if (relation === relations.enemy) {
    goodwill = ERelation.ENEMIES;
  } else if (relation === relations.friend) {
    goodwill = ERelation.FRIENDS;
  }

  for (const [k, v] of gulag.npc_info) {
    const object = storage.get(v.se_obj.id)?.object;

    if (object) {
      object.force_set_goodwill(goodwill, actor!);
      object.set_community_goodwill(getCharacterCommunity(actor!), goodwill);
    }
  }
}

export function get_gulag_relation_actor(smart_name: string, relation: TRelation) {
  const gulag = get_global<AnyCallablesModule>("xr_gulag").get_gulag_by_name(smart_name);
  const actor = getActor();

  if (gulag) {
    let goodwill = 0;
    let npc_count = 0;

    for (const [k, v] of gulag.npc_info) {
      const object = storage.get(v.se_obj.id)?.object;

      if (object && actor) {
        goodwill = goodwill + object.general_goodwill(actor);
        npc_count = npc_count + 1;
      }
    }

    if (npc_count !== 0) {
      const delta: number = goodwill / npc_count;

      if (relation === relations.enemy && delta <= ERelation.ENEMIES) {
        return true;
      } else if (relation === relations.friend && delta >= ERelation.FRIENDS) {
        return true;
      } else if (relation === relations.neutral && delta < ERelation.FRIENDS && delta > ERelation.ENEMIES) {
        return true;
      }
    }
  }

  return false;
}

export function get_squad_relation_to_actor_by_id(squad_id: number): TRelation {
  const actor: Optional<XR_game_object> = getActor();
  const squad: Optional<ISimSquad> = alife().object<ISimSquad>(squad_id);

  if (squad === null) {
    abort("No such squad %s in board", tostring(squad_id));
  }

  let goodwill: number = 0;
  let npc_count: number = 0;

  for (const k of squad.squad_members()) {
    const object: Maybe<XR_game_object> = storage.get(k.id)?.object;

    if (object && actor) {
      goodwill = goodwill + object.general_goodwill(actor);
      npc_count = npc_count + 1;
    }
  }

  if (npc_count !== 0) {
    const delta: number = goodwill / npc_count;

    if (delta <= ERelation.ENEMIES) {
      return relations.enemy;
    } else if (delta >= ERelation.FRIENDS) {
      return relations.friend;
    } else if (delta < ERelation.FRIENDS && delta > ERelation.ENEMIES) {
      return relations.neutral;
    }
  }

  return relations.enemy;
}
