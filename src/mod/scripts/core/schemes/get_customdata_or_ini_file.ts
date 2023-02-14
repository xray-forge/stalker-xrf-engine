import { ini_file, XR_game_object, XR_ini_file } from "xray16";

import { Optional } from "@/mod/lib/types";
import { storage } from "@/mod/scripts/core/db";
import { loadLtx } from "@/mod/scripts/utils/gulag";

export function get_customdata_or_ini_file(npc: XR_game_object, filename: string): XR_ini_file {
  const st = storage.get(npc.id());

  if (filename === "<customdata>") {
    const ini: Optional<XR_ini_file> = npc.spawn_ini();

    return ini !== null ? ini : new ini_file();
  } else if ((string.find(filename, "*") as unknown as number) === 1) {
    if (st.job_ini !== null) {
      return new ini_file(st.job_ini);
    }

    return loadLtx(string.sub(filename, 2)) as unknown as XR_ini_file;
  } else {
    return new ini_file(filename);
  }
}
