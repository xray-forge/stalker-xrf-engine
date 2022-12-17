export {};

declare global {

  /**
   C++ class ipure_schedulable_object {
  };
   */

  // todo;

  /**
   C++ class ipure_server_object : ipure_alife_load_save_object {
  };
   */

  // todo;

  /**
   C++ class IRender_Visual {
    function dcast_PKinematicsAnimated();

  };
   */

  // todo;

  /**
   C++ class IRenderable {
  };
   */

  // todo;

  /**
   C++ class ISheduled {
  };
   */

  // todo;

  /**
   C++ class CBlend {
  };
   */

  // todo;

  /**
   C++ class cse_zone_visual : cse_anomalous_zone,cse_visual {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_zone_visual (string);

    function move_offline() const;
    function move_offline(boolean);

    function use_ai_locations(boolean);

    function can_save() const;

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function UPDATE_Read(net_packet&);

    function on_register();

    function STATE_Write(net_packet&);

    function used_ai_locations() const;

    function init();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function on_spawn();

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function name(const cse_abstract*);

    function STATE_Read(net_packet&, number);

    function interactive() const;

    function on_before_register();

    function keep_saved_data_anyway() const;

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function switch_online();

  };
   */

  // todo;

  /**
   C++ class cse_abstract : cpure_server_object {
    property angle;
    property id;
    property parent_id;
    property position;
    property script_version;

    function UPDATE_Read(net_packet&);

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function UPDATE_Write(net_packet&);

    function STATE_Write(net_packet&);

    function clsid() const;

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

  };
   */

  // todo;

  /**
   C++ class CSE_AbstractVisual : cse_visual,cse_abstract {
    property angle;
    property id;
    property parent_id;
    property position;
    property script_version;

    CSE_AbstractVisual (string);

    function STATE_Write(net_packet&);

    function init();

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function UPDATE_Read(net_packet&);

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function UPDATE_Write(net_packet&);

    function getStartupAnimation();

    function clsid() const;

  };
   */

  // todo;

  /**
   C++ class cse_motion {
  };
   */

  // todo;

  /**
   C++ class cse_ph_skeleton {
  };
   */

  // todo;

  /**
   C++ class cse_shape {
  };
   */

  // todo;

  /**
   C++ class cse_spectator : cse_abstract {
    property angle;
    property id;
    property parent_id;
    property position;
    property script_version;

    cse_spectator (string);

    function STATE_Write(net_packet&);

    function init();

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function UPDATE_Read(net_packet&);

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function UPDATE_Write(net_packet&);

    function clsid() const;

  };
   */

  // todo;

  /**
   C++ class cse_temporary : cse_abstract {
    property angle;
    property id;
    property parent_id;
    property position;
    property script_version;

    cse_temporary (string);

    function STATE_Write(net_packet&);

    function init();

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function UPDATE_Read(net_packet&);

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function UPDATE_Write(net_packet&);

    function clsid() const;

  };
   */

  // todo;

  /**
   C++ class cse_visual {
  };
   */

  // todo;

  /**
   C++ class render_device {
    property aspect_ratio;
    property cam_dir;
    property cam_pos;
    property cam_right;
    property cam_top;
    property f_time_delta;
    property fov;
    property frame;
    property height;
    property precache_frame;
    property time_delta;
    property width;

    function time_global(const render_device*);

    function is_paused(render_device*);

    function pause(render_device*, boolean);

  };
   */

  // todo;

  /**
   C++ class cef_storage {
    function evaluate(cef_storage*, string, game_object*);
    function evaluate(cef_storage*, string, game_object*, game_object*);
    function evaluate(cef_storage*, string, game_object*, game_object*, game_object*);
    function evaluate(cef_storage*, string, game_object*, game_object*, game_object*, game_object*);
    function evaluate(cef_storage*, string, cse_alife_object*);
    function evaluate(cef_storage*, string, cse_alife_object*, cse_alife_object*);
    function evaluate(cef_storage*, string, cse_alife_object*, cse_alife_object*, cse_alife_object*);
    function evaluate(cef_storage*, string, cse_alife_object*, cse_alife_object*, cse_alife_object*, cse_alife_object*);

  };
   */

}
