/**
 * Pictures for the rider-login toolbox (components/toolbox-login.tsx).
 * Files: public/images/toolbox/<name>-<hash>.webp, listed in toolbox-images.json — both generated from
 * assets/Modern-Automobiles-Toolbox/assets by `npm run images:toolbox` (run it after replacing a picture).
 *
 * The art is laid out in "stage space": the supplied 1672x941 mock-up minus its painted-in header and title
 * (the live page has its own), i.e. 1232x861 — see scripts/build-toolbox-images.cjs.
 */
import toolboxImages from "./toolbox-images.json";

type Pic = { src: string; width: number; height: number };

const images = toolboxImages as unknown as { crop: { x: number; y: number }; stage: Pic; front: Pic; tray: Pic };

export const TOOLBOX_STAGE = images.stage;
export const TOOLBOX_FRONT = images.front;
export const TOOLBOX_TRAY = images.tray;

/** stage size in stage px (the unit every number in globals.css `.tb-*` is expressed in) */
export const STAGE_W = images.stage.width;
export const STAGE_H = images.stage.height;
