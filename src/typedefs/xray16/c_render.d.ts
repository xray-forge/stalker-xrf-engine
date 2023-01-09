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
    public precache_frame: unknown;
    public time_delta: unknown;
    public width: number;
    public time_global(): number;
    public is_paused(): boolean;
    public pause(isPaused: boolean): void;
  }

  /**
   * C++ class cef_storage {
   *
    function evaluate(cef_storage*, string, game_object*);
    function evaluate(cef_storage*, string, game_object*, game_object*);
    function evaluate(cef_storage*, string, game_object*, game_object*, game_object*);
    function evaluate(cef_storage*, string, game_object*, game_object*, game_object*, game_object*);
    function evaluate(cef_storage*, string, cse_alife_object*);
    function evaluate(cef_storage*, string, cse_alife_object*, cse_alife_object*);
    function evaluate(cef_storage*, string, cse_alife_object*, cse_alife_object*, cse_alife_object*);
    function evaluate(cef_storage*, string, cse_alife_object*, cse_alife_object*, cse_alife_object*, cse_alife_object*);
   */
}
