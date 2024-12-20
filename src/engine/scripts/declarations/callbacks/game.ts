import { calculateObjectVisibility, selectBestStalkerWeapon } from "@/engine/core/ai/combat";
import { smartCoversList } from "@/engine/core/animation/smart_covers";
import { getManager } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
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
 * Declare method for all dynamic objects unregister event.
 * Good place to remove ids from persistent tables and clean up all object data.
 */
extern("CSE_ALifeDynamicObject_on_unregister", (id: TNumberId) => {
  EventsManager.emitEvent(EGameEvent.SERVER_OBJECT_UNREGISTERED, id);
});

/**
 * todo
 */
extern("CALifeUpdateManager__on_before_change_level", () => {
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
});

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

  /**
   * function on_key_press(dik,bind)
   *
   *  if (level.present() and db.actor) then
   *    if (bind == key_bindings.kQUICK_SAVE) then
   *      return action_quick_save(dik,bind)
   *    elseif (bind == key_bindings.kQUICK_LOAD) then
   *      return action_quick_load(dik,bind)
   *    --[[
   *    elseif (bind == key_bindings.kPDA_TAB1) then
   *      return action_toggle_pda_tab("eptTasks")
   *    elseif (bind == key_bindings.kPDA_TAB2) then
   *      return action_toggle_pda_tab("eptRelations")
   *    elseif (bind == key_bindings.kPDA_TAB3) then
   *      return action_toggle_pda_tab("eptContacts")
   *    elseif (bind == key_bindings.kPDA_TAB4) then
   *      return action_toggle_pda_tab("eptRanking")
   *    elseif (bind == key_bindings.kPDA_TAB5) then
   *      return action_toggle_pda_tab("eptLogs")
   *    elseif (bind == key_bindings.kPDA_TAB6) then
   *      return action_toggle_pda_tab("eptEncyclopedia")
   *    --]]
   *    end
   *  end
   *
   *  return false
   * end
   *
   *
   * function action_quick_save(dik,bind)
   *  if not (db.actor:alive() and actor_menu.is_hud_free()) then
   *    return false
   *  end
   *
   *  --	Saving will be interrupted if flags.ret is set to true by a custom script that have "on_before_save_input"
   *  if level.present() then
   *    flags.ret = false
   *    SendScriptCallback("on_before_save_input", flags, 2, game.translate_string("st_ui_save"))
   *    if (flags.ret == true) then
   *      return true
   *    end
   *  end
   *
   *  --if game isn't already paused, then force a pause here
   *  local force_pause
   *  if not (device():is_paused()) then
   *    device():pause(true)
   *    force_pause = true
   *  end
   *
   *  -- get list of savegames with most recently modified first.
   *  local flist = getFS():file_list_open_ex("$game_saves$",	bit_or(FS.FS_ListFiles,FS.FS_RootOnly),
   *  "*".. ui_load_dialog.saved_game_extension)
   *  local f_cnt = flist and flist:Size() or 0
   *
   *  local inc = 0
   *  if (f_cnt > 0) then
   *    flist:Sort(FS.FS_sort_by_modif_down)
   *
   *    for it=0, f_cnt-1 do
   *      local file_name = flist:GetAt(it):NameFull():sub(0,-6):lower()
   *
   *      -- grab last modified quicksave increment count
   *      local d = tonumber( string.match(file_name,"quicksave_(%d+)") )
   *      if (d) then
   *        inc = d
   *        break
   *      end
   *    end
   *  end
   *
   *  inc = (inc >= ui_options.get("other/quicksave_cnt")) and 1 or inc + 1
   *
   *  exec_console_cmd("save " .. (user_name() or "") .. " - quicksave_" .. inc)
   *
   *  --[[
   *  local comm = utils_xml.get_special_txt(db.actor:character_community())
   *  local map = utils_xml.get_special_txt(level.name())
   *  exec_console_cmd("save " .. comm .. " - " .. map .. " - quicksave_" .. inc)
   *  --]]
   *
   *  if (force_pause) then
   *    device():pause(false)
   *  end
   *
   *  return true
   * end
   *
   * function action_quick_load(dik,bind)
   *
   *  --	You must check in your callback, and set flags.ret = true if an action took place
   *  flags.ret = false
   *  SendScriptCallback("on_before_load_input",dik, bind,flags)
   *  if (flags.ret == true) then
   *    return true
   *  end
   *
   *  if not (device():is_paused()) then
   *    device():pause(true)
   *  end
   *
   *  local flist = getFS():file_list_open_ex("$game_saves$",
   *  bit_or(FS.FS_ListFiles,FS.FS_RootOnly),"*".. ui_load_dialog.saved_game_extension)
   *  local f_cnt = flist and flist:Size() or 0
   *
   *  if (f_cnt > 0) then
   *    flist:Sort(FS.FS_sort_by_modif_down)
   *
   *    for it=0, f_cnt-1 do
   *      local file_name = flist:GetAt(it):NameFull():sub(0,-6):lower()
   *
   *      -- grab last modified quicksave
   *      if (string.match(file_name,".* %- quicksave_(%d+)")) then
   *        exec_console_cmd("load " .. file_name)
   *        return true
   *      end
   *    end
   *  end
   *
   *  return true
   * end
   */
});

/**
 * Callbacks related to objects visibility and memory calculation for AI logics execution.
 */
extern("visual_memory_manager", {
  get_visible_value: calculateObjectVisibility,
});

/**
 * Callbacks related to objects AI logics calculation and execution.
 */
extern("ai_stalker", {
  update_best_weapon: selectBestStalkerWeapon,
});
