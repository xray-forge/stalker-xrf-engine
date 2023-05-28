import {
  bit_or,
  CScriptXmlInit,
  CUIEditBoxEx,
  CUIListBox,
  CUIMapInfo,
  CUIMessageBoxEx,
  CUIStatic,
  CUITextWnd,
  CUIWindow,
  Frect,
  FS,
  game,
  getFS,
  LuabindClass,
  main_menu,
  vector2,
} from "xray16";

import { MultiplayerDemoLoadItem } from "@/engine/core/ui/menu/multiplayer/MultiplayerDemoLoadItem";
import { MultiplayerDemoPlayerInfo } from "@/engine/core/ui/menu/multiplayer/MultiplayerDemoPlayerInfo";
import { MultiplayerDemoPlayerStatItem } from "@/engine/core/ui/menu/multiplayer/MultiplayerDemoPlayerStatItem";
import { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer/MultiplayerMenu";
import { executeConsoleCommand } from "@/engine/core/utils/console";
import { LuaLogger } from "@/engine/core/utils/logging";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { roots } from "@/engine/lib/constants/roots";
import { textures } from "@/engine/lib/constants/textures";
import { FSFileListEX, Optional, TCount, TName, Vector2D } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class MultiplayerDemo extends CUIWindow {
  public owner!: MultiplayerMenu;
  public xml!: CScriptXmlInit;

  public onYesAction: string = "";
  public fileNameToRename: string = "";

  public fileItemMainSz!: Vector2D;
  public fileItemFnSz!: Vector2D;
  public fileItemFdSz!: Vector2D;

  public playerItemMainSz!: Vector2D;
  public playerItemNameSz!: Vector2D;
  public playerItemColumnSz!: Vector2D;

  public mapPic!: CUIStatic;
  public mapInfo!: CUIMapInfo;
  public demoList!: CUIListBox<MultiplayerDemoLoadItem>;
  public gameType!: CUITextWnd;
  public playersCount!: CUITextWnd;
  public teamStats!: CUITextWnd;
  public fileNameEdit!: CUIEditBoxEx;
  public messageBox!: CUIMessageBoxEx;
  public playersList!: CUIListBox;

  /**
   * todo: Description.
   */
  public initControls(x: number, y: number, xml: CScriptXmlInit, handler: MultiplayerMenu): void {
    this.SetAutoDelete(true);
    this.owner = handler;
    this.xml = xml;

    xml.InitWindow("tab_demo:main", 0, this);
    xml.InitFrameLine("tab_demo:cap_demo_list", this);
    xml.InitFrame("tab_demo:frame_1", this);

    // --    map description
    xml.InitStatic("tab_demo:static_map_pic_fore", this);
    this.mapPic = xml.InitStatic("tab_demo:static_map_pic", this);
    this.mapInfo = xml.InitMapInfo("tab_demo:cap_map_info", this);

    // --  file list
    this.demoList = xml.InitListBox("tab_demo:list", this);
    this.demoList.ShowSelectedItem(true);

    const ctrl: CUIWindow = new CUIWindow();

    xml.InitWindow("tab_demo:file_item_main", 0, ctrl);

    this.fileItemMainSz = new vector2().set(ctrl.GetWidth(), ctrl.GetHeight());

    xml.InitWindow("tab_demo:file_item_name", 0, ctrl);
    this.fileItemFnSz = new vector2().set(ctrl.GetWidth(), ctrl.GetHeight());

    xml.InitWindow("tab_demo:file_item_date", 0, ctrl);
    this.fileItemFdSz = new vector2().set(ctrl.GetWidth(), ctrl.GetHeight());

    this.messageBox = new CUIMessageBoxEx();

    // --  demo play info
    xml.InitStatic("tab_demo:cap_demo_info_fields", this);

    this.gameType = xml.InitTextWnd("tab_demo:static_demo_info_gametype", this);
    this.playersCount = xml.InitTextWnd("tab_demo:static_demo_info_players_count", this);
    this.teamStats = xml.InitTextWnd("tab_demo:static_demo_info_teamstats", this);

    this.fileNameEdit = xml.InitEditBox("tab_demo:demo_file_name", this);

    // --    players info
    xml.InitStatic("tab_demo:cap_demo_players_info", this);
    // --    xml.InitStatic            ("tab_demo:demo_players_info_header", this)

    this.playersList = xml.InitListBox("tab_demo:players_list", this);

    xml.InitWindow("tab_demo:player_item_main", 0, ctrl);
    this.playerItemMainSz = new vector2().set(ctrl.GetWidth(), ctrl.GetHeight());

    xml.InitWindow("tab_demo:player_item_name", 0, ctrl);
    this.playerItemNameSz = new vector2().set(ctrl.GetWidth(), ctrl.GetHeight());

    xml.InitWindow("tab_demo:player_item_column", 0, ctrl);
    this.playerItemColumnSz = new vector2().set(ctrl.GetWidth(), ctrl.GetHeight());

    // --    handlers
    handler.Register(this.demoList, "demo_list_window");
    handler.Register(this.messageBox, "demo_message_box");
    handler.Register(this.fileNameEdit, "demo_file_name");
    handler.Register(this.demoList, "demo_list_window");
  }

  /**
   * todo: Description.
   */
  public fillList(): void {
    this.demoList.RemoveAll();

    const fs: FS = getFS();
    const filesList: FSFileListEX = fs.file_list_open_ex(roots.logs, bit_or(FS.FS_ListFiles, FS.FS_RootOnly), "*.demo");
    const filesCount: TCount = filesList.Size();

    filesList.Sort(FS.FS_sort_by_modif_down);

    for (let it = 0; it < filesCount; it += 1) {
      const file = filesList.GetAt(it);
      const fileName: string = string.sub(file.NameFull(), 0, string.len(file.NameFull()) - 5);
      const dateTime: string = "[" + file.ModifDigitOnly() + "]";

      // --menu_item =  +
      this.addItemToList(fileName, dateTime);
    }

    this.updateDemoInfo("");
  }

  /**
   * todo: Description.
   */
  public addItemToList(fileName: TName, dateTime: string): void {
    const demoLoadItem: MultiplayerDemoLoadItem = new MultiplayerDemoLoadItem(
      this,
      this.fileItemFnSz.y,
      this.fileItemFnSz.x,
      this.fileItemFdSz.x
    );

    demoLoadItem.SetWndSize(this.fileItemMainSz);

    demoLoadItem.fn.SetText(fileName);
    demoLoadItem.fage.SetText(dateTime);

    this.demoList.AddExistingItem(demoLoadItem);
  }

  /**
   * todo: Description.
   */
  public getRankTextureName(playerInfo: MultiplayerDemoPlayerInfo): string {
    let textureName: TName = "ui_hud_status_";

    if (playerInfo.rank > 4 || playerInfo.rank < 0) {
      logger.error("! ERROR. bad player rank:", playerInfo.rank);

      return "";
    }

    if (playerInfo.team === 0) {
      textureName = textureName + "green_0" + tostring(playerInfo.rank + 1);
    } else if (playerInfo.team === 1) {
      textureName = textureName + "blue_0" + tostring(playerInfo.rank + 1);
    }

    return textureName;
  }

  /**
   * todo: Description.
   */
  public getMapTextureName(mapName: TName): string {
    const textureName: TName = "intro\\intro_map_pic_" + mapName;

    if (getFS().exist(roots.gameTextures, textureName + ".dds") !== null) {
      return textureName;
    }

    return textures.ui_ui_noise;
  }

  /**
   * todo: Description.
   */
  public addPlayerToStats(playerStats: MultiplayerDemoPlayerInfo): void {
    logger.info("Add player to stats");

    const itm: MultiplayerDemoPlayerStatItem = new MultiplayerDemoPlayerStatItem(
      this.playerItemNameSz.y,
      this.playerItemNameSz.x,
      this.playerItemColumnSz.x
    );

    itm.SetWndSize(this.playerItemMainSz);

    itm.name.SetText(playerStats.name);
    itm.frags.SetText(tostring(playerStats.frags));
    itm.death.SetText(tostring(playerStats.death));
    itm.artefacts.SetText(tostring(playerStats.artefacts));
    itm.spots.SetText(tostring(playerStats.spots));

    const rankTextureName: string = this.getRankTextureName(playerStats);

    if (rankTextureName !== "") {
      itm.rank.InitTexture(rankTextureName);
    }

    this.playersList.AddExistingItem(itm);
  }

  /**
   * todo: Description.
   */
  public selectDemoFile(): void {
    logger.info("Select demo file");

    const item: Optional<MultiplayerDemoLoadItem> = this.demoList.GetSelectedItem();

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
    const item: Optional<MultiplayerDemoLoadItem> = this.demoList.GetSelectedItem();

    if (item === null) {
      return;
    }

    const filename: TName = item.fn.GetText();

    executeConsoleCommand(consoleCommands.start, "demo(" + filename + ".demo)");
  }

  /**
   * todo: Description.
   */
  public deleteSelectedDemo(): void {
    logger.info("Delete selected demo");

    const item = this.demoList.GetSelectedItem();

    if (item === null) {
      logger.warn("Error, no demo selected");
      this.fileNameEdit.SetText("");

      return;
    }

    this.onYesAction = "delete";

    const deleteQuestion: string =
      game.translate_string("mp_want_to_delete_demo") + " " + item.fn.GetText() + ".demo ?";

    this.messageBox.InitMessageBox("message_box_yes_no");
    this.messageBox.SetText(deleteQuestion);
    this.messageBox.ShowDialog(true);
  }

  /**
   * todo: Description.
   */
  public onRenameDemo(): void {
    logger.info("Rename demo");

    const item = this.demoList.GetSelectedItem();

    if (item === null) {
      logger.info("No demo selected");
      this.fileNameEdit.SetText("");

      return;
    }

    let newFileName: TName = this.fileNameEdit.GetText();

    if (newFileName === "") {
      logger.info("Bad file name to rename");

      return;
    }

    const [tmpIndex] = string.find(newFileName, ".demo", 1, true);

    if (tmpIndex !== null) {
      newFileName = string.sub(newFileName, 1, tmpIndex - 1);
      logger.info("Rename to new file name:", newFileName);
    }

    [newFileName] = string.gsub(newFileName, "[^a-z0-9A-Z_]", "_");

    this.onYesAction = "rename";
    this.fileNameToRename = newFileName;

    const renameQuestion: string = game.translate_string("mp_want_to_raname_demo") + " " + newFileName + ".demo ?";

    this.messageBox.InitMessageBox("message_box_yes_no");
    this.messageBox.SetText(renameQuestion);
    this.messageBox.ShowDialog(true);
  }

  /**
   * todo: Description.
   */
  public onMsgBoxYes(): void {
    logger.info("Confirm message box");

    const fs: FS = getFS();
    const item: Optional<MultiplayerDemoLoadItem> = this.demoList.GetSelectedItem();

    if (item === null) {
      logger.info("Issue, no demo item selected");

      return;
    }

    if (this.onYesAction === "delete") {
      const filenameToDelete: TName = fs.update_path(roots.logs, item.fn.GetText() + ".demo");

      fs.file_delete(filenameToDelete);
      this.fillList();
      this.onYesAction = "";

      return;
    }

    if (this.onYesAction === "rename") {
      const oldFileName = fs.update_path(roots.logs, item.fn.GetText() + ".demo");
      const newFileName = fs.update_path(roots.logs, this.fileNameToRename + ".demo");

      if (oldFileName === newFileName) {
        this.onYesAction = "";

        return;
      }

      fs.file_rename(oldFileName, newFileName, true);
      item.fn.SetText(this.fileNameToRename);
      this.fileNameEdit.SetText(this.fileNameToRename);
      this.fileNameToRename = "";
      this.onYesAction = "";

      return;
    }

    this.onYesAction = "";
  }

  /**
   * todo: Description.
   */
  public updateDemoInfo(fileName: TName) {
    this.playersList.RemoveAll();
    if (fileName === "") {
      this.mapInfo.InitMap("", "");
      this.gameType.SetText("");
      this.playersCount.SetText("");
      this.teamStats.SetText("");
      this.fileNameEdit.SetText("");

      const originalTextureRect: Frect = this.mapPic.GetTextureRect();

      this.mapPic.InitTexture("ui\\ui_noise");
      this.mapPic.SetTextureRect(
        new Frect().set(originalTextureRect.x1, originalTextureRect.y1, originalTextureRect.x2, originalTextureRect.y2)
      );

      return;
    }

    // -- calling C++ method
    const tmpMm = main_menu.get_main_menu();
    const tmpDemoinfo = tmpMm.GetDemoInfo(fileName + ".demo");

    if (tmpDemoinfo === null) {
      logger.info("Failed to read file:", fileName + ".demo");

      return;
    }

    const mapName: TName = tmpDemoinfo.get_map_name();
    const playersCount: TCount = tmpDemoinfo.get_players_count();

    this.mapInfo.InitMap(mapName, tmpDemoinfo.get_map_version());

    const originalTextureRect: Frect = this.mapPic.GetTextureRect();

    this.mapPic.InitTexture(this.getMapTextureName(mapName));

    this.mapPic.SetTextureRect(
      new Frect().set(originalTextureRect.x1, originalTextureRect.y1, originalTextureRect.x2, originalTextureRect.y2)
    );

    this.gameType.SetText(tmpDemoinfo.get_game_type());
    this.playersCount.SetText(tostring(playersCount));
    this.teamStats.SetText(tmpDemoinfo.get_game_score());
    this.fileNameEdit.SetText(fileName);

    // -- calling C++ method
    for (let it = 0; it < playersCount; it + 1) {
      const playerInfo: MultiplayerDemoPlayerInfo = new MultiplayerDemoPlayerInfo();
      const tmpPlayer = tmpDemoinfo.get_player(it);

      // todo: Just assign in constructor probably.
      playerInfo.name = tmpPlayer.get_name();
      playerInfo.frags = tmpPlayer.get_frags();
      playerInfo.death = tmpPlayer.get_deaths();
      playerInfo.artefacts = tmpPlayer.get_artefacts();
      playerInfo.spots = tmpPlayer.get_spots();
      playerInfo.team = tmpPlayer.get_team();
      playerInfo.rank = tmpPlayer.get_rank();
      this.addPlayerToStats(playerInfo);
    }
  }
}
