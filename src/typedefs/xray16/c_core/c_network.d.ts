export {};

declare global {
  /**
   C++ class net_packet {
    net_packet ();

    function r_advance(number);

    function r_begin(number&);

    function w_chunk_open16(number&);

    function r_u32(number&);
    function r_u32();

    function w_begin(number);

    function w_u32(number);

    function r_u8(number&);
    function r_u8();

    function r_eof(net_packet*);

    function w_chunk_open8(number&);

    function r_vec3(vector&);

    function w_u8(number);

    function r_u16(number&);
    function r_u16();

    function r_float_q16(number&, number, number);

    function r_angle16(number&);

    function r_s64(__int64&);
    function r_s64();

    function w_angle16(number);

    function r_tell();

    function r_s16(number&);
    function r_s16();

    function w_clientID(ClientID&);

    function r_elapsed();

    function r_u64(unsigned __int64&);
    function r_u64();

    function w_sdir(const vector&);

    function r_clientID(net_packet*);

    function r_dir(vector&);

    function r_matrix(matrix&);

    function r_stringZ(net_packet*);

    function w_s16(number);

    function r_sdir(vector&);

    function w_matrix(matrix&);

    function w_u16(number);

    function r_float_q8(number&, number, number);

    function w_s64(__int64);

    function r_bool(net_packet*);

    function w_bool(net_packet*, boolean);

    function w_dir(const vector&);

    function w_s32(number);

    function w_stringZ(string);

    function w_float_q16(number, number, number);

    function r_s8(signed char&);
    function r_s8();

    function w_chunk_close8(number);

    function r_float(number&);
    function r_float();

    function w_angle8(number);

    function r_s32(number&);
    function r_s32();

    function w_float(number);

    function w_tell();

    function r_seek(number);

    function w_float_q8(number, number, number);

    function w_vec3(const vector&);

    function w_chunk_close16(number);

    function w_u64(unsigned __int64);

    function r_angle8(number&);

  };
   */
  // todo;
  /**
   *   C++ class SServerFilters {
   *     property empty;
   *     property full;
   *     property listen_servers;
   *     property with_pass;
   *     property without_ff;
   *     property without_pass;
   *
   *     SServerFilters ();
   *   };
   *
   * @customConstructor SServerFilters
   */
  class XR_SServerFilters {
    public empty: boolean;
    public full: boolean;
    public listen_servers: boolean;
    public with_pass: boolean;
    public without_ff: boolean;
    public without_pass: boolean;
  }

  /**
   * C++ class account_manager {
   *     function get_account_profiles(string, string, account_profiles_cb);
   *
   *     function create_profile(string, string, string, string, account_operation_cb);
   *
   *     function get_suggested_unicks() const;
   *
   *     function stop_suggest_unique_nicks();
   *
   *     function verify_password(string);
   *
   *     function verify_unique_nick(string);
   *
   *     function stop_searching_email();
   *
   *     function verify_email(string);
   *
   *     function search_for_email(string, found_email_cb);
   *
   *     function suggest_unique_nicks(string, suggest_nicks_cb);
   *
   *     function get_verify_error_descr() const;
   *
   *     function delete_profile(account_operation_cb);
   *
   *     function stop_fetching_account_profiles();
   *
   *     function get_found_profiles() const;
   *
   *   };
   */
  class XR_account_manager {
    public get_account_profiles(a: string, b: string, cb: XR_account_profiles_cb): unknown;

    public create_profile(a: string, b: string, c: string, d: string, cb: XR_account_profiles_cb): unknown;

    public get_suggested_unicks(): Array<string>;

    public stop_suggest_unique_nicks(): unknown;

    public verify_password(password: string): boolean;

    public verify_unique_nick(nick: string): boolean;

    public stop_searching_email(): void;

    public verify_email(email: string): boolean;

    public search_for_email(email: string, cb: XR_found_email_cb): void;

    public suggest_unique_nicks(nick: string, b: XR_suggest_nicks_cb): void;

    public get_verify_error_descr(): string;

    public delete_profile(operation: XR_account_operation_cb): void;

    public stop_fetching_account_profiles(): unknown;

    public get_found_profiles(): Array<string>;
  }

  /**
   C++ class ClientID {
    ClientID ();

    function value() const;

    operator ==(ClientID&, ClientID);

    function set(number);

  };
   */
  // todo;
  /**
   *   C++ class login_manager {
   *     function save_nick_to_registry(string);
   *
   *     function forgot_password(string);
   *
   *     function get_nick_from_registry();
   *
   *     function get_current_profile() const;
   *
   *     function get_remember_me_from_registry();
   *
   *     function stop_login();
   *
   *     function save_password_to_registry(string);
   *
   *     function login_offline(string, login_operation_cb);
   *
   *     function save_remember_me_to_registry(boolean);
   *
   *     function set_unique_nick(string, login_operation_cb);
   *
   *     function login(string, string, string, login_operation_cb);
   *
   *     function get_email_from_registry();
   *
   *     function logout();
   *
   *     function get_password_from_registry();
   *
   *     function save_email_to_registry(string);
   *
   *     function stop_setting_unique_nick();
   *
   *   };
   */
  class XR_login_manager {
    public save_nick_to_registry(nick: string): void;

    public forgot_password(url: string): unknown;

    public get_nick_from_registry(): string;

    public get_current_profile(): XR_profile;

    public get_remember_me_from_registry(): boolean;

    public stop_login(): void;

    public save_password_to_registry(password: string): unknown;

    public login_offline(nick: string, cb: XR_login_operation_cb): unknown;

    public set_unique_nick(nick: string, cb: XR_login_operation_cb): unknown;

    public login(a: string, b: string, c: string, cb: XR_login_operation_cb): unknown;

    public save_remember_me_to_registry(value: boolean): void;

    public get_email_from_registry(): string;

    public logout(): void;

    public get_password_from_registry(): string;

    public save_email_to_registry(email: string): unknown;

    public stop_setting_unique_nick(): unknown;
  }

  /**

   C++ class GameGraph__LEVEL_MAP__value_type {
    property id;
    property level;

  };
   *
   */
  // todo;
  /**

   C++ class MEMBERS__value_type {
    property id;
    property object;

  };
   *
   */
  // todo;
  /**
   *   C++ class award_pair_t {
   *     property first;
   *     property second;
   *
   *   };
   *
   * @constructor award_pair_t
   */
    class XR_award_pair_t {
      public first: XR_award_data;
      public second: XR_award_data;
    }

  /**
   *   C++ class best_scores_pair_t {
   *     property first;
   *     property second;
   *
   *   };
   *
   *  @customConstructor best_scores_pair_t
   */
  class XR_best_scores_pair_t {
    public first: XR_award_data;
    public second: XR_award_data;
  }

  /**
   * C++ class account_profiles_cb {
   *     account_profiles_cb ();
   *     account_profiles_cb (object, function<void>);
   *
   *     function bind(object, function<void>);
   *
   *     function clear();
   *
   *   };
   *
   * @customConstructor account_profiles_cb
   */
  class XR_account_profiles_cb {
    public constructor (object: object, cb: (this: object, code: number, description: string) => void);

    public bind(object: object, cb: (this: object, code: number, description: string) => void): void;

    public clear(): void;
  }

  /**
   *   C++ class login_operation_cb {
   *     login_operation_cb ();
   *     login_operation_cb (object, function<void>);
   *
   *     function bind(object, function<void>);
   *
   *     function clear();
   *
   *   };
   *
   *  @customConstructor login_operation_cb
   */
  class XR_login_operation_cb {
    public constructor (
      object: object,
      cb: (this: object, profile: XR_profile | null, description: string) => void
    );

    public bind(object: object, cb: (this: object, profile: XR_profile | null, description: string) => void): void;

    public clear(): void;
  }

  /**
   *   C++ class connect_error_cb {
   *     connect_error_cb ();
   *     connect_error_cb (object, function<void>);
   *
   *     function bind(object, function<void>);
   *
   *     function clear();
   *
   *   };
   *
   *  @customConstructor connect_error_cb
   */
  class XR_connect_error_cb {
    public constructor (object: object, cb: (this: object, code: number, description: string) => void);

    public bind(object: object, cb: (this: object, code: number, description: string) => void): void;

    public clear(): void;
  }

  /**
   *  C++ class account_operation_cb {
   *     account_operation_cb ();
   *     account_operation_cb (object, function<void>);
   *
   *     function bind(object, function<void>);
   *
   *     function clear();
   *
   *   };
   *
   *  @customConstructor account_operation_cb
   */
  class XR_account_operation_cb {
    public constructor (object: object, cb: (this: object, code: number, description: string) => void);

    public bind(object: unknown, cb: (this: object, code: number, description: string) => void): void;

    public clear(): void;
  }

  /**
   *  C++ class found_email_cb {
   *     found_email_cb ();
   *     found_email_cb (object, function<void>);
   *
   *     function bind(object, function<void>);
   *
   *     function clear();
   *
   *   };
   *
   *  @customConstructor found_email_cb
   */
  class XR_found_email_cb {
    public constructor (object: object, cb: (this: object, found: boolean, description: string) => void);

    public bind(object: object, cb: (this: object, found: boolean, description: string) => void): void;

    public clear(): void;
  }

  /**
   * C++ class store_operation_cb {
   *     store_operation_cb ();
   *     store_operation_cb (object, function<void>);
   *
   *     function bind(object, function<void>);
   *
   *     function clear();
   *
   * };
   *
   * @customConstructor store_operation_cb
   */
  class XR_store_operation_cb {
    public constructor (object: object, cb: (this: object, code: number, description: string) => void);

    public bind(object: object, cb: (this: object, code: number, description: string) => void): void;

    public clear(): void;
  }

  /**
   *  C++ class suggest_nicks_cb {
   *     suggest_nicks_cb ();
   *     suggest_nicks_cb (object, function<void>);
   *
   *     function bind(object, function<void>);
   *
   *     function clear();
   *
   *   };
   *
   * @customConstructor suggest_nicks_cb
   */
  class XR_suggest_nicks_cb {
    public constructor (object: object, cb: (this: object, result: number, description: string) => void);

    public bind(object: object, cb: (this: object, result: number, description: string) => void): void;

    public clear(): void;
  }

  /**
   *  C++ class Patch_Dawnload_Progress {
   *     function GetProgress();
   *
   *     function GetInProgress();
   *
   *     function GetStatus();
   *
   *     function GetFlieName();
   *
   *   };
   */
  class XR_Patch_Dawnload_Progress {
    public GetProgress(): number;

    public GetInProgress(): boolean;

    public GetStatus(): string;

    public GetFlieName(): string;

  }

  /**
   *  C++ class profile_store {
   *     const at_award_massacre = 0;
   *     const at_awards_count = 30;
   *     const bst_backstabs_in_row = 2;
   *     const bst_bleed_kills_in_row = 2;
   *     const bst_explosive_kills_in_row = 3;
   *     const bst_eye_kills_in_row = 4;
   *     const bst_head_shots_in_row = 3;
   *     const bst_kills_in_row = 0;
   *     const bst_kinife_kills_in_row = 1;
   *     const bst_score_types_count = 7;
   *
   *     function get_best_scores();
   *
   *     function get_awards();
   *
   *     function stop_loading();
   *
   *     function load_current_profile(store_operation_cb, store_operation_cb);
   *
   *   };
   */
  class XR_profile_store {
    public static at_award_massacre: 0;
    public static at_awards_count: 30;
    public static bst_backstabs_in_row: 2;
    public static bst_bleed_kills_in_row: 2;
    public static bst_explosive_kills_in_row: 3;
    public static bst_eye_kills_in_row: 4;
    public static bst_head_shots_in_row: 3;
    public static bst_kills_in_row: 0;
    public static bst_kinife_kills_in_row: 1;
    public static bst_score_types_count: 7;

    public get_best_scores(): Array<XR_best_scores_pair_t>;

    public get_awards(): Array<XR_award_pair_t>;

    public stop_loading(): unknown;

    public load_current_profile(onProgress: XR_store_operation_cb, onComlete: XR_store_operation_cb): unknown;
  }

}
