import {
  bit_or,
  CGameFont,
  CUIListBoxItem,
  CUIListBoxItemMsgChain,
  CUIMessageBoxEx,
  CUIWindow,
  Frect,
  game,
  get_console,
  GetARGB,
  GetFontLetterica16Russian,
  getFS,
  main_menu,
  ui_events,
  vector2,
  XR_CScriptXmlInit,
  XR_CUI3tButton,
  XR_CUIEditBoxEx,
  XR_CUIListBox,
  XR_CUIListBoxItem,
  XR_CUIListBoxItemMsgChain,
  XR_CUIMapInfo,
  XR_CUIMessageBoxEx,
  XR_CUIStatic,
  XR_CUITextWnd,
  XR_CUIWindow,
  XR_FS,
  XR_LuaBindBase,
  FS,
  XR_vector2
} from "xray16";

import { textures } from "@/mod/globals/textures";
import { Optional } from "@/mod/lib/types";
import { IMultiplayerMenu } from "@/mod/scripts/ui/menu/MultiplayerMenu";
import { fileExists } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("MultiplayerDemo");

interface IPlayerInfo extends XR_LuaBindBase {
  name: string;
  death: number;
  artefacts: number;
  team: number;
  rank: number;
  frags: number;
  spots: number;
}

const PlayerInfo: IPlayerInfo = declare_xr_class("PlayerInfo", null, {
  __init(): void {
    this.name = "unknown_player";
    this.death = 0;
    this.artefacts = 0;
    this.team = 0;
    this.rank = 0;
    this.frags = 0;
    this.spots = 0;
  }
} as IPlayerInfo);

interface IDemoLoadItem extends XR_CUIListBoxItemMsgChain {
  file_name: string;

  fn: XR_CUITextWnd;
  fage: XR_CUITextWnd;
  delete_button: XR_CUI3tButton;

  __init(owner: IMultiplayerDemo, h: number, w1: number, w2: number): void;
}

const DemoLoadItem: IDemoLoadItem = declare_xr_class("DemoLoadItem", CUIListBoxItemMsgChain, {
  __init(owner, h, w1, w2): void {
    xr_class_super(h);

    const handler = owner.owner;

    this.file_name = "filename";
    this.SetTextColor(GetARGB(255, 255, 255, 255));

    this.fn = this.GetTextItem();
    this.fn.SetFont(GetFontLetterica16Russian());
    this.fn.SetWndPos(new vector2().set(20, 0));
    this.fn.SetWndSize(new vector2().set(w1, h));
    this.fn.SetEllipsis(true);

    this.fage = this.AddTextField("", w2);
    this.fage.SetFont(GetFontLetterica16Russian());
    this.fage.SetWndSize(new vector2().set(w2, h));

    // --this.AttachChild                        (del_btn)
    this.delete_button = owner.xml.Init3tButton("delete_demo_button", this);

    handler.Register(this.delete_button, "delete_demo_button");
    handler.AddCallback("delete_demo_button", ui_events.BUTTON_CLICKED, () => owner.DeleteSelectedDemo(), owner);
  },
  __finalize(): void {}
} as IDemoLoadItem);

interface IPlayerStatsItem extends XR_CUIListBoxItem {
  name: XR_CUITextWnd;
  frags: XR_CUITextWnd;
  death: XR_CUITextWnd;
  artefacts: XR_CUITextWnd;
  spots: XR_CUITextWnd;
  rank: XR_CUIStatic;
}

const PlayerStatsItem: IPlayerStatsItem = declare_xr_class("PlayerStatsItem", CUIListBoxItem, {
  __init(h: number, w1: number, w2: number): void {
    xr_class_super(h);
    this.SetTextColor(GetARGB(255, 255, 255, 255));

    this.name = this.GetTextItem();
    this.name.SetWndSize(new vector2().set(w1, h));
    this.name.SetFont(GetFontLetterica16Russian());
    this.name.SetEllipsis(true);

    this.frags = this.AddTextField("", w2);
    this.frags.SetFont(GetFontLetterica16Russian());
    this.frags.SetTextAlignment(CGameFont.alCenter);

    this.death = this.AddTextField("", w2);
    this.death.SetFont(GetFontLetterica16Russian());
    this.death.SetTextAlignment(CGameFont.alCenter);

    this.artefacts = this.AddTextField("", w2);
    this.artefacts.SetFont(GetFontLetterica16Russian());
    this.artefacts.SetTextAlignment(CGameFont.alCenter);

    this.spots = this.AddTextField("", w2);
    this.spots.SetFont(GetFontLetterica16Russian());
    this.spots.SetTextAlignment(CGameFont.alCenter);

    this.rank = this.AddIconField(w2);
    this.rank.SetStretchTexture(true);

    this.rank.SetWndSize(new vector2().set(16, 16));

    // -- aligning rank icon to center
    const rank_pos = this.rank.GetWndPos();

    this.rank.SetWndPos(new vector2().set(rank_pos.x + (w2 - 16) / 2, 0));
  },
  __finalize(): void {}
} as IPlayerStatsItem);

export interface IMultiplayerDemo extends XR_CUIWindow {
  owner: IMultiplayerMenu;
  xml: XR_CScriptXmlInit;

  map_pic: XR_CUIStatic;
  map_info: XR_CUIMapInfo;
  demo_list: XR_CUIListBox<IDemoLoadItem>;

  file_item_main_sz: XR_vector2;
  file_item_fn_sz: XR_vector2;
  file_item_fd_sz: XR_vector2;

  game_type: XR_CUITextWnd;
  players_count: XR_CUITextWnd;
  team_stats: XR_CUITextWnd;

  file_name_edit: XR_CUIEditBoxEx;
  message_box: XR_CUIMessageBoxEx;

  players_list: XR_CUIListBox;

  player_item_main_sz: XR_vector2;
  player_item_name_sz: XR_vector2;
  player_item_column_sz: XR_vector2;

  on_yes_action: string;
  file_name_to_rename: string;

  InitControls(x: number, y: number, xml: XR_CScriptXmlInit, handler: IMultiplayerMenu): void;
  FillList(): void;
  AddItemToList(filename: string, datetime: string): void;
  GetRankTextureName(playerInfo: IPlayerInfo): string;
  GetMapTextureName(mapName: string): string;
  AddPlayerToStats(playerInfo: IPlayerInfo): void;
  SelectDemoFile(): void;
  OnMsgBoxYes(): void;
  OnRenameDemo(): void;
  DeleteSelectedDemo(): void;
  PlaySelectedDemo(): void;
  UpdateDemoInfo(filename: string): void;
}

export const MultiplayerDemo: IMultiplayerDemo = declare_xr_class("MultiplayerDemo", CUIWindow, {
  __init(): void {
    xr_class_super();
  },
  __finalize(): void {},
  InitControls(x: number, y: number, xml: XR_CScriptXmlInit, handler: IMultiplayerMenu): void {
    log.info("Init controls");

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
  },
  FillList(): void {
    log.info("Fill list");

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
      this.AddItemToList(file_name, date_time);
    }

    this.UpdateDemoInfo("");
  },
  AddItemToList(file_name, date_time): void {
    const it: IDemoLoadItem = create_xr_class_instance(
      DemoLoadItem,
      this,
      this.file_item_fn_sz.y,
      this.file_item_fn_sz.x,
      this.file_item_fd_sz.x
    );

    it.SetWndSize(this.file_item_main_sz);

    it.fn.SetText(file_name);
    it.fage.SetText(date_time);

    this.demo_list.AddExistingItem(it);
  },
  GetRankTextureName(playerInfo: IPlayerInfo): string {
    let texture_name = "ui_hud_status_";

    if (playerInfo.rank > 4 || playerInfo.rank < 0) {
      log.error("! ERROR. bad player rank:", playerInfo.rank);

      return "";
    }

    if (playerInfo.team === 0) {
      texture_name = texture_name + "green_0" + tostring(playerInfo.rank + 1);
    } else if (playerInfo.team == 1) {
      texture_name = texture_name + "blue_0" + tostring(playerInfo.rank + 1);
    }

    return texture_name;
  },
  GetMapTextureName(map_name: string): string {
    const texture_name: string = "intro\\intro_map_pic_" + map_name;

    if (fileExists("$game_textures$", texture_name + ".dds")) {
      return texture_name;
    }

    return textures.ui_ui_noise;
  },
  AddPlayerToStats(player_stats: IPlayerInfo): void {
    log.info("Add player to stats");

    const itm: IPlayerStatsItem = create_xr_class_instance(
      PlayerStatsItem,
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

    const rank_texture_name: string = this.GetRankTextureName(player_stats);

    if (rank_texture_name !== "") {
      itm.rank.InitTexture(rank_texture_name);
    }

    this.players_list.AddExistingItem(itm);
  },

  SelectDemoFile(): void {
    log.info("Select demo file");

    const item: Optional<IDemoLoadItem> = this.demo_list.GetSelectedItem();

    if (item === null) {
      log.info("No selected file");

      return;
    }

    const filename: string = item.fn.GetText();

    log.info("Selected demo file. " + filename + ".demo");
    this.UpdateDemoInfo(filename);
  },

  PlaySelectedDemo() {
    const item: Optional<IDemoLoadItem> = this.demo_list.GetSelectedItem();

    if (item === null) {
      return;
    }

    const filename: string = item.fn.GetText();

    get_console().execute("start demo(" + filename + ".demo)");
  },
  DeleteSelectedDemo(): void {
    log.info("Delete selected demo");

    const item = this.demo_list.GetSelectedItem();

    if (item == null) {
      log.warn("Error, no demo selected");
      this.file_name_edit.SetText("");

      return;
    }

    this.on_yes_action = "delete";

    const delete_question: string =
      game.translate_string("mp_want_to_delete_demo") + " " + item.fn.GetText() + ".demo ?";

    this.message_box.InitMessageBox("message_box_yes_no");
    this.message_box.SetText(delete_question);
    this.message_box.ShowDialog(true);
  },
  OnRenameDemo(): void {
    log.info("Rename demo");

    const item = this.demo_list.GetSelectedItem();

    if (item === null) {
      log.info("No demo selected");
      this.file_name_edit.SetText("");

      return;
    }

    let new_file_name = this.file_name_edit.GetText();

    if (new_file_name == "") {
      log.info("Bad file name to rename");

      return;
    }

    const [tmp_index] = string.find(new_file_name, ".demo", 1, true);

    if (tmp_index !== null) {
      new_file_name = string.sub(new_file_name, 1, tmp_index - 1);
      log.info("Rename to new file name:", new_file_name);
    }

    [new_file_name] = string.gsub(new_file_name, "[^a-z0-9A-Z_]", "_");

    this.on_yes_action = "rename";
    this.file_name_to_rename = new_file_name;

    const rename_question: string = game.translate_string("mp_want_to_raname_demo") + " " + new_file_name + ".demo ?";

    this.message_box.InitMessageBox("message_box_yes_no");
    this.message_box.SetText(rename_question);
    this.message_box.ShowDialog(true);
  },

  OnMsgBoxYes(): void {
    log.info("Confirm message box");

    const fs: XR_FS = getFS();
    const item: Optional<IDemoLoadItem> = this.demo_list.GetSelectedItem();

    if (item === null) {
      log.info("Issue, no demo item selected");

      return;
    }

    if (this.on_yes_action == "delete") {
      const file_name_to_delete: string = fs.update_path("$logs$", item.fn.GetText() + ".demo");

      fs.file_delete(file_name_to_delete);
      this.FillList();
      this.on_yes_action = "";

      return;
    }

    if (this.on_yes_action == "rename") {
      const old_file_name = fs.update_path("$logs$", item.fn.GetText() + ".demo");
      const new_file_name = fs.update_path("$logs$", this.file_name_to_rename + ".demo");

      if (old_file_name == new_file_name) {
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
  },
  UpdateDemoInfo(file_name) {
    this.players_list.RemoveAll();
    if (file_name == "") {
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
      log.info("Failed to read file:", file_name + ".demo");

      return;
    }

    const map_name: string = tmp_demoinfo.get_map_name();
    const players_count: number = tmp_demoinfo.get_players_count();

    this.map_info.InitMap(map_name, tmp_demoinfo.get_map_version());

    const orig_texture_rect = this.map_pic.GetTextureRect();

    this.map_pic.InitTexture(this.GetMapTextureName(map_name));

    this.map_pic.SetTextureRect(
      new Frect().set(orig_texture_rect.x1, orig_texture_rect.y1, orig_texture_rect.x2, orig_texture_rect.y2)
    );

    this.game_type.SetText(tmp_demoinfo.get_game_type());
    this.players_count.SetText(tostring(players_count));
    this.team_stats.SetText(tmp_demoinfo.get_game_score());
    this.file_name_edit.SetText(file_name);

    // -- calling C++ method
    for (let it = 0; it < players_count; it + 1) {
      const player_info: IPlayerInfo = create_xr_class_instance(PlayerInfo);
      const tmp_player = tmp_demoinfo.get_player(it);

      player_info.name = tmp_player.get_name();
      player_info.frags = tmp_player.get_frags();
      player_info.death = tmp_player.get_deaths();
      player_info.artefacts = tmp_player.get_artefacts();
      player_info.spots = tmp_player.get_spots();
      player_info.team = tmp_player.get_team();
      player_info.rank = tmp_player.get_rank();
      this.AddPlayerToStats(player_info);
    }
  }
} as IMultiplayerDemo);
