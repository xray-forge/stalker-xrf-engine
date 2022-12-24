import { setCurrentTime } from "@/mod/scripts/utils/alife";
import { add, ifThenElse, randomChoice, randomNumber, round } from "@/mod/scripts/utils/general";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { isInTimeInterval } from "@/mod/scripts/utils/time";

const log: LuaLogger = new LuaLogger("_tests");

/**
 * round = utilsGeneral.round
 * add = utilsGeneral.add
 * if_then_else = utilsGeneral.ifThenElse
 * random_choice = utilsGeneral.randomChoice
 * random_number = utilsGeneral.randomNumber
 */

log.info("T:", round(1.99));
log.info("T:", round(1.8));
log.info("T:", round(1.5));
log.info("T:", round(1.2));
log.info("T:", round(1));

log.info("S:", add(1));
log.info("S:", add(2));
log.info("S:", add(3));
log.info("S:", add(4));

log.info("E:", ifThenElse(true, 999, 1));
log.info("E:", ifThenElse(false, 999, 1));

log.info("FFF:", randomChoice(1, 2, 3, 4, 5, 6, 7, 8, 9));
log.info("FFF:", randomChoice(1, 2, 3, 4, 5, 6, 7, 8, 9));
log.info("FFF:", randomChoice(1, 2, 3, 4, 5, 6, 7, 8, 9));
log.info("FFF:", randomChoice(1, 2, 3, 4, 5, 6, 7, 8, 9));
log.info("FFF:", randomChoice(1, 2, 3, 4, 5, 6, 7, 8, 9));
log.info("FFF:", randomChoice(1, 2, 3, 4, 5, 6, 7, 8, 9));
log.info("FFF:", randomChoice(1, 2, 3, 4, 5, 6, 7, 8, 9));
log.info("FFF:", randomChoice(1, 2, 3, 4, 5, 6, 7, 8, 9));
log.info("FFF:", randomChoice(1, 2, 3, 4, 5, 6, 7, 8, 9));
log.info("FFF:", randomChoice(1, 2, 3, 4, 5, 6, 7, 8, 9));
log.info("FFF:", randomChoice(1, 2, 3, 4, 5, 6, 7, 8, 9));
log.info("FFF:", randomChoice(1, 2, 3, 4, 5, 6, 7, 8, 9));
log.info("FFF:", randomChoice(1, 2, 3, 4, 5, 6, 7, 8, 9));
log.info("FFF:", randomChoice(1, 2, 3, 4, 5, 6, 7, 8, 9));
log.info("FFF:", randomChoice(1, 2, 3, 4, 5, 6, 7, 8, 9));

log.info("G:", randomNumber());
log.info("G:", randomNumber());
log.info("G:", randomNumber());
log.info("G:", randomNumber());

log.info("Y:", randomNumber(1, 10));
log.info("Y:", randomNumber(100, 200));
log.info("Y:", randomNumber(500, 1000));
