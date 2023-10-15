import { LuabindClass } from "xray16";

/**
 * UI list item describing recorded player.
 */
@LuabindClass()
export class MultiplayerDemoPlayerInfo {
  public name: string = "unknown_player";
  public death: number = 0;
  public artefacts: number = 0;
  public team: number = 0;
  public rank: number = 0;
  public frags: number = 0;
  public spots: number = 0;
}
