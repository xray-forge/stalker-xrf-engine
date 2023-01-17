declare module "xray16" {
  /**
   * C++ class physics_element {
   * @customConstructor physics_element
   */
  export class XR_physics_element {
    public get_density(): number;
    public get_mass(): number;
    public is_fixed(): boolean;
    public is_breakable(): boolean;
    public get_volume(): number;
    public get_linear_vel(vector: XR_vector): number;
    public fix(): void;
    public get_angular_vel(vector: XR_vector): number;
    public apply_force(a: number, b: number, c: number): void;
    public release_fixed(): void;
    public global_transform(physics_element: XR_physics_element): unknown;
  }

  /**
   * C++ class particle {
   * @customConstructor particle
   */
  export class XR_particle {
    public constructor();
    public constructor(value1: string, value2: string);
    public constructor(value1:string, value2:string, value3: XR_particle_params);
    public constructor(value1:string, value2:string, particle_params: XR_particle_params, value3: boolean);
    public constructor(value1:string, particle_params: XR_particle_params);
    public constructor(value1:string, particle_params: XR_particle_params, value2: boolean);

    public set_velocity(vector: XR_vector): unknown;
    public set_position(vector: XR_vector): unknown;
    public set_bone(bone_id: string): unknown;
    public set_angles(vector: XR_vector): unknown;
    public completed(): unknown;
    public set_particle(value1: string, value2: boolean): unknown;
  }

  /**
   * C++ class particle_params {
   * @customConstructor particle_params
   */
  export class XR_particle_params {
    public constructor();
    public constructor(vector: XR_vector);
    public constructor(vector1: XR_vector, vector2: XR_vector);
    public constructor(vector1: XR_vector, vector2: XR_vector, vector3: XR_vector);
  }

  /**
   * C++ class particles_object {
   * @customConstructor particles_object
   */
  export class XR_particles_object {
    public constructor(value: string);

    public pause_path(value: boolean): unknown;
    public play_at_pos(vector: XR_vector): unknown;
    public move_to(vector1: XR_vector, vector2: XR_vector): unknown;
    public looped(): unknown;
    public load_path(path: string): unknown;
    public start_path(value: boolean): unknown;
    public stop(): void;
    public stop_path(): void;
    public stop_deffered(): void;
    public play(): unknown;
    public playing(): unknown;
  }

  /**
   * C++ class physics_joint {
   * @customConstructor physics_joint
   */
  export class XR_physics_joint {
    public set_limits(value1: number, value2: number, value3: number): unknown;
    public get_axis_angle(value: number): number;
    public get_anchor(vector :XR_vector): unknown;
    public get_axis_dir(value: number, vector: XR_vector): unknown;
    public get_bone_id(): unknown;
    public is_breakable(): unknown;
    public set_max_force_and_velocity(value1: number, value2: number, value3: number): unknown;
    public set_axis_dir_global(value1: number, value2: number, value3: number, value4: number): unknown;
    public get_first_element(): unknown;
    public set_axis_dir_vs_second_element(value1: number, value2: number, value3: number, value4: number): unknown;
    public get_axes_number(): unknown;
    public set_joint_spring_dumping_factors(value1: number, value2: number): unknown;
    public set_axis_spring_dumping_factors(value1: number, value2: number, value3: number): unknown;
    public set_anchor_vs_first_element(value1: number, value2: number, value3: number): unknown;
    public get_stcond_element(): unknown;
    public set_anchor_global(value1: number, value2: number, value3: number): unknown;
    public get_limits(value1: number, value2: number, value3: number): LuaMultiReturn<[number, number]>;
    public set_anchor_vs_second_element(value1: number, value2: number, value3: number): unknown;
    public set_axis_dir_vs_first_element(value1: number, value2: number, value3: number, value4: number): unknown;
    public get_max_force_and_velocity(value1: number, value2: number, value3: number): unknown;
  }

  /**
   * C++ class physics_shell {
   * @customConstructor physics_shell
   */
  export class XR_physics_shell {
    public get_joints_number(): number;
    public is_breaking_blocked(): boolean;
    public get_element_by_bone_id(id: number): unknown;
    public get_linear_vel(vector: XR_vector): number;
    public is_breakable(): boolean;
    public get_elements_number(): number;
    public unblock_breaking(): boolean;
    public get_joint_by_bone_name(name: string): XR_physics_joint;
    public get_element_by_order(order: number): void;
    public get_element_by_bone_name(bone_name: string): XR_physics_element;
    public apply_force(a: number, b: number, c: number): void;
    public get_angular_vel(vector: XR_vector): number;
    public block_breaking(): void;
    public get_joint_by_order(order: number): unknown;
    public get_joint_by_bone_id(id: number): unknown;
  }

  /**
   * C++ class physics_world {
   * @customConstructor physics_world
   */
  export class XR_physics_world {
    public set_gravity(value: number): void;
    public gravity(): unknown;
    public add_call(/* class CPHCondition*, class CPHAction */): unknown;
  }

  /**
   * C++ class ICollidable {
   * @customConstructor ICollidable
   */
  export class XR_ICollidable {
  }

  /**
   * C++ class IKinematicsAnimated {
   * @customConstructor IKinematicsAnimated
   */
  export class XR_IKinematicsAnimated {
    public PlayCycle(value: string): unknown;
  }
}
