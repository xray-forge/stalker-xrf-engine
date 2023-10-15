import { LuabindClass } from "xray16";

import { TCount, TIndex, TName } from "@/engine/lib/types";

/**
 * UI list item describing recorded player.
 */
@LuabindClass()
export class MultiplayerDemoPlayerInfo {
  public name: TName = "unknown_player";
  public death: TCount = 0;
  public artefacts: TCount = 0;
  public team: TIndex = 0;
  public rank: TCount = 0;
  public frags: TCount = 0;
  public spots: TCount = 0;
}
