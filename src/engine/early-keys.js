'use strict';
/** Loaded FIRST (before the game): content can see every keydown before the game does (secret codes, debug keys) by pushing
 *  a handler into EARLYKEY: handler(e) returns true to swallow the key. Without it the game's own listeners (e.g. the first key
 *  that only enables sound) could consume keys first. */
const EARLYKEY = [];
addEventListener('keydown', e => { for (const f of EARLYKEY) { try { if (f(e)) { e.preventDefault(); e.stopImmediatePropagation(); return; } } catch (x) {} } }, true);
