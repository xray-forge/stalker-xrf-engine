import { smartCoversList } from "@/engine/core/animation/smart_covers";
import { getManager } from "@/engine/core/database";
import { GameOutroManager } from "@/engine/core/managers/outro";
import { gameOutroConfig } from "@/engine/core/managers/outro/GameOutroConfig";
import { SaveManager } from "@/engine/core/managers/save";
import { TradeManager } from "@/engine/core/managers/trade";
import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TName, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

logger.info("Resolve and bind game externals");

/**
 * Declare `main` function to enable custom scripts execution.
 * In case if custom script is executed from console and has no `main` function, this placeholder will be used.
 */
extern("main", () => {});

/**
 * Declare list of available smart covers for game engine.
 * Xray uses it internally.
 */
extern("smart_covers", {
  descriptions: smartCoversList,
});

/**
 * Module of callbacks related to game outro.
 */
extern("outro", {
  conditions: gameOutroConfig.OUTRO_CONDITIONS,
  start_bk_sound: () => getManager(GameOutroManager).startBlackScreenAndSound(),
  stop_bk_sound: () => getManager(GameOutroManager).stopBlackScreenAndSound(),
  update_bk_sound_fade_start: (factor: number) =>
    getManager(GameOutroManager).updateBlackScreenAndSoundFadeStart(factor),
  update_bk_sound_fade_stop: (factor: number) => getManager(GameOutroManager).updateBlackScreenAndSoundFadeStop(factor),
});

/**
 * Trading callbacks module.
 * Adjust pricing / trading from lua.
 */
extern("trade_manager", {
  get_sell_discount: (objectId: TNumberId) => getManager(TradeManager).getSellDiscountForObject(objectId),
  get_buy_discount: (objectId: TNumberId) => getManager(TradeManager).getBuyDiscountForObject(objectId),
});

/**
 * AlifeStorage callbacks module.
 * Includes methods working with game saves to provide alternatives for storage packets.
 * Alternative variants are:
 *  - Flexible, not hardcoded, can contain extensive data
 *  - Not limited by game save file upper limits
 */
extern("alife_storage_manager", {
  /**
   * Called from game engine on loading game save.
   */
  CALifeStorageManager_load: (saveName: TName) => getManager(SaveManager).onGameLoad(saveName),
  /**
   * Called from game engine after successful game load.
   */
  CALifeStorageManager_after_load: (saveName: TName) => getManager(SaveManager).onAfterGameLoad(saveName),
  /**
   * Called from game engine just before creating game save.
   */
  CALifeStorageManager_before_save: (saveName: TName) => getManager(SaveManager).onBeforeGameSave(saveName),
  /**
   * Called from game engine when game save is created.
   */
  CALifeStorageManager_save: (saveName: TName) => getManager(SaveManager).onGameSave(saveName),
});

/**
 * todo: Input callback.
 */
extern("level_input", {
  on_key_press: (key: TName, bind: TName) => logger.info("Todo: %s -> %s", key, bind),
});

extern("visual_memory_manager", {
  /**
   *
   * //Alundaio: hijack not_yet_visible_object to lua
   *     luabind::functor<float> funct;
   *     if (GEnv.ScriptEngine->functor("visual_memory_manager.get_visible_value", funct))
   *         return (funct(m_object ? m_object->lua_game_object() : nullptr, game_object
   *         ? game_object->lua_game_object()
   *         : nullptr, time_delta, current_state().m_time_quant, luminocity, current_state().m_velocity_factor,
   *         object_velocity, distance, object_distance, always_visible_distance));
   *     //-Alundaio
   *
   *
   * -- Visual Memory Manager exports
   * -- by Alundaio
   *
   * -- called from engine
   * -- This occurs during the visible check. If value >= visiblity_threshold then object is considered visible
   * -- warning npc and who can be nil sometimes
   * function get_visible_value(npc,who,time_delta,time_quant,luminocity,velocity_factor,velocity,distance,
   * object_distance,always_visible_distance)
   *  distance = distance <= 0 and 0.00001 or distance
   *  luminocity = luminocity <= 0 and 0.0001 or luminocity
   *
   *  if (level_weathers.bLevelUnderground) then
   *    luminocity = luminocity + 0.35
   *  end
   *
   *  -- unaltered formula
   *  -- time_delta / time_quant * luminocity * (1 + velocity_factor*velocity) *
   *  (distance - object_distance) / (distance - always_visible_distance)
   *
   *  return  time_delta / time_quant * luminocity * (1 + velocity_factor*velocity) *
   *  (distance - object_distance) / distance
   * end
   */
});

/**
 * CALifeUpdateManager
 *     if (GEnv.ScriptEngine->functor("_G.CALifeUpdateManager__on_before_change_level", funct))
 *         funct(&net_packet);
 *
 * Anomaly impl:
 *
 *
 *         function CALifeUpdateManager__on_before_change_level(packet)
 * --[[
 *  C++:
 *  net_packet.r					(&graph().actor()->m_tGraphID,sizeof(graph().actor()->m_tGraphID));
 *  net_packet.r					(&graph().actor()->m_tNodeID,sizeof(graph().actor()->m_tNodeID));
 *  net_packet.r_vec3				(graph().actor()->o_Position);
 *  net_packet.r_vec3				(graph().actor()->o_Angle);
 * --]]
 * -- Here you can do stuff when level changes BEFORE save is called, even change destination!.
 * -- Packet is constructed as stated above
 *
 *  -- Release dead bodies on level change (TODO: Determine if it's a bad idea to do this here)
 *  --
 *  local rbm = release_body_manager.get_release_body_manager()
 *  if (rbm) then
 *    rbm:clear(true)
 *  end
 *  --
 *
 *  -- READ PACKET
 *  local pos,angle = vector(),vector()
 *  local gvid = packet:r_u16()
 *  local lvid = packet:r_u32()
 *  packet:r_vec3(pos)
 *  packet:r_vec3(angle)
 *  -- crazy hack to help prevent crash on Trucks Cemetery
 *  --[[local gg = game_graph()
 *  if (gg:valid_vertex_id(gvid) and alife():level_name(gg:vertex(gvid):level_id()) == "k02_trucks_cemetery") then
 *    log("k02_trucks_cemetery hack r__clear_models_on_unload 1")
 *    exec_console_cmd("r__clear_models_on_unload 1")
 *  end --]]
 *  --printf("CALifeUpdateManager__on_before_change_level pos=%s gvid=%s lvid=%s angle=%s",pos,gvid,lvid,angle)
 *  -- fix for car in 1.6 (TODO*kinda For some reason after loading a game ALL physic objects will not be teleported
 *  -- by TeleportObject need to investigate as to why, possibly something to do with object flags)
 *  local car = db.actor and db.actor:get_attached_vehicle()
 *  if (car) then
 *    TeleportObject(car:id(),pos,lvid,gvid)
 *  end
 *    -- REPACK it for engine method to read as normal
 *  --[[
 *  packet:w_begin(13)
 *  packet:w_u16(gvid)
 *  packet:w_u32(lvid)
 *  packet:w_vec3(pos)
 *  packet:w_vec3(angle)
 *  --]]
 *  -- reset read pointer
 *  packet:r_seek(2)
 *
 *  if (bind_container.containers) then
 *    for id,t in pairs(bind_container.containers) do
 *      if (t.id) then
 *        pos.y = pos.y+100
 *        TeleportObject(t.id,pos,lvid,gvid)
 *      end
 *    end
 *  end
 * end
 *
 */

/**
 *  luabind::functor<void> funct;
 *     if (GEnv.ScriptEngine->functor("_G.CSE_ALifeDynamicObject_on_unregister", funct))
 *         funct(ID);
 *     Level().MapManager().OnObjectDestroyNotify(ID);
 *
 *
 * -- called in CSE_ALifeDynamicObject::on_unregister()
 * -- good place to remove ids from persistent tables
 * function CSE_ALifeDynamicObject_on_unregister(id)
 *
 * end
 */

extern("ai_stalker", {
  /**
   * From anomaly:
   *
   * -- if return game_object then it ignores engine. If return nil, then engine tries to find item to kill
   * -- called from engine!
   * function update_best_weapon(npc,cur_wpn)
   *  --[[
   *  local st = db.storage[npc:id()]
   *  if not (st) then
   *    return cur_wpn
   *  end
   *
   *  -- we want to choose new best_weapon every n seconds unless we don't have one
   *  local tg = time_global()
   *  if (cur_wpn and st._choose_bw_timer and tg < st._choose_bw_timer) then
   *    return cur_wpn
   *  end
   *
   *  st._choose_bw_timer = tg+10000
   *
   *  -- weapon priority
   *  local prior = {}
   *
   *  local be = npc:best_enemy()
   *  if (be) then
   *    if (IsMonster(nil,be:clsid())) then
   *      if (be:position():distance_to_sqr(npc:position()) > 2500) then
   *        prior[#prior+1] = _G.IsRifle
   *        prior[#prior+1] = _G.IsSniper
   *        prior[#prior+1] = _G.IsPistol
   *        prior[#prior+1] = _G.IsShotgun
   *        prior[#prior+1] = _G.IsLauncher
   *      else
   *        prior[#prior+1] = _G.IsShotgun
   *        prior[#prior+1] = _G.IsRifle
   *        prior[#prior+1] = _G.IsPistol
   *        prior[#prior+1] = _G.IsSniper
   *        prior[#prior+1] = _G.IsLauncher
   *      end
   *    elseif (be:position():distance_to_sqr(npc:position()) > 1000) then
   *      prior[#prior+1] = _G.IsSniper
   *      prior[#prior+1] = _G.IsRifle
   *      prior[#prior+1] = _G.IsPistol
   *      prior[#prior+1] = _G.IsShotgun
   *      prior[#prior+1] = _G.IsLauncher
   *    elseif (be:position():distance_to_sqr(npc:position()) > 2500) then
   *      prior[#prior+1] = _G.IsRifle
   *      prior[#prior+1] = _G.IsSniper
   *      prior[#prior+1] = _G.IsPistol
   *      prior[#prior+1] = _G.IsShotgun
   *      prior[#prior+1] = _G.IsLauncher
   *    else
   *      prior[#prior+1] = _G.IsRifle
   *      prior[#prior+1] = _G.IsShotgun
   *      prior[#prior+1] = _G.IsPistol
   *      prior[#prior+1] = _G.IsSniper
   *      prior[#prior+1] = _G.IsLauncher
   *    end
   *  elseif (axr_npc_vs_heli.is_under_npc_vs_heli(npc)) then
   *    prior[#prior+1] = _G.IsLauncher
   *    prior[#prior+1] = _G.IsSniper
   *    prior[#prior+1] = _G.IsRifle
   *    prior[#prior+1] = _G.IsPistol
   *    prior[#prior+1] = _G.IsShotgun
   *  else
   *    prior[#prior+1] = _G.IsRifle
   *    prior[#prior+1] = _G.IsSniper
   *    prior[#prior+1] = _G.IsPistol
   *    prior[#prior+1] = _G.IsShotgun
   *    prior[#prior+1] = _G.IsLauncher
   *  end
   *
   *  local best_weapons = {}
   *
   *  local function itr(npc,wpn)
   *    local cls = wpn:clsid()
   *    if (IsWeapon(nil,cls) ~= true) then
   *      return false
   *    end
   *    --if (wpn:get_ammo_in_magazine() > 0) then
   *      for i=1,#prior do
   *        if (prior[i](nil,cls)) then
   *          best_weapons[wpn] = ini_sys:r_float_ex(wpn:section(),"cost")
   *          break
   *        end
   *      end
   *    --end
   *    return false
   *  end
   *
   *  npc:iterate_inventory(itr,npc)
   *
   *
   *  for wpn,cost in spairs(best_weapons,function(t,a,b) return t[a] > t[b] end) do
   *    DEBUG_NPC = level.get_target_obj and level.get_target_obj()
   *    if (DEBUG_NPC) then
   *      actor_menu.set_msg(1, strformat("%s bw=%s",DEBUG_NPC:name(),wpn and wpn:name()), 2)
   *    end
   *    return wpn
   *  end
   *
   *  --]]
   *
   *  local flags = {gun_id = nil}
   *  SendScriptCallback("npc_on_choose_weapon", npc, cur_wpn, flags)
   *
   *  if flags.gun_id and tonumber(flags.gun_id) then
   *    local se_gun = alife_object(tonumber(flags.gun_id))
   *    if se_gun and IsWeapon(nil, se_gun:clsid()) and se_gun.parent_id == npc:id() then
   *      printf('%s does not point to a valid gun in npc inventory, %s will choose gun from engine',
   *      flags.gun_id, npc:name())
   *
   *      local obj = level.object_by_id(tonumber(flags.gun_id))
   *      if obj then return obj else
   *        printf('%s online object is not available, %s will choose gun from engine', se_gun:name(), npc:name())
   *        return
   *      end
   *    end
   *  end
   *
   *  return
   * end
   */
});
