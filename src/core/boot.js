'use strict';
/** Runs the queued load-time statements (DEFER) in load order: the game starts here. */
for(const f of DEFQ)f();DEFQ.length=0;
