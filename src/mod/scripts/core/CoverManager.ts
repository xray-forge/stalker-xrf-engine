import {
  alife,
  game_graph,
  vector,
  XR_cover_point,
  XR_cse_alife_object,
  XR_game_object,
  XR_net_packet,
  XR_vector
} from "xray16";

import { communities } from "@/mod/globals/communities";
import { Optional } from "@/mod/lib/types";
import { registered_smartcovers } from "@/mod/scripts/core/binders/SmartCoverBinder";
import { IStoredObject, storage } from "@/mod/scripts/core/db";
import { AbstractSingletonManager } from "@/mod/scripts/core/utils/AbstractSingletonManager";
import { get_sim_board, ISimBoard } from "@/mod/scripts/se/SimBoard";
import { ISimSquad } from "@/mod/scripts/se/SimSquad";
import { ISmartCover, registered_smartcovers_by_lv_id } from "@/mod/scripts/se/SmartCover";
import { ISmartTerrain } from "@/mod/scripts/se/SmartTerrain";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { getTableSize } from "@/mod/scripts/utils/table";

const log: LuaLogger = new LuaLogger("CoverManager");

export interface ICoverPointDescriptor {
  cover_vertex_id: number;
  cover_position: XR_vector;
  look_pos: XR_vector;
  is_smart_cover: boolean;
}

// todo: Maybe not used.
// todo: Maybe not used.
// todo: Maybe not used.
export class CoverManager extends AbstractSingletonManager {
  public static get_cover(obj: XR_cse_alife_object, smrttrn: any): any {
    const coverManager: CoverManager = smrttrn.combat_manager.cover_manager;

    return coverManager.cover_table.get(obj.id);
  }

  public static has_cover(se_obj: XR_cse_alife_object, smrttrn: ISmartTerrain): boolean {
    const npc_id: number = se_obj.id;
    const cmanager: CoverManager = (smrttrn as any).combat_manager.cover_manager;
    const cover = cmanager.cover_table.get(npc_id);

    if (cover === null) {
      return false;
    }

    if (cover.is_smart_cover) {
      const npc_storage = storage.get(npc_id);

      if (npc_storage === null) {
        return true;
      }

      const npc_obj = npc_storage.object;
      const level_id = game_graph().vertex(smrttrn.m_game_vertex_id).level_id();
      const smrt_cover = registered_smartcovers_by_lv_id.get(level_id)[cover.cover_vertex_id];

      if (smrt_cover === null) {
        return true;
      }

      const smrt_cover_object: XR_game_object = registered_smartcovers.get(smrt_cover.name());

      if (npc_obj?.suitable_smart_cover(smrt_cover_object)) {
        return false;
      }
    }

    return true;
  }

  public has_smart_cover(se_obj: XR_cse_alife_object, smrttrn: ISmartTerrain): boolean {
    const cmanager: CoverManager = (smrttrn as any).combat_manager.cover_manager;
    const npc_id: number = se_obj.id;
    const cover = cmanager.cover_table.get(npc_id);

    if (cover === null) {
      return false;
    }

    if (cover.is_smart_cover !== true) {
      return false;
    }

    const npc_storage: Optional<IStoredObject> = storage.get(npc_id);

    if (npc_storage === null) {
      return false;
    }

    const npc_obj: XR_game_object = npc_storage.object!;
    const level_id: number = game_graph().vertex(smrttrn.m_game_vertex_id).level_id();

    const smrt_cover = registered_smartcovers_by_lv_id.get(level_id)[cover.cover_vertex_id];

    if (smrt_cover === null) {
      return false;
    }

    const smrt_cover_object: XR_game_object = registered_smartcovers.get(smrt_cover.name());

    if (npc_obj.suitable_smart_cover(smrt_cover_object)) {
      return true;
    }

    return false;
  }
  public squads: LuaTable<number, boolean>;
  public cover_table: LuaTable<number, ICoverPointDescriptor>;
  public board: ISimBoard;
  public is_valid: boolean;

  public constructor(smart: ISmartCover) {
    super();

    this.squads = new LuaTable();
    this.cover_table = new LuaTable();
    this.board = get_sim_board();
    this.is_valid = false;

    //  --  this.name = smart:name()
    //   --  this.sid = math.random(1,100000)
  }

  public register_squad(squad: ISimSquad): void {
    if (squad.player_id !== communities.monster) {
      this.squads.set(squad.id, true);
      this.is_valid = false;
    }
  }

  public unregister_squad(squad: ISimSquad): void {
    if (!this.squads.has(squad.id)) {
      return;
    }

    this.squads.delete(squad.id);
    this.is_valid = false;
  }

  public calculate_covers(position: XR_vector): void {
    if (this.is_valid == true) {
      return;
    }

    this.is_valid = true;

    const npc_table: LuaTable<number, XR_game_object> = new LuaTable();

    for (const [k, v] of this.squads) {
      const squad = alife().object<ISimSquad>(k)!;

      for (const kk of squad.squad_members()) {
        if (storage.has(kk.id)) {
          const npc_object = storage.get(kk.id).object!;

          table.insert(npc_table, npc_object);
        }
      }
    }

    for (const [k, v] of npc_table) {
      v.register_in_combat();
    }

    this.cover_table = new LuaTable();

    // todo: Duplicated?
    for (const [k, v] of npc_table) {
      v.find_best_cover(position);
    }

    for (const [k, v] of npc_table) {
      const cover: XR_cover_point = v.find_best_cover(position);

      this.cover_table.set(v.id(), {
        cover_vertex_id: cover.level_vertex_id(),
        cover_position: cover.position(),
        look_pos: position,
        is_smart_cover: cover.is_smart_cover()
      });
    }

    for (const [k, v] of npc_table) {
      v.unregister_in_combat();
    }
  }

  public save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, "CoverManager");

    packet.w_bool(this.is_valid);

    const n = getTableSize(this.cover_table);

    packet.w_u8(n);

    for (const [k, v] of this.cover_table) {
      packet.w_u16(k);
      packet.w_u32(v.cover_vertex_id);
      packet.w_float(v.cover_position.x);
      packet.w_float(v.cover_position.y);
      packet.w_float(v.cover_position.z);
      packet.w_float(v.look_pos.x);
      packet.w_float(v.look_pos.y);
      packet.w_float(v.look_pos.z);
      packet.w_bool(v.is_smart_cover);
    }

    setSaveMarker(packet, true, "CoverManager");
  }

  public load(packet: XR_net_packet): void {
    setLoadMarker(packet, false, "CoverManager");

    this.is_valid = packet.r_bool();

    const n: number = packet.r_u8();

    for (const i of $range(1, n)) {
      const npc_id: number = packet.r_u16();
      const cover_vertex_id: number = packet.r_u32();
      const cover_position: XR_vector = new vector().set(0, 0, 0);

      cover_position.x = packet.r_float();
      cover_position.y = packet.r_float();
      cover_position.z = packet.r_float();

      const look_pos: XR_vector = new vector().set(0, 0, 0);

      look_pos.x = packet.r_float();
      look_pos.y = packet.r_float();
      look_pos.z = packet.r_float();

      const is_smart_cover: boolean = packet.r_bool();

      this.cover_table.set(npc_id, {
        cover_vertex_id: cover_vertex_id,
        cover_position: cover_position,
        look_pos: look_pos,
        is_smart_cover: is_smart_cover
      });
    }

    setLoadMarker(packet, true, "CoverManager");
  }
}
