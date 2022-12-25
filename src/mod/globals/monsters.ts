/* eslint sort-keys-fix/sort-keys-fix: "error"*/

export const monsters = {
  bloodsucker_normal: "bloodsucker_normal",
  bloodsucker_strong: "bloodsucker_strong",
  bloodsucker_weak: "bloodsucker_weak",
  boar_strong: "boar_strong",
  boar_weak: "boar_weak",
  burer: "burer",
  chimera: "chimera",
  controller: "controller",
  dog: "dog",
  flesh_strong: "flesh_strong",
  flesh_weak: "flesh_weak",
  gigant: "gigant",
  none: "none",
  poltergeist_flame: "poltergeist_flame",
  poltergeist_tele: "poltergeist_tele",
  pseudodog_strong: "pseudodog_strong",
  pseudodog_weak: "pseudodog_weak",
  psy_dog_strong: "psy_dog_strong",
  psy_dog_weak: "psy_dog_weak",
  snork: "snork",
  tushkano: "tushkano"
};

export type TMonsters = typeof monsters;

export type TMonster = TMonsters[keyof TMonsters];
