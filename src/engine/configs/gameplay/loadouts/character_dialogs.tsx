import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import { ActorDialog } from "@/engine/configs/gameplay/utils/ActorDialog";
import { StartDialog } from "@/engine/configs/gameplay/utils/StartDialog";

/**
 * Fragment with default character dialogs.
 * Including traveling options.
 */
export function DefaultCharacterDialogs(): JSXNode {
  return (
    <Fragment>
      <StartDialog>hello_dialog</StartDialog>
      <ActorDialog>about_skadovsk_dialog_stalkers</ActorDialog>
      <ActorDialog>about_skadovsk_dialog_bandit</ActorDialog>
      <ActorDialog>about_quests_dialog_stalkers</ActorDialog>
      <ActorDialog>about_quests_dialog_bandit</ActorDialog>
      <ActorDialog>about_quests_dialog_freedom</ActorDialog>
      <ActorDialog>about_quests_dialog_dolg</ActorDialog>
      <ActorDialog>dm_universal_dialog</ActorDialog>
      <ActorDialog>dm_traveler_dialog</ActorDialog>
      <ActorDialog>actor_break_dialog</ActorDialog>
    </Fragment>
  );
}

/**
 * Fragment with default character dialogs.
 * Does not include traveling dialogs.
 */
export function DefaultCharacterDialogsNoGuide(): JSXNode {
  return (
    <Fragment>
      <StartDialog>hello_dialog</StartDialog>
      <ActorDialog>about_skadovsk_dialog_stalkers</ActorDialog>
      <ActorDialog>about_skadovsk_dialog_bandit</ActorDialog>
      <ActorDialog>about_quests_dialog_stalkers</ActorDialog>
      <ActorDialog>about_quests_dialog_bandit</ActorDialog>
      <ActorDialog>about_quests_dialog_freedom</ActorDialog>
      <ActorDialog>about_quests_dialog_dolg</ActorDialog>
      <ActorDialog>dm_universal_dialog</ActorDialog>
      <ActorDialog>actor_break_dialog</ActorDialog>
    </Fragment>
  );
}
