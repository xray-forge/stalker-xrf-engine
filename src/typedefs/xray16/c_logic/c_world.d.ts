declare module "xray16" {
   /**
    C++ class property_storage {
     property_storage ();

     function property(const number&) const;

     function set_property(const number&, const boolean&);

   };
    */
   export interface IXR_property_storage {
      property(value: number): unknown;
      set_property(value1: number, value2: boolean): void;
   }

   /**

    C++ class action_planner {
     property object;
     property storage;

     action_planner ();

     function initialized() const;

     function remove_action(const number&);

     function action(const number&);

     function add_action(const number&, action_base*);

     function show(string);

     function update();

     function clear();

     function evaluator(const number&);

     function setup(game_object*);

     function set_goal_world_state(action_planner*, world_state*);

     function current_action();

     function add_evaluator(const number&, property_evaluator*);

     function remove_evaluator(const number&);

     function current_action_id() const;

     function actual(const action_planner*);

   };
    *
    */
   // todo;
   /**

    C++ class planner_action : action_planner,action_base {
     property object;
     property storage;

     planner_action ();
     planner_action (game_object*);
     planner_action (game_object*, string);

     function finalize();

     function action(const number&);

     function add_precondition(const world_property&);

     function add_action(const number&, action_base*);

     function update();

     function remove_effect(const number&);

     function current_action();

     function current_action_id() const;

     function initialized() const;

     function weight(const world_state&, const world_state&) const;

     function initialize();

     function actual(const action_planner*);

     function remove_action(const number&);

     function remove_precondition(const number&);

     function execute();

     function clear();

     function evaluator(const number&);

     function set_goal_world_state(action_planner*, world_state*);

     function set_weight(const number&);

     function add_effect(const world_property&);

     function show(string);

     function setup(game_object*);
     function setup(game_object*, property_storage*);

     function remove_evaluator(const number&);

     function add_evaluator(const number&, property_evaluator*);

   };
    *
    */
   // todo;
   /**

    C++ class world_state {
     world_state ();
     world_state (world_state);

     function clear();

     function includes(const world_state&) const;

     operator ==(const world_state&, world_state);

     function remove_property(const number&);

     function add_property(const world_property&);

     operator <(const world_state&, world_state);

     function property(const number&) const;

   };
    */
   // todo;
   /**
    C++ class world_property {
     world_property (number, boolean);

     function value() const;

     operator <(const world_property&, world_property);

     function condition() const;

     operator ==(const world_property&, world_property);

   };
    */
   // todo;
   /**
    C++ class CController : CGameObject {
     CController ();

     function Visual() const;

     function _construct();

     function getEnabled() const;

     function net_Import(net_packet&);

     function net_Export(net_packet&);

     function getVisible() const;

     function net_Spawn(cse_abstract*);

     function use(CGameObject*);

   };
    */
   // todo;
   /**
    C++ class cover_point {
     function level_vertex_id() const;

     function is_smart_cover(const cover_point*);

     function position() const;

   };
    */
   // todo;
   /**
    C++ class CDestroyablePhysicsObject : CGameObject {
     CDestroyablePhysicsObject ();

     function Visual() const;

     function _construct();

     function getEnabled() const;

     function net_Import(net_packet&);

     function net_Export(net_packet&);

     function getVisible() const;

     function net_Spawn(cse_abstract*);

     function use(CGameObject*);

   };
    */
   // todo;
   /**
    C++ class CLevelChanger : CGameObject {
     CLevelChanger ();

     function Visual() const;

     function _construct();

     function getEnabled() const;

     function net_Import(net_packet&);

     function net_Export(net_packet&);

     function getVisible() const;

     function net_Spawn(cse_abstract*);

     function use(CGameObject*);

   };
    */
   // todo;
   /**
    C++ class client_spawn_manager {
     function remove(number, number);

     function add(number, number, const function<void>&, object);
     function add(number, number, const function<void>&);

   };
    */
   // todo;
}
