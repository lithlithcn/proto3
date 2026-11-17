'use strict';
/** Runs the queued load-time statements (DEFER) in load order: the game starts here. */
for(const f of DEFQ)f();DEFQ.length=0;DEFER=f=>f(); // files loaded after boot (engine, content) run at once
