export {};

declare global {

  /**
   *  C++ class demo_info {
   *     function get_map_name() const;
   *
   *     function get_player(number) const;
   *
   *     function get_game_type() const;
   *
   *     function get_players_count() const;
   *
   *     function get_map_version() const;
   *
   *     function get_author_name() const;
   *
   *     function get_game_score() const;
   *
   *   };
   *
   *  @customConstructor demo_info
   */

  class XR_demo_info {
    public get_map_name(): string;

    public get_player(value: number): XR_demo_player_info;

    public get_game_type(): string;

    public get_players_count(): number;

    public get_map_version(): string;

    public get_author_name(): unknown;

    public get_game_score(): string;
  }

  /**
   *  C++ class demo_player_info {
   *     function get_spots() const;
   *
   *     function get_name() const;
   *
   *     function get_rank() const;
   *
   *     function get_artefacts() const;
   *
   *     function get_team() const;
   *
   *     function get_deaths() const;
   *
   *     function get_frags() const;
   *
   *   };
   *
   *  @customConstructor demo_player_info
   */

  class XR_demo_player_info {
    public get_spots(): number;

    public get_name() : string;

    public get_rank(): number;

    public get_artefacts(): number;

    public get_team(): number;

    public get_deaths(): number;

    public get_frags(): number;

  }
}
