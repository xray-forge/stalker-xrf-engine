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
  ui_events,
} from "xray16";

import { MultiplayerDemoLoadItem } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerDemoLoadItem";
import { MultiplayerDemoPlayerInfo } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerDemoPlayerInfo";
import { MultiplayerDemoPlayerStatItem } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerDemoPlayerStatItem";
import { MultiplayerMenu } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerMenu";
import { executeConsoleCommand } from "@/engine/core/utils/console";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EElementType, initializeElement } from "@/engine/core/utils/ui";
import { create2dVector } from "@/engine/core/utils/vector";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { roots } from "@/engine/lib/constants/roots";
import { FSFileListEX, Optional, TCount, TLabel, TName, Vector2D } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Demo playback tab for multiplayer menu controls.
 */
@LuabindClass()
export class MultiplayerDemo extends CUIWindow {
  public owner: MultiplayerMenu;
  public xml!: CScriptXmlInit;

  public onYesAction: TLabel = "";
  public fileNameToRename: TLabel = "";

  public fileItemMainSz!: Vector2D;
  public fileItemFnSz!: Vector2D;
  public fileItemFdSz!: Vector2D;

  public playerItemMainSz!: Vector2D;
  public playerItemNameSz!: Vector2D;
  public playerItemColumnSz!: Vector2D;

  public uiMapPic!: CUIStatic;
  public uiMapInfo!: CUIMapInfo;
  public uiDemoList!: CUIListBox<MultiplayerDemoLoadItem>;
  public uiGameType!: CUITextWnd;
  public uiPlayersCount!: CUITextWnd;
  public uiTeamStats!: CUITextWnd;
  public uiFileNameEdit!: CUIEditBoxEx;
  public uiMessageBox!: CUIMessageBoxEx;
  public uiPlayersList!: CUIListBox;

  public constructor(owner: MultiplayerMenu, xml: CScriptXmlInit) {
    super();

    this.owner = owner;
    this.xml = xml;

    this.initialize(owner, xml);
  }

  public initialize(owner: MultiplayerMenu, xml: CScriptXmlInit): void {
    this.SetAutoDelete(true);

    xml.InitWindow("tab_demo:main", 0, this);
    xml.InitFrameLine("tab_demo:cap_demo_list", this);
    xml.InitFrame("tab_demo:frame_1", this);

    // --    map description
    xml.InitStatic("tab_demo:static_map_pic_fore", this);
    this.uiMapPic = xml.InitStatic("tab_demo:static_map_pic", this);
    this.uiMapInfo = xml.InitMapInfo("tab_demo:cap_map_info", this);

    // --  file list
    this.uiDemoList = initializeElement(xml, EElementType.LIST_BOX, "tab_demo:list", this, {
      context: owner,
      [ui_events.LIST_ITEM_CLICKED]: () => this.selectDemoFile(),
      [ui_events.WINDOW_LBUTTON_DB_CLICK]: () => this.playSelectedDemo(),
    });
    this.uiDemoList.ShowSelectedItem(true);

    const window: CUIWindow = new CUIWindow();

    xml.InitWindow("tab_demo:file_item_main", 0, window);

    this.fileItemMainSz = create2dVector(window.GetWidth(), window.GetHeight());

    xml.InitWindow("tab_demo:file_item_name", 0, window);
    this.fileItemFnSz = create2dVector(window.GetWidth(), window.GetHeight());

    xml.InitWindow("tab_demo:file_item_date", 0, window);
    this.fileItemFdSz = create2dVector(window.GetWidth(), window.GetHeight());

    this.uiMessageBox = initializeElement(xml, EElementType.MESSAGE_BOX_EX, "demo_message_box", this, {
      context: owner,
      [ui_events.MESSAGE_BOX_YES_CLICKED]: () => this.onMsgBoxYes(),
      [ui_events.MESSAGE_BOX_OK_CLICKED]: () => this.onMsgBoxYes(),
    });

    // --  demo play info
    xml.InitStatic("tab_demo:cap_demo_info_fields", this);

    this.uiGameType = xml.InitTextWnd("tab_demo:static_demo_info_gametype", this);
    this.uiPlayersCount = xml.InitTextWnd("tab_demo:static_demo_info_players_count", this);
    this.uiTeamStats = xml.InitTextWnd("tab_demo:static_demo_info_teamstats", this);
    this.uiFileNameEdit = initializeElement(xml, EElementType.EDIT_BOX, "tab_demo:demo_file_name", this, {
      context: owner,
      [ui_events.EDIT_TEXT_COMMIT]: () => this.onRenameDemo(),
    });

    // --    players info
    xml.InitStatic("tab_demo:cap_demo_players_info", this);
    // --    xml.InitStatic            ("tab_demo:demo_players_info_header", this)

    this.uiPlayersList = xml.InitListBox("tab_demo:players_list", this);

    xml.InitWindow("tab_demo:player_item_main", 0, window);
    this.playerItemMainSz = create2dVector(window.GetWidth(), window.GetHeight());

    xml.InitWindow("tab_demo:player_item_name", 0, window);
    this.playerItemNameSz = create2dVector(window.GetWidth(), window.GetHeight());

    xml.InitWindow("tab_demo:player_item_column", 0, window);
    this.playerItemColumnSz = create2dVector(window.GetWidth(), window.GetHeight());
  }

  /**
   * todo: Description.
   */
  public fillList(): void {
    this.uiDemoList.RemoveAll();

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

    demoLoadItem.uiFn.SetText(fileName);
    demoLoadItem.uiFage.SetText(dateTime);

    this.uiDemoList.AddExistingItem(demoLoadItem);
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
  public getMapTextureName(mapName: TName): TName {
    const textureName: TName = "intro\\intro_map_pic_" + mapName;

    if (getFS().exist(roots.gameTextures, textureName + ".dds") !== null) {
      return textureName;
    }

    return "ui_ui_noise";
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

    itm.uiName.SetText(playerStats.name);
    itm.uiFrags.SetText(tostring(playerStats.frags));
    itm.uiDeath.SetText(tostring(playerStats.death));
    itm.uiArtefacts.SetText(tostring(playerStats.artefacts));
    itm.uiSpots.SetText(tostring(playerStats.spots));

    const rankTextureName: string = this.getRankTextureName(playerStats);

    if (rankTextureName !== "") {
      itm.uiRank.InitTexture(rankTextureName);
    }

    this.uiPlayersList.AddExistingItem(itm);
  }

  /**
   * todo: Description.
   */
  public selectDemoFile(): void {
    logger.info("Select demo file");

    const item: Optional<MultiplayerDemoLoadItem> = this.uiDemoList.GetSelectedItem();

    if (item === null) {
      logger.info("No selected file");

      return;
    }

    const filename: string = item.uiFn.GetText();

    logger.info("Selected demo file. " + filename + ".demo");
    this.updateDemoInfo(filename);
  }

  /**
   * todo: Description.
   */
  public playSelectedDemo() {
    const item: Optional<MultiplayerDemoLoadItem> = this.uiDemoList.GetSelectedItem();

    if (item === null) {
      return;
    }

    const filename: TName = item.uiFn.GetText();

    executeConsoleCommand(consoleCommands.start, "demo(" + filename + ".demo)");
  }

  /**
   * todo: Description.
   */
  public deleteSelectedDemo(): void {
    logger.info("Delete selected demo");

    const item = this.uiDemoList.GetSelectedItem();

    if (item === null) {
      logger.warn("Error, no demo selected");
      this.uiFileNameEdit.SetText("");

      return;
    }

    this.onYesAction = "delete";

    const deleteQuestion: string =
      game.translate_string("mp_want_to_delete_demo") + " " + item.uiFn.GetText() + ".demo ?";

    this.uiMessageBox.InitMessageBox("message_box_yes_no");
    this.uiMessageBox.SetText(deleteQuestion);
    this.uiMessageBox.ShowDialog(true);
  }

  /**
   * todo: Description.
   */
  public onRenameDemo(): void {
    logger.info("Rename demo");

    const item = this.uiDemoList.GetSelectedItem();

    if (item === null) {
      logger.info("No demo selected");
      this.uiFileNameEdit.SetText("");

      return;
    }

    let newFileName: TName = this.uiFileNameEdit.GetText();

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

    this.uiMessageBox.InitMessageBox("message_box_yes_no");
    this.uiMessageBox.SetText(renameQuestion);
    this.uiMessageBox.ShowDialog(true);
  }

  /**
   * todo: Description.
   */
  public onMsgBoxYes(): void {
    logger.info("Confirm message box");

    const fs: FS = getFS();
    const item: Optional<MultiplayerDemoLoadItem> = this.uiDemoList.GetSelectedItem();

    if (item === null) {
      logger.info("Issue, no demo item selected");

      return;
    }

    if (this.onYesAction === "delete") {
      const filenameToDelete: TName = fs.update_path(roots.logs, item.uiFn.GetText() + ".demo");

      fs.file_delete(filenameToDelete);
      this.fillList();
      this.onYesAction = "";

      return;
    }

    if (this.onYesAction === "rename") {
      const oldFileName = fs.update_path(roots.logs, item.uiFn.GetText() + ".demo");
      const newFileName = fs.update_path(roots.logs, this.fileNameToRename + ".demo");

      if (oldFileName === newFileName) {
        this.onYesAction = "";

        return;
      }

      fs.file_rename(oldFileName, newFileName, true);
      item.uiFn.SetText(this.fileNameToRename);
      this.uiFileNameEdit.SetText(this.fileNameToRename);
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
    this.uiPlayersList.RemoveAll();
    if (fileName === "") {
      this.uiMapInfo.InitMap("", "");
      this.uiGameType.SetText("");
      this.uiPlayersCount.SetText("");
      this.uiTeamStats.SetText("");
      this.uiFileNameEdit.SetText("");

      const originalTextureRect: Frect = this.uiMapPic.GetTextureRect();

      this.uiMapPic.InitTexture("ui\\ui_noise");
      this.uiMapPic.SetTextureRect(
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

    this.uiMapInfo.InitMap(mapName, tmpDemoinfo.get_map_version());

    const originalTextureRect: Frect = this.uiMapPic.GetTextureRect();

    this.uiMapPic.InitTexture(this.getMapTextureName(mapName));

    this.uiMapPic.SetTextureRect(
      new Frect().set(originalTextureRect.x1, originalTextureRect.y1, originalTextureRect.x2, originalTextureRect.y2)
    );

    this.uiGameType.SetText(tmpDemoinfo.get_game_type());
    this.uiPlayersCount.SetText(tostring(playersCount));
    this.uiTeamStats.SetText(tmpDemoinfo.get_game_score());
    this.uiFileNameEdit.SetText(fileName);

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
