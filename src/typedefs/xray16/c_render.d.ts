declare module "xray16" {
  /**
   * C++ class ipure_schedulable_object {
   */
  export interface IXR_ipure_schedulable_object {
  }

  /**
   * C++ class IRender_Visual {
   */
  export interface IXR_IRender_Visual {
    dcast_PKinematicsAnimated(): unknown;
  }

  /**
   * C++ class IRenderable {
   */
  export interface IXR_IRenderable {
  }

  /**
   * C++ class ISheduled {
   */
  export interface IXR_ISheduled {
  }

  /**
   * C++ class CBlend {
   */
  export interface IXR_CBlend {
  }

  /**
   * C++ class render_device {
   */
  export class XR_render_device {
    public aspect_ratio: number;
    public cam_dir: XR_vector;
    public cam_pos: unknown;
    public cam_right: unknown;
    public cam_top: unknown;
    public f_time_delta: unknown;
    public fov: number;
    public frame: number;
    public height: number;
    public precache_frame: number;
    public time_delta: number;
    public width: number;
    public time_global(): number;
    public is_paused(): boolean;
    public pause(isPaused: boolean): void;
  }

  /**
   * C++ class cef_storage {
   * @customConstructor cef_storage
   */
  export class XR_cef_storage {
    public evaluate(str: string, game_object: XR_game_object): number;
    public evaluate(str: string, game_object1: XR_game_object, game_object2: XR_game_object): number;
    public evaluate(
      str: string, game_object1: XR_game_object, game_object2: XR_game_object, game_object3: XR_game_object
    ): number;
    public evaluate(
      str: string,
      game_object1: XR_game_object,
      game_object2: XR_game_object,
      game_object3: XR_game_object,
      game_object4: XR_game_object
    ): number;
    public evaluate(str: string, cse_alife_object: XR_cse_alife_object): number;
    public evaluate(
      str: string, cse_alife_object1: XR_cse_alife_object, cse_alife_object2: XR_cse_alife_object
    ): number;
    public evaluate(
      str: string,
      cse_alife_object1: XR_cse_alife_object,
      cse_alife_object2: XR_cse_alife_object,
      cse_alife_object3: XR_cse_alife_object
    ): number;
    public evaluate(
      str: string,
      cse_alife_object1: XR_cse_alife_object,
      cse_alife_object2: XR_cse_alife_object,
      cse_alife_object3: XR_cse_alife_object,
      cse_alife_object4: XR_cse_alife_object
    ): number;
  }
}
