import { Fragment, JSXNode, JSXXML } from "jsx-xml";

export function CharacterProfileCriticals(): JSXNode {
  return <critical_wound_weights>55,30,15</critical_wound_weights>;
}

export function DefaultCharacterDialogs(): JSXNode {
  return (
    <Fragment>
      <start_dialog>hello_dialog</start_dialog>
      <actor_dialog>about_skadovsk_dialog_stalkers</actor_dialog>
      <actor_dialog>about_skadovsk_dialog_bandit</actor_dialog>
      <actor_dialog>about_quests_dialog_stalkers</actor_dialog>
      <actor_dialog>about_quests_dialog_bandit</actor_dialog>
      <actor_dialog>about_quests_dialog_freedom</actor_dialog>
      <actor_dialog>about_quests_dialog_dolg</actor_dialog>
      <actor_dialog>dm_universal_dialog</actor_dialog>
      <actor_dialog>dm_traveler_dialog</actor_dialog>
      <actor_dialog>actor_break_dialog</actor_dialog>
    </Fragment>
  );
}

export function DefaultCharacterDialogsNoGuide(): JSXNode {
  return (
    <Fragment>
      <start_dialog>hello_dialog</start_dialog>
      <actor_dialog>about_skadovsk_dialog_stalkers</actor_dialog>
      <actor_dialog>about_skadovsk_dialog_bandit</actor_dialog>
      <actor_dialog>about_quests_dialog_stalkers</actor_dialog>
      <actor_dialog>about_quests_dialog_bandit</actor_dialog>
      <actor_dialog>about_quests_dialog_freedom</actor_dialog>
      <actor_dialog>about_quests_dialog_dolg</actor_dialog>
      <actor_dialog>dm_universal_dialog</actor_dialog>
      <actor_dialog>actor_break_dialog</actor_dialog>
    </Fragment>
  );
}
