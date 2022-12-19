export {};

declare global {
  /**
   C++ class physics_element {
    function get_density();

    function get_mass();

    function is_fixed();

    function is_breakable();

    function get_volume();

    function get_linear_vel(vector&) const;

    function fix();

    function get_angular_vel(vector&) const;

    function apply_force(number, number, number);

    function release_fixed();

    function global_transform(physics_element*);

  };
   */
  // todo;
  /**
   C++ class physics_joint {
    function set_limits(number, number, number);

    function get_axis_angle(number);

    function get_anchor(vector&);

    function get_axis_dir(number, vector&);

    function get_bone_id();

    function is_breakable();

    function set_max_force_and_velocity(number, number, number);

    function set_axis_dir_global(number, number, number, number);

    function get_first_element();

    function set_axis_dir_vs_second_element(number, number, number, number);

    function get_axes_number();

    function set_joint_spring_dumping_factors(number, number);

    function set_axis_spring_dumping_factors(number, number, number);

    function set_anchor_vs_first_element(number, number, number);

    function get_stcond_element();

    function set_anchor_global(number, number, number);

    function get_limits(number&, number&, number);

    function set_anchor_vs_second_element(number, number, number);

    function set_axis_dir_vs_first_element(number, number, number, number);

    function get_max_force_and_velocity(number&, number&, number);

  };
   */
  // todo;
  /**
   C++ class physics_shell {
    function get_joints_number();

    function is_breaking_blocked();

    function get_element_by_bone_id(number);

    function get_linear_vel(vector&) const;

    function is_breakable();

    function get_elements_number();

    function unblock_breaking();

    function get_joint_by_bone_name(string);

    function get_element_by_order(number);

    function get_element_by_bone_name(string);

    function apply_force(number, number, number);

    function get_angular_vel(vector&) const;

    function block_breaking();

    function get_joint_by_order(number);

    function get_joint_by_bone_id(number);

  };
   */
  // todo;
  /**
   C++ class physics_world {
    function set_gravity(number);

    function gravity();

    function add_call(class CPHCondition*, class CPHAction*);

  };
   */
  // todo;
  /**
   C++ class ICollidable {
    ICollidable ();

  };
   */
  // todo;
  /**
   C++ class IKinematicsAnimated {
    function PlayCycle(IKinematicsAnimated*, string);

  };
   */
  // todo;
  /**
   C++ class particles_object {
    particles_object (string);

    function pause_path(boolean);

    function play_at_pos(const vector&);

    function move_to(const vector&, const vector&);

    function looped() const;

    function load_path(string);

    function start_path(boolean);

    function stop();

    function stop_path();

    function stop_deffered();

    function play();

    function playing() const;

  };
   */
  // todo;
  /**

   C++ class hit_memory_object : entity_memory_object {
    property amount;
    property bone_index;
    property direction;
    property last_level_time;
    property level_time;
    property object_info;
    property self_info;

    function object(const entity_memory_object&);

  };
   *
   */
  // todo;
}
