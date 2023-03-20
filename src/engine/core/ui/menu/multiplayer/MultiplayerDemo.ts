import {
  bit_or,
  CUIMessageBoxEx,
  CUIWindow,
  Frect,
  FS,
  game,
  get_console,
  getFS,
  LuabindClass,
  main_menu,
  vector2,
  XR_CScriptXmlInit,
  XR_CUIEditBoxEx,
  XR_CUIListBox,
  XR_CUIMapInfo,
  XR_CUIMessageBoxEx,
  XR_CUIStatic,
  XR_CUITextWnd,
  XR_CUIWindow,
  XR_FS,
  XR_vector2,
} from "xray16";

import { MultiplayerDemoLoadItem } from "@/engine/core/ui/menu/multiplayer/MultiplayerDemoLoadItem";
import { MultiplayerDemoPlayerInfo } from "@/engine/core/ui/menu/multiplayer/MultiplayerDemoPlayerInfo";
import { MultiplayerDemoPlayerStatItem } from "@/engine/core/ui/menu/multiplayer/MultiplayerDemoPlayerStatItem";
import { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer/MultiplayerMenu";
import { LuaLogger } from "@/engine/core/utils/logging";
import { textures } from "@/engine/lib/constants/textures";
import { Optional, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class MultiplayerDemo extends CUIWindow {
  public owner!: MultiplayerMenu;
  public xml!: XR_CScriptXmlInit;

  public on_yes_action: string = "";
  public file_name_to_rename: string = "";

  public file_item_main_sz!: XR_vector2;
  public file_item_fn_sz!: XR_vector2;
  public file_item_fd_sz!: XR_vector2;

  public player_item_main_sz!: XR_vector2;
  public player_item_name_sz!: XR_vector2;
  public player_item_column_sz!: XR_vector2;

  public map_pic!: XR_CUIStatic;
  public map_info!: XR_CUIMapInfo;
  public demo_list!: XR_CUIListBox<MultiplayerDemoLoadItem>;
  public game_type!: XR_CUITextWnd;
  public players_count!: XR_CUITextWnd;
  public team_stats!: XR_CUITextWnd;
  public file_name_edit!: XR_CUIEditBoxEx;
  public message_box!: XR_CUIMessageBoxEx;
  public players_list!: XR_CUIListBox;

  /**
   * todo: Description.
   */
  public initControls(x: number, y: number, xml: XR_CScriptXmlInit, handler: MultiplayerMenu): void {
    this.SetAutoDelete(true);
    this.owner = handler;
    this.xml = xml;

    xml.InitWindow("tab_demo:main", 0, this);
    xml.InitFrameLine("tab_demo:cap_demo_list", this);
    xml.InitFrame("tab_demo:frame_1", this);

    // --    map description
    xml.InitStatic("tab_demo:static_map_pic_fore", this);
    this.map_pic = xml.InitStatic("tab_demo:static_map_pic", this);
    this.map_info = xml.InitMapInfo("tab_demo:cap_map_info", this);

    // --  file list
    this.demo_list = xml.InitListBox("tab_demo:list", this);
    this.demo_list.ShowSelectedItem(true);

    const ctrl: XR_CUIWindow = new CUIWindow();

    xml.InitWindow("tab_demo:file_item_main", 0, ctrl);

    this.file_item_main_sz = new vector2().set(ctrl.GetWidth(), ctrl.GetHeight());

    xml.InitWindow("tab_demo:file_item_name", 0, ctrl);
    this.file_item_fn_sz = new vector2().set(ctrl.GetWidth(), ctrl.GetHeight());

    xml.InitWindow("tab_demo:file_item_date", 0, ctrl);
    this.file_item_fd_sz = new vector2().set(ctrl.GetWidth(), ctrl.GetHeight());

    this.message_box = new CUIMessageBoxEx();

    // --  demo play info
    xml.InitStatic("tab_demo:cap_demo_info_fields", this);

    this.game_type = xml.InitTextWnd("tab_demo:static_demo_info_gametype", this);
    this.players_count = xml.InitTextWnd("tab_demo:static_demo_info_players_count", this);
    this.team_stats = xml.InitTextWnd("tab_demo:static_demo_info_teamstats", this);

    this.file_name_edit = xml.InitEditBox("tab_demo:demo_file_name", this);

    // --    players info
    xml.InitStatic("tab_demo:cap_demo_players_info", this);
    // --    xml.InitStatic            ("tab_demo:demo_players_info_header", this)

    this.players_list = xml.InitListBox("tab_demo:players_list", this);

    xml.InitWindow("tab_demo:player_item_main", 0, ctrl);
    this.player_item_main_sz = new vector2().set(ctrl.GetWidth(), ctrl.GetHeight());

    xml.InitWindow("tab_demo:player_item_name", 0, ctrl);
    this.player_item_name_sz = new vector2().set(ctrl.GetWidth(), ctrl.GetHeight());

    xml.InitWindow("tab_demo:player_item_column", 0, ctrl);
    this.player_item_column_sz = new vector2().set(ctrl.GetWidth(), ctrl.GetHeight());

    // --    handlers
    handler.Register(this.demo_list, "demo_list_window");
    handler.Register(this.message_box, "demo_message_box");
    handler.Register(this.file_name_edit, "demo_file_name");
    handler.Register(this.demo_list, "demo_list_window");
  }

  /**
   * todo: Description.
   */
  public fillList(): void {
    this.demo_list.RemoveAll();

    const f = getFS();
    const flist = f.file_list_open_ex("$logs$", bit_or(FS.FS_ListFiles, FS.FS_RootOnly), "*.demo");
    const f_cnt = flist.Size();

    flist.Sort(FS.FS_sort_by_modif_down);

    for (let it = 0; it < f_cnt; it += 1) {
      const file = flist.GetAt(it);
      const file_name: string = string.sub(file.NameFull(), 0, string.len(file.NameFull()) - 5);
      const date_time: string = "[" + file.ModifDigitOnly() + "]";

      // --menu_item =  +
      this.addItemToList(file_name, date_time);
    }

    this.updateDemoInfo("");
  }

  /**
   * todo: Description.
   */
  public addItemToList(file_name: string, date_time: string): void {
    const demoLoadItem: MultiplayerDemoLoadItem = new MultiplayerDemoLoadItem(
      this,
      this.file_item_fn_sz.y,
      this.file_item_fn_sz.x,
      this.file_item_fd_sz.x
    );

    demoLoadItem.SetWndSize(this.file_item_main_sz);

    demoLoadItem.fn.SetText(file_name);
    demoLoadItem.fage.SetText(date_time);

    this.demo_list.AddExistingItem(demoLoadItem);
  }

  /**
   * todo: Description.
   */
  public getRankTextureName(playerInfo: MultiplayerDemoPlayerInfo): string {
    let texture_name = "ui_hud_status_";

    if (playerInfo.rank > 4 || playerInfo.rank < 0) {
      logger.error("! ERROR. bad player rank:", playerInfo.rank);

      return "";
    }

    if (playerInfo.team === 0) {
      texture_name = texture_name + "green_0" + tostring(playerInfo.rank + 1);
    } else if (playerInfo.team === 1) {
      texture_name = texture_name + "blue_0" + tostring(playerInfo.rank + 1);
    }

    return texture_name;
  }

  /**
   * todo: Description.
   */
  public getMapTextureName(mapName: TName): string {
    const textureName: TName = "intro\\intro_map_pic_" + mapName;

    if (getFS().exist("$game_textures$", textureName + ".dds") !== null) {
      return textureName;
    }

    return textures.ui_ui_noise;
  }

  /**
   * todo: Description.
   */
  public addPlayerToStats(player_stats: MultiplayerDemoPlayerInfo): void {
    logger.info("Add player to stats");

    const itm: MultiplayerDemoPlayerStatItem = new MultiplayerDemoPlayerStatItem(
      this.player_item_name_sz.y,
      this.player_item_name_sz.x,
      this.player_item_column_sz.x
    );

    itm.SetWndSize(this.player_item_main_sz);

    itm.name.SetText(player_stats.name);
    itm.frags.SetText(tostring(player_stats.frags));
    itm.death.SetText(tostring(player_stats.death));
    itm.artefacts.SetText(tostring(player_stats.artefacts));
    itm.spots.SetText(tostring(player_stats.spots));

    const rank_texture_name: string = this.getRankTextureName(player_stats);

    if (rank_texture_name !== "") {
      itm.rank.InitTexture(rank_texture_name);
    }

    this.players_list.AddExistingItem(itm);
  }

  /**
   * todo: Description.
   */
  public selectDemoFile(): void {
    logger.info("Select demo file");

    const item: Optional<MultiplayerDemoLoadItem> = this.demo_list.GetSelectedItem();

    if (item === null) {
      logger.info("No selected file");

      return;
    }

    const filename: string = item.fn.GetText();

    logger.info("Selected demo file. " + filename + ".demo");
    this.updateDemoInfo(filename);
  }

  /**
   * todo: Description.
   */
  public playSelectedDemo() {
    const item: Optional<MultiplayerDemoLoadItem> = this.demo_list.GetSelectedItem();

    if (item === null) {
      return;
    }

    const filename: string = item.fn.GetText();

    get_console().execute("start demo(" + filename + ".demo)");
  }

  /**
   * todo: Description.
   */
  public deleteSelectedDemo(): void {
    logger.info("Delete selected demo");

    const item = this.demo_list.GetSelectedItem();

    if (item === null) {
      logger.warn("Error, no demo selected");
      this.file_name_edit.SetText("");

      return;
    }

    this.on_yes_action = "delete";

    const delete_question: string =
      game.translate_string("mp_want_to_delete_demo") + " " + item.fn.GetText() + ".demo ?";

    this.message_box.InitMessageBox("message_box_yes_no");
    this.message_box.SetText(delete_question);
    this.message_box.ShowDialog(true);
  }

  /**
   * todo: Description.
   */
  public onRenameDemo(): void {
    logger.info("Rename demo");

    const item = this.demo_list.GetSelectedItem();

    if (item === null) {
      logger.info("No demo selected");
      this.file_name_edit.SetText("");

      return;
    }

    let new_file_name = this.file_name_edit.GetText();

    if (new_file_name === "") {
      logger.info("Bad file name to rename");

      return;
    }

    const [tmp_index] = string.find(new_file_name, ".demo", 1, true);

    if (tmp_index !== null) {
      new_file_name = string.sub(new_file_name, 1, tmp_index - 1);
      logger.info("Rename to new file name:", new_file_name);
    }

    [new_file_name] = string.gsub(new_file_name, "[^a-z0-9A-Z_]", "_");

    this.on_yes_action = "rename";
    this.file_name_to_rename = new_file_name;

    const rename_question: string = game.translate_string("mp_want_to_raname_demo") + " " + new_file_name + ".demo ?";

    this.message_box.InitMessageBox("message_box_yes_no");
    this.message_box.SetText(rename_question);
    this.message_box.ShowDialog(true);
  }

  /**
   * todo: Description.
   */
  public onMsgBoxYes(): void {
    logger.info("Confirm message box");

    const fs: XR_FS = getFS();
    const item: Optional<MultiplayerDemoLoadItem> = this.demo_list.GetSelectedItem();

    if (item === null) {
      logger.info("Issue, no demo item selected");

      return;
    }

    if (this.on_yes_action === "delete") {
      const file_name_to_delete: string = fs.update_path("$logs$", item.fn.GetText() + ".demo");

      fs.file_delete(file_name_to_delete);
      this.fillList();
      this.on_yes_action = "";

      return;
    }

    if (this.on_yes_action === "rename") {
      const old_file_name = fs.update_path("$logs$", item.fn.GetText() + ".demo");
      const new_file_name = fs.update_path("$logs$", this.file_name_to_rename + ".demo");

      if (old_file_name === new_file_name) {
        this.on_yes_action = "";

        return;
      }

      fs.file_rename(old_file_name, new_file_name, true);
      item.fn.SetText(this.file_name_to_rename);
      this.file_name_edit.SetText(this.file_name_to_rename);
      this.file_name_to_rename = "";
      this.on_yes_action = "";

      return;
    }

    this.on_yes_action = "";
  }

  /**
   * todo: Description.
   */
  public updateDemoInfo(file_name: TName) {
    this.players_list.RemoveAll();
    if (file_name === "") {
      this.map_info.InitMap("", "");
      this.game_type.SetText("");
      this.players_count.SetText("");
      this.team_stats.SetText("");
      this.file_name_edit.SetText("");

      const orig_texture_rect = this.map_pic.GetTextureRect();

      this.map_pic.InitTexture("ui\\ui_noise");
      this.map_pic.SetTextureRect(
        new Frect().set(orig_texture_rect.x1, orig_texture_rect.y1, orig_texture_rect.x2, orig_texture_rect.y2)
      );

      return;
    }

    // -- calling C++ method
    const tmp_mm = main_menu.get_main_menu();
    const tmp_demoinfo = tmp_mm.GetDemoInfo(file_name + ".demo");

    if (tmp_demoinfo === null) {
      logger.info("Failed to read file:", file_name + ".demo");

      return;
    }

    const map_name: string = tmp_demoinfo.get_map_name();
    const players_count: number = tmp_demoinfo.get_players_count();

    this.map_info.InitMap(map_name, tmp_demoinfo.get_map_version());

    const orig_texture_rect = this.map_pic.GetTextureRect();

    this.map_pic.InitTexture(this.getMapTextureName(map_name));

    this.map_pic.SetTextureRect(
      new Frect().set(orig_texture_rect.x1, orig_texture_rect.y1, orig_texture_rect.x2, orig_texture_rect.y2)
    );

    this.game_type.SetText(tmp_demoinfo.get_game_type());
    this.players_count.SetText(tostring(players_count));
    this.team_stats.SetText(tmp_demoinfo.get_game_score());
    this.file_name_edit.SetText(file_name);

    // -- calling C++ method
    for (let it = 0; it < players_count; it + 1) {
      const player_info: MultiplayerDemoPlayerInfo = new MultiplayerDemoPlayerInfo();
      const tmp_player = tmp_demoinfo.get_player(it);

      // todo: Just assign in constructor probably.
      player_info.name = tmp_player.get_name();
      player_info.frags = tmp_player.get_frags();
      player_info.death = tmp_player.get_deaths();
      player_info.artefacts = tmp_player.get_artefacts();
      player_info.spots = tmp_player.get_spots();
      player_info.team = tmp_player.get_team();
      player_info.rank = tmp_player.get_rank();
      this.addPlayerToStats(player_info);
    }
  }
}
