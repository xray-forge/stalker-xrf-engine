declare module "xray16" {
  /**
   * C++ class demo_info {
   * @customConstructor demo_info
   */
  export class XR_demo_info {
    public get_map_name(): string;
    public get_player(value: number): XR_demo_player_info;
    public get_game_type(): string;
    public get_players_count(): number;
    public get_map_version(): string;
    public get_author_name(): unknown;
    public get_game_score(): string;
  }

  /**
   * C++ class demo_player_info {
   * @customConstructor demo_player_info
   */
  export class XR_demo_player_info {
    public get_spots(): number;
    public get_name() : string;
    public get_rank(): number;
    public get_artefacts(): number;
    public get_team(): number;
    public get_deaths(): number;
    public get_frags(): number;
  }
}
