import { add, ifThenElse, randomChoice, randomNumber, round } from "@/mod/scripts/utils/general";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("_tests");

log.info("a:", randomChoice(1, 2, 3, 4, 5, 6, 7, 8, 9));
log.info("b:", randomChoice(1, 2, 3, 4, 5, 6, 7, 8, 9));
log.info("c:", randomChoice(1, 2, 3, 4, 5, 6, 7, 8, 9));
log.info("d:", randomChoice(1, 2, 3, 4, 5, 6, 7, 8, 9));
log.info("e:", randomChoice(1, 2, 3, 4, 5, 6, 7, 8, 9));
log.info("f:", randomChoice(1, 2, 3, 4, 5, 6, 7, 8, 9));
log.info("g:", randomChoice(1, 2, 3, 4, 5, 6, 7, 8, 9));
