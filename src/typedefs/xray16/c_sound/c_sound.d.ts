export {};

declare global {

  /**
   C++ class sound_object {
    const looped = 1;
    const s2d = 2;
    const s3d = 0;

    property frequency;
    property max_distance;
    property min_distance;
    property volume;

    sound_object (string);
    sound_object (string, enum ESoundTypes);

    function set_position(const vector&);

    function stop_deffered();

    function get_position() const;

    function stop();

    function play_no_feedback(game_object*, number, number, vector, number);

    function play_at_pos(game_object*, const vector&);
    function play_at_pos(game_object*, const vector&, number);
    function play_at_pos(game_object*, const vector&, number, number);

    function attach_tail(string);

    function length();

    function play(game_object*);
    function play(game_object*, number);
    function play(game_object*, number, number);

    function playing() const;

  };
   */

  // todo;

  /**
   C++ class sound {
    const attack = 3;
    const attack_hit = 4;
    const die = 7;
    const eat = 2;
    const idle = 1;
    const panic = 11;
    const steal = 10;
    const take_damage = 5;
    const threaten = 9;

    sound ();
    sound (string, string);
    sound (string, string, const vector&);
    sound (string, string, const vector&, const vector&);
    sound (string, string, const vector&, const vector&, boolean);
    sound (string, vector*);
    sound (string, vector*, const vector&);
    sound (string, vector*, const vector&, boolean);
    sound (sound_object*, string, const vector&);
    sound (sound_object*, string, const vector&, const vector&);
    sound (sound_object*, string, const vector&, const vector&, boolean);
    sound (sound_object*, vector*);
    sound (sound_object*, vector*, const vector&);
    sound (sound_object*, vector*, const vector&, boolean);
    sound (enum MonsterSound::EType);
    sound (enum MonsterSound::EType, number);
    sound (string, string, enum MonsterSpace::EMonsterHeadAnimType);

    function set_sound(string);
    function set_sound(const sound_object&);

    function set_position(const vector&);

    function set_bone(string);

    function set_angles(const vector&);

    function set_sound_type(enum ESoundTypes);

    function completed();

  };
   */

  // todo;

  /**
   C++ class SoundInfo {
    property danger;
    property position;
    property power;
    property time;
    property who;

  };
   */

  // todo;

  /**
   C++ class sound_params {
    property frequency;
    property max_distance;
    property min_distance;
    property position;
    property volume;

  };
   */

  // todo;

  /**

   C++ class sound_memory_object : game_memory_object {
    property last_level_time;
    property level_time;
    property object_info;
    property power;
    property self_info;

    function object(const game_memory_object&);

    function type() const;

  };
   *
   */

  // todo;

}
