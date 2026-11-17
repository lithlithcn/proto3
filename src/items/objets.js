'use strict';
// ================= Objets (cartes du centre) =================
let RB,PAL;DEFER(()=>{RB=['#ff4a4a','#ffa63a','#ffe83a','#5cff7a','#4ab3ff','#c06cff'];PAL=LCOLS.concat(RB,['#e0e6f0','#bff6ff'])});
const rainbowCol=()=>`hsl(${frame*6%360},100%,65%)`,itemCol=k=>k==='rainbow'?rainbowCol():ITEMS.find(i=>i.k===k).c;
const ITEMS=[
 {k:'yellow',name:'Blade',c:'#ffe23a',d:'Two blades spin around you and cut anyone they touch (10 s).'},
 {k:'white',name:'Rifle',c:'#ffffff',d:'Heavy button: aim, then fire a thin deadly shot (2 shots). Parried = it kills YOU.'},
 {k:'green',name:'Healing orbs',c:'#5cff8a',d:'12 orbs bounce everywhere. Touch one to heal 100 HP (anyone!).'},
 {k:'purple',name:'Warp',c:'#b45cff',d:'For 10 s walls wrap around: exit left, come back right. No red zone.'},
 {k:'blue',name:'Fairies',c:'#6cf',d:'7 s: 3 fairy thieves steal spell gauge and power from the richest foe and bring it to you. Shoot them down!'},
 {k:'orange',name:'Bombs',c:'#ff9a2a',d:'Zones appear near your foes and explode after 3, 2, 1.'},
 {k:'mirror',name:'Mirror Aura',c:'#e0e6f0',d:'8 s: every bullet that touches you bounces back at its shooter.'},
 {k:'world',ch:'Sakuya Izayoi',name:'The World',c:'#00d0a0',d:'Time stops after a 3 s countdown: for 4 s only you move, and knives appear all around your foes, frozen in the air... until time resumes.'},
 {k:'gap',name:'Black Hole',c:'#ffa040',d:'A black hole opens for 6 s: it pulls fighters and bullets from the WHOLE map, grows with everything it swallows and hurts at its center.'},
 {k:'oni',name:'Oni Giant',c:'#c8102e',d:'10 s: you grow huge. Melee reach x1.6, damage x1.5, half knockback. Bigger target!'},
 {k:'clone',name:'Doppelganger',c:'#8a8f9a',d:'10 s: a mirror clone on the other side of the map copies all your shots.'},
 {k:'freeze',name:'Perfect Freeze',c:'#a8f0ff',d:'Every enemy bullet freezes, then shatters in all directions as YOURS.'},
 {k:'spark',name:'Master Spark',c:'#fff5a0',d:'Charge 1 s, then fire a giant laser for 1.5 s. Turns slowly. Parry each hit!'},
 {k:'saisen',ch:'Reimu Hakurei',name:'Donation Box',c:'#d04040',d:'Minigame! Everyone aims at Reimu\'s donation box: SPAM (or hold) the shot button to throw coins. Most yen = +1 LIFE.'},
 {k:'elixir',name:'Hourai Elixir',c:'#ff5030',d:'6 s: invincible and faster. Touching foes burns and launches them.'},
 {k:'bumpers',name:'Kappa Bumpers',c:'#1fb5a5',d:'5 bumpers for 7 s: fighters and bullets bounce off them.'},
 {k:'camera',name:'Tengu Camera',c:'#d4a050',d:'Heavy button = photo (3 shots): erases bullets in the frame and stuns foes.'},
 {k:'rumia',ch:'Rumia',name:'The Darkness Feeds',c:'#6b5bb0',d:'8 s: you throw dark orbs that SWALLOW every bullet they touch. A foe hit by darkness becomes EDIBLE: hit them in melee to EAT them (heals you, hurts them), then spit them out Kirby-style into a wall.'},
 {k:'daiyousei',ch:'Daiyousei',name:'Fairy Ambush',c:'#7fe0a0',d:'8 s: 14 fairies line every edge of the screen and fire at random at your foes.'},
 {k:'rin',ch:'Rin Satsuki',name:'Anonymous Fairy',c:'#9aa',d:'8 s: everyone becomes an identical grey silhouette, the HUD vanishes and 5 decoys copy your moves. Who is who?'},
 {k:'meiling',ch:'Hong Meiling',name:'The Gate Is Closed',c:'#3fbf6f',d:'10 s: a wall splits the arena in two and only YOU can cross it. Foes on your side get rainbow-kicked automatically.'},
 {k:'koakuma',ch:'Koakuma',name:'Devil Pact',c:'#c0392b',d:'K.O. someone within 10 s and you swap EVERYTHING (lives, HP, gauges) with the leader. Already leading? +1 life.'},
 {k:'patchouli',ch:'Patchouli Knowledge',name:'Philosopher Stone',c:'#b07cd8',d:'12 s: a new terrain is added every 2.4 s and they STACK: Fire burns if you stand still, Water makes you slide, Wood roots you, Metal makes bullets bounce off walls, Earth quakes.'},
 {k:'remilia',ch:'Remilia Scarlet',name:'Spear the Gungnir',c:'#e0302f',d:'Heavy button (x2): a GIANT spear that destroys every bullet and leaves a blood trail. Touch the trail: heavy damage and you are CAGED.'},
 {k:'flandre',ch:'Flandre Scarlet',name:'Four of a Kind',c:'#ff3030',d:'10 s: 4 copies of you attack with you. Melee a foe when their red ring closes = ONE SHOT. Your heavy bullets destroy absolutely everything.'},
 {k:'letty',ch:'Letty Whiterock',name:'Eternal Winter',c:'#cfe8ff',d:'10 s: the floor freezes, snowflakes fall and freeze foes, and anyone standing still turns to ice. Heavy hit on ice = x2.5. Fire melts it.'},
 {k:'chen',ch:'Chen',name:'Pinball Cat',c:'#d9534f',d:'6 s: you become a spinning ball bouncing everywhere, ramming foes. Hits only make you ricochet.'},
 {k:'ran',ch:'Ran Yakumo',name:'Ultimate Shikigami',c:'#f2c14e',d:'10 s: nine whirling tails, you bounce everywhere spraying big bullets. +5% speed per bounce. Hits only make you ricochet.'},
 {k:'shanghai',ch:'Shanghai Doll',name:'Body Swap',c:'#5aa0e0',d:'8 s: you swap bodies with the nearest foe. You control them, they control you.'},
 {k:'hourai',ch:'Hourai Doll',name:'Cursed Link',c:'#e070a0',d:'8 s: all your foes are linked: damage to one hurts them ALL. Plus a voodoo doll: bullets that hit it hurt its victim x1.5.'},
 {k:'lily',ch:'Lily White',name:'Spring Is Here',c:'#ffd6f0',d:'8 s: EVERY bullet becomes a healing flower. Pure melee! Falling petals give small stat boosts.'},
 {k:'lunasa',ch:'Lunasa Prismriver',name:'Tempo Lento',c:'#6a6ad8',d:'6 s: time slows for everyone but you. Music notes (big bullets) make victims even more vulnerable.'},
 {k:'merlin',ch:'Merlin Prismriver',name:'Mania',c:'#e8e8ff',d:"5 s: the whole game runs at x2 speed. Music notes add vulnerability."},
 {k:'lyrica',ch:'Lyrica Prismriver',name:'Phantom Sounds',c:'#ff6b6b',d:'7 s: a GIANT music staff covers the whole screen. Its notes hurt your foes and fire big danmaku at them; hit a note (melee) to burst it into big danmaku.'},
 {k:'layla',ch:'Layla Prismriver',name:'Final Concert',c:'#c8a0ff',d:'10 s: a rhythm game! Foes must press PARRY on every beat; each missed note hurts.'},
 {k:'youmu',ch:'Youmu Konpaku',name:'Half-Phantom Slash',c:'#9fe0c0',d:'10 s: your attack button becomes a forward flash slash (1.5 s cooldown), and Myon copies every slash a moment later.'},
 {k:'yuyuko',ch:'Yuyuko Saigyouji',name:'Invitation to Death',c:'#ff9ad5',d:'10 s countdown under a storm of sakura: at zero, whoever has the LOWEST HP dies. Falling fruits heal.'},
 {k:'saigyou',ch:'Saigyou Ayakashi',name:'Kill or Die',c:'#ffb7d5',d:'A cursed tree spits petals. K.O. someone before it withers or IT kills you. The foe who destroys it dies.'},
 {k:'wriggle',ch:'Wriggle Nightbug',name:'Metamorphosis',c:'#c8ff5a',d:'You become a cocoon: wiggle the stick in all directions to hatch. Take 25 damage first and you get nothing. Butterfly: x2 damage, flies over small bullets.'},
 {k:'mystia',ch:'Mystia Lorelei',name:'Night Sparrow',c:'#b06cff',d:'8 s: darkness swallows the whole screen. Only a small circle of light around YOU remains.'},
 {k:'keine',ch:'Keine Kamishirasawa',name:'History Rewritten',c:'#5a8cff',d:'Everyone else goes back 10 s in time (position, HP, lives, gauges). You do not.'},
 {k:'tewi',ch:'Tewi Inaba',name:'Rule Roulette',c:'#ff8fb0',d:'12 s: a random game rule every 2 s (gravity, giants, shuffle, bullets x2, item rain, tiny, HP rotate, reverse). Lucky Tewi often dodges the bad ones.'},
 {k:'reisen',ch:'Reisen Udongein Inaba',name:'Lunatic Red Eyes',c:'#ff3355',d:'8 s: every foe is displayed 80 px away from their real hitbox.'},
 {k:'eirin',ch:'Eirin Yagokoro',name:'Pharmacy',c:'#7fa8ff',d:'10 s: red and blue pills fly in from the edges. Foes who catch one get drugged: giant, hyper, tiny & fragile or drunk.'},
 {k:'kaguya',ch:'Kaguya Houraisan',name:'Five Impossible Requests',c:'#ffcf6a',d:'5 treasures appear, each with a power. Get all 5 = IMMORTAL 10 s with a lethal touch. Attack (x3): an instant line that sends whatever enters it back to where you drew it.'},
 {k:'mokou',ch:'Fujiwara no Mokou',name:'Immortal Kamikaze',c:'#ff4b1f',d:'15 s: every death = instant rebirth in a fire explosion, no life lost. But water hurts you x2.'},
 {k:'medicine',ch:'Medicine Melancholy',name:'Poison Trail',c:'#a050ff',d:'10 s: you leave a poison cloud trail wherever you move.'},
 {k:'komachi',ch:'Komachi Onozuka',name:'Distance: Zero',c:'#e04a4a',d:'10 s: the arena shrinks to a tiny box. Everyone is crammed in together.'},
 {k:'eiki',ch:'Eiki Shiki',name:'Verdict',c:'#3a7f5a',d:'5 beams of light, each on a different foe, hit harder the more damage they dealt. Then a verdict: if a FOE dealt the most damage, they lose a life and the most peaceful gains one. You are the judge: you are never condemned.'},
 {k:'shizuha',ch:'Shizuha Aki',name:'Fallen Leaves',c:'#ff8a2a',d:"8 s: every foe bullet falls to the ground like a dead leaf, and foes' spell and burst gauges wither."},
 {k:'minoriko',ch:'Minoriko Aki',name:'Great Harvest',c:'#e8c040',d:'10 s: all the damage you deal is stored. At the end you harvest it as healing x2.'},
 {k:'hina',ch:'Hina Kagiyama',name:'Vortex of Misfortune',c:'#c070ff',d:'You suck every nearby bullet into an orbit around you (they become yours), then release them all in a spiral.'},
 {k:'nitori',ch:'Nitori Kawashiro',name:'Kappa Mech',c:'#4ab3ff',d:'15 s: giant robot. You take only 30% damage, spray strong water jets (x2 vs Mokou). Heavy = huge rocket punch that comes back.'},
 {k:'momiji',ch:'Momiji Inubashiri',name:'Mountain Guard',c:'#e0e6f0',d:'6 s: you parry EVERYTHING automatically. Each parry stacks your base attack x1.3...'},
 {k:'sanae',ch:'Sanae Kochiya',name:'Wind of Fortune',c:'#5cff7a',d:'Focus 3 s without moving. If nobody hits you: lightning strikes every foe, -40 HP and ALL pips broken.'},
 {k:'kanako',ch:'Kanako Yasaka',name:'Onbashira Rain',c:'#e04a4a',d:'10 s: giant pillars crash down on foes (watch the shadow) and stay planted, turning the arena into a bullet-blocking maze.'},
 {k:'suwako',ch:'Suwako Moriya',name:'Underground Frog',c:'#c8b050',d:'8 s: dive underground, invisible and untouchable. Attack or Heavy: burst out with a shockwave and a ring of frogs.'},
 {k:'yamame',ch:'Yamame Kurodani',name:'Spider Webs',c:'#e8e8c0',d:'Webs stretch across the arena for 10 s. Foes who cross one get stuck and sick.'},
 {k:'parsee',ch:'Parsee Mizuhashi',name:'Green-Eyed Jealousy',c:'#5cff7a',d:'10 s: every foe with more HP or more lives than you loses HP nonstop. The bigger the gap, the faster.'},
 {k:'yuugi',ch:'Yuugi Hoshiguma',name:'Oni Throw',c:'#e04a4a',d:'10 s: attack grabs the foe and hurls them like a cannonball. They smash anyone in their path and break a pip on the wall.'},
 {k:'satori',ch:'Satori Komeiji',name:'Mind Reading',c:'#ff8fd0',d:"8 s: foes' controls lag 0.4 s behind. And you copy the last item of the nearest foe."},
 {k:'orin',ch:'Rin Kaenbyou',name:'Fires of Hell',c:'#ff5030',d:'10 s: the red zone becomes hellfire (x5 damage) and creeps toward the center. You are immune.'},
 {k:'okuu',ch:'Utsuho Reiuji',name:'Nuclear Fusion',c:'#ffa63a',d:'A growing sun pulls everyone in and burns them. After 10 s: SUPERNOVA hits every foe.'},
 {k:'koishi',ch:'Koishi Komeiji',name:'Unconscious',c:'#7fe0a0',d:'8 s: you are almost invisible, auto-aim and CPUs ignore you, your HUD vanishes.'},
 {k:'nazrin',ch:'Nazrin',name:'Dowsing',c:'#aaa',d:'10 s: item cards drift slowly toward you, and the next 3 cards appear right on you.'},
 {k:'kogasa',ch:'Kogasa Tatara',name:'Surprise Shower',c:'#a060ff',d:'8 s: a rain of bullets slows everyone; only you have an umbrella. BOO! stuns a random foe now and then.'},
 {k:'ichirin',ch:'Ichirin Kumoi',name:'Unzan Fists',c:'#b0b8d0',d:'7 s: the big pink ghost Unzan floats behind you; your attacks are his GIANT fists: huge area, huge damage, foes fly very far.'},
 {k:'minamitsu',ch:'Minamitsu Murasa',name:'Shipwreck',c:'#3a7fff',d:'10 s: the arena floods. Water slows players AND bullets and drowns foes. Sharks bite, fish heal whoever kills them. Heavy = anchor that drags a foe to you.'},
 {k:'shou',ch:'Shou Toramaru',name:'Inner Light',c:'#ffe83a',d:'10 s: a light grows inside you with every hit you TAKE. At the end it explodes, as big as the damage you took.'},
 {k:'byakuren',ch:'Byakuren Hijiri',name:'Ancient Scroll',c:'#c06cff',d:'Read for 5 s, then a random spell card of the game is cast with 5x more danmaku.'},
 {k:'nue',ch:'Nue Houjuu',name:'Undefined Flying Objects',c:'#c06cff',d:'UFOs fire weird heavy bullets: a foe hit loses one action (it becomes ???). Breaking a UFO excites the others. Catch 3 of one color = free LAST WORD.'},
 {k:'reimu',ch:'Reimu Hakurei',name:'Fantasy Sky',c:'#ff4a4a',d:'7 s: up to 5 power orbs bounce around and hit HARD (parry = x1.3). Take no melee hit and stand near the center at the end: FANTASY SKY, an unavoidable one-shot on everyone.'},
 {k:'kyouko',ch:'Kyouko Kasodani',name:'Mountain Echo',c:'#5cff7a',d:'8 s: every hit you take is echoed back to whoever dealt it: a green echo flies back and hits them 1 s later, at full power.'},
 {k:'yoshika',ch:'Yoshika Miyako',name:'Jiang-shi',c:'#7a9ac0',d:'10 s: you cannot die (HP can go below 0) and every hit you land heals you 50%. Still below 0 at the end? You collapse.'},
 {k:'seiga',ch:'Seiga Kaku',name:'Necromancy',c:'#3a7fff',d:'Summons Yoshika: an unkillable zombie that hops after foes and bites (poison). Heavy hits only stun it.'},
 {k:'tojiko',ch:'Soga no Tojiko',name:'Chain Thunder',c:'#9ad0ff',d:'10 s: lightning strikes fall (warning circle first). A struck player is ELECTRIFIED: anyone touching them is shocked, and the electricity jumps to the nearest player.'},
 {k:'futo',ch:'Mononobe no Futo',name:'Feng Shui Plates',c:'#e8e8e8',d:'Flying plates appear. Break one (shoot or touch it): a random element flies at a foe: Fire trail, Water slip, Wind push, Earth shards, Ice prison, Darkness zone, Light beam.'},
 {k:'miko',ch:'Toyosatomimi no Miko',name:'Imperial Orders',c:'#e8c040',d:'10 s of "Simon says": STOP! MOVE! NO SHOOTING! DASH! PARRY! Every foe who disobeys gets a giant SHAKU smack that sends them flying to the edge.'},
 {k:'mamizou',ch:'Mamizou Futatsuiwa',name:'Tanuki Transformation',c:'#c08040',d:'Pick ANY power from a menu (5 s, sorted by game). Plus 3 leaves (Heavy): a foe hit becomes a tiny harmless tanuki for 5 s.'},
 {k:'wakasagi',ch:'Wakasagihime',name:'Puddle Network',c:'#3a7fff',d:'10 s: puddles everywhere, you are x2 faster in them. Heavy in a puddle: dive and burst out of another with a splash.'},
 {k:'sekibanki',ch:'Sekibanki',name:'Nine Heads',c:'#e04a4a',d:'10 s: 9 flying heads orbit you, slowly dive at foes and fire eye beams (red line = warning). Dash = swap places with a head.'},
 {k:'kagerou',ch:'Kagerou Imaizumi',name:'Full Moon',c:'#c8c8ff',d:'10 s werewolf: x1.5 speed, tail and ears, your melee becomes a GIANT BITE (bigger, x1.4), no attack recovery, every bite heals. Your howl makes nearby foes FLEE.'},
 {k:'benben',ch:'Benben Tsukumo',name:'Resonance',c:'#c06cff',d:'10 s: your bullets split in two every time they hit a wall (up to 3 times). Chain reaction!'},
 {k:'yatsuhashi',ch:'Yatsuhashi Tsukumo',name:'Glissando',c:'#ff6b6b',d:'3 laser strings sweep the screen: downward, to the right, then upward. Only a dash goes through them.'},
 {k:'seija',ch:'Seija Kijin',name:'Reverse Ideology',c:'#ff4a4a',d:'10 s: the screen turns upside down and the hierarchy flips: the lowest HP deals x3 damage, the highest only x0.3.'},
 {k:'shinmyou',ch:'Shinmyoumaru Sukuna',name:'Wonder Mallet',c:'#ffd23a',d:'10 s: every melee hit makes you BIGGER and the foe SMALLER (size, hitbox and damage).'},
 {k:'raiko',ch:'Raiko Horikawa',name:'War Drum',c:'#ff7b2c',d:'TAIKO TIME: a drum track appears at the top. Foes can only drum (their Heavy, Attack and Parry buttons stop fighting): hit each note on time (RED = Heavy, BLUE = Attack, BIG = Parry) or it snipes them.'},
 {k:'seiran',ch:'Seiran',name:'Mochie Mania',c:'#4ab3ff',d:'10 s: your attack spawns a MOCHI, then pounds it with a giant wooden mallet. The mochi bounces everywhere, faster with every hit, and hurts foes. Mallet on a wall = BOOM + big danmaku.'},
 {k:'ringo',ch:'Ringo',name:'Dango Feast',c:'#ffb04a',d:'10 s: your big danmaku are DANGOS. A foe hit becomes FAT for 7 s: bigger hitbox and -30% speed.'},
 {k:'doremy',ch:'Doremy Sweet',name:'Dreams & Nightmares',c:'#ffb0e0',d:'Thought bubbles drift around: dreams give random boosts, nightmares random curses. HOLD Heavy 2 s near one to EAT it = one-shot everyone inside.'},
 {k:'sagume',ch:'Sagume Kishin',name:'Tongue of Reversal',c:'#e8e8ff',d:'She speaks a prophecy and the OPPOSITE happens for 10 s (shown at the top of the screen).'},
 {k:'clown',ch:'Clownpiece',name:'Moonfall',c:'#ff4a4a',d:'10 s: the MOON falls on foes 4 times. Watch the shadow.'},
 {k:'junko',ch:'Junko',name:'Pure Purification',c:'#ff3355',d:'10 s: a giant aura of pure flames burns behind you. It dissolves every attack it touches; a foe who touches it loses ALL items, gauges and levels. You get everything at max, and your shots dissolve foe bullets.'},
 {k:'hecatia',ch:'Hecatia Lapislazuli',name:'Three Worlds',c:'#ff4a4a',d:'10 s: Earth (pulls), Moon (reflects bullets) and Otherworld (teleports foes away) orbit you.'},
 {k:'larva',ch:'Eternity Larva',name:'Chrysalis',c:'#c8ff5a',d:'8 s: foe bullets near you freeze into cocoons, then hatch as butterflies that hunt your foes.'},
 {k:'nemuno',ch:'Nemuno Sakata',name:'Territory',c:'#e04a4a',d:'10 s: your zone. Inside it you deal x2 and ignore small bullets; trespassers are slowed and pelted with knives.'},
 {k:'aunn',ch:'Aunn Komano',name:'Komainu Guard',c:'#5cff7a',d:'12 s: a guard dog stands between you and the foe, eats bullets aimed at you and bites.'},
 {k:'narumi',ch:'Narumi Yatadera',name:'Living Statue',c:'#a0a0a0',d:'10 s SUPER ARMOR: you are slowed and take damage, but nothing stuns or pushes you, and your hits knock back x2.'},
 {k:'satono',ch:'Satono Nishida',name:'Forced Dance',c:'#ff8fd0',d:'10 s: every 3 s, foes lose control and dance in circles for 1.5 s.'},
 {k:'mai',ch:'Mai Teireida',name:'Bamboo Choreography',c:'#5cff7a',d:'7 bamboos fall and plant themselves. A foe who touches one is thrown at the next bamboo, then the next... BAMBOO COMBO!'},
 {k:'okina',ch:'Okina Matara',name:'Secret Back Doors',c:'#ffd23a',d:'10 s: 3 mirrors appear. Walk into one: you come out BEHIND the nearest foe and backstab them (x2 melee).'},
 {k:'yukari',ch:'Yukari Yakumo',name:'Boundary of Everything',c:'#c020e0',d:'Gaps open everywhere, each casting a random spell card. At the end a giant gap releases a TRAIN that crosses the screen 3 times.'},
 {k:'eika',ch:'Eika Ebisu',name:'Stone Tower',c:'#c8b8a0',d:'10 s: a stone falls on your spot every 2 s (shadow first). Stay under it to STACK it: more damage, and the tower fires 1 big danmaku per stone. A falling stone smashes foes down.'},
 {k:'urumi',ch:'Urumi Ushizaki',name:'Crushing Weight',c:'#8a7a6a',d:'10 s: 3 zones of crushing gravity. Any danmaku that touches one becomes HUGE and super heavy (x2 damage) and falls to the bottom.'},
 {k:'kutaka',ch:'Kutaka Niwatari',name:'Chicken Swarm',c:'#ffd23a',d:'12 chickens chase foes and peck them in every direction (no damage). Hit a chicken and it gets ANGRY: red and much faster.'},
 {k:'yachie',ch:'Yachie Kicchou',name:'Contract',c:'#6a9a4a',d:'5 s: the nearest foe signs a CONTRACT: +20% damage and double spell gauge gain. If they do not hit you before it ends, they lose the will to fight: no attack for 2.5 s.',old:'10 s: every 3rd hit you land on a foe stops them from attacking for 2.5 s. They can run, never fight back.'},
 {k:'mayumi',ch:'Mayumi Joutouguu',name:'Haniwa Army',c:'#c87a4a',d:'8 clay soldiers march in formation and shoot. Each soldier still standing gives you +10% damage.'},
 {k:'keiki',ch:'Keiki Haniyasushin',name:'Sculpt the Arena',c:'#5cff7a',d:'8 s: your path leaves SOLID clay walls (8 s). Draw the arena: trap the foe, block bullets.'},
 {k:'saki',ch:'Saki Kurokoma',name:'Full Gallop',c:'#555',d:'8 s: you can never stop. Speed builds up; ramming AND dashing hurt harder the faster you go. Max speed = STAMPEDE.'},
 {k:'yuuma',ch:'Yuuma Toutetsu',name:'Devour Everything',c:'#c03030',d:'8 s: you slowly vacuum bullets (they heal you) and cards. Your melee is a GIANT SPOON: no damage, but it throws foes far away.'},
 {k:'mike',ch:'Mike Goutokuji',name:'Coin Rain',c:'#ffd23a',d:'12 s: it rains coins for everyone. The first fighter to grab 100 coins wins +1 LIFE.'},
 {k:'takane',ch:'Takane Yamashiro',name:'Forest Qi',c:'#3a9a3a',d:'6 trees heal you, drain the gauges of foes nearby into yours and block bullets. WATER attacks feed them (bigger, stronger); FIRE burns them down.'},
 {k:'sannyo',ch:'Sannyo Komakusa',name:'Hypnotic Smoke',c:'#c8a8ff',d:'10 s: drifting smoke clouds. Foes inside are slowed, and the bullets they fire from inside switch to YOUR side.'},
 {k:'misumaru',ch:'Misumaru Tamatsukuri',name:'Magatama Jewels',c:'#4ab3ff',d:"6 floating jewels. A foe who touches one gets their power COPIED and used against them. Jewels that touch nobody fly at a foe and stick: 5 stuck = explosion."},
 {k:'tsukasa',ch:'Tsukasa Kudamaki',name:'Whispers',c:'#e8e0a0',d:"10 s: foes' HP bars lie (shown inverted) and their auto-aim is twisted 90°."},
 {k:'megumu',ch:'Megumu Iizunamaru',name:'Starry Constellation',c:'#4a6aff',d:'Heavy: place a star where you stand (x6). With 6 stars the constellation lights up: its lines hurt and shooting stars rain on foes for 10 s.'},
 {k:'chimata',ch:'Chimata Tenkyuu',name:'Ownerless Market',c:'#ffd23a',d:"10 s: nothing belongs to anyone. Bullets hurt their own shooter (not you), and foes' active powers drop on the floor as cards."},
 {k:'momoyo',ch:'Momoyo Himemushi',name:'Dragon Eater',c:'#40c080',d:'A giant dragon snakes around attacking and breathing fire on everyone but you. Touch its head to EAT it: full HP, giant, x2 damage, and Heavy = fire breath.'},
 {k:'biten',ch:'Son Biten',name:'Ruyi Staff',c:'#e8a040',d:'8 s: your attack extends a long staff across a big part of the screen.'},
 {k:'enoko',ch:'Enoko Mitsugashira',name:'The Hunt',c:'#a08060',d:'Hidden traps (3 s immobilized) + 3 hounds that herd the weakest foe into them.'},
 {k:'chiyari',ch:'Chiyari Tenkajin',name:'Bloodthirst',c:'#c01020',d:'10 s: your hits make foes BLEED: they lose HP while moving and drop blood you drink for HP and gauge.'},
 {k:'hisami',ch:'Hisami Yomotsu',name:'Eternal Pursuit',c:'#8a4ac0',d:'You chain yourself to a foe and follow them everywhere; the chain drains them. They must parry 3 times to break it.'},
 {k:'zanmu',ch:'Zanmu Nippaku',name:'Nothingness',c:'#444',d:'10 s: random cells of the arena turn into VOID (warning first). Anyone standing on a void cell when it opens is ERASED.'},
 {k:'ubame',ch:'Ubame Chirizuka',name:'The Mountain Tilts',c:'#8a6a4a',d:'Everyone is teleported into their own colored zone for 7 s. The fighter who took the most damage sees their zone collapse: ONE SHOT. Ends early if someone dies.'},
 {k:'chimi',ch:'Chimi Houjuu',name:'Mountain Spirits',c:'#5a8a5a',d:'A giant mountain rises from the bottom (red column = warning): one-shot. Then water rains from the sky (pushes down) and rivers flow down its sides, carrying players away.'},
 {k:'nareko',ch:'Nareko Michigami',name:'One Way Only',c:'#e8c040',d:'10 s: a maze of arrows covers the middle of the arena. Inside it, foes can only move along the arrows, and every arrow path leads out of the maze.'},
 {k:'yuiman',ch:'Yuiman Asama',name:"Serpent's Rebirth",c:'#ff5030',d:'10 s: a serpent coils around you and swallows foe danmaku, then spits them back at the nearest foe: bigger, faster, stronger.'},
 {k:'toyohime',ch:'Watatsuki no Toyohime',name:'Lunar Fan',c:'#e8e8ff',d:'One sweep of the fan erases every foe bullet and slams every foe away (and breaks a pip). Then the fan keeps waving for 5 s, blowing foes toward the red zone.'},
 {k:'ariya',ch:'Ariya Iwanaga',name:'Stone Gaze',c:'#b0a080',d:'7 s: foe shots that enter the circle around you turn to STONE. Hit a stone (melee) to launch it back (light damage), then it shatters into small shards.'},
 {k:'nina',ch:'Nina Watari',name:'Mirage',c:'#a0e0ff',d:'10 s: the whole scene is doubled by a mirrored, swaying mirage of fake fighters, bullets and fake item activations.'},
 {k:'rainbow',name:'Last Word',c:'rainbow',d:'Every 35 s, takes 3 s to grab. Unlocks your LAST WORD: press Spell.',rare:1}];
const itemOn={};DEFER(()=>{ITEMS.forEach(i=>itemOn[i.k]=true);});
const IM={dark:{dmg:5,kb:6,stun:26,arm:0},gtr:{dmg:8,kb:3,stun:40},mkick:{dmg:9,kb:15,stun:34},note:{dmg:5,kb:7,stun:30,arm:0},dokan:{dmg:25,kb:16,stun:40},rock:{dmg:3,kb:4,stun:14,arm:0},gung:{dmg:20,kb:20,stun:50,arm:0},slash:{dmg:14,kb:15,stun:36},doll:{dmg:6,kb:9,stun:20},spin:{dmg:7,kb:12,stun:24},judg:{dmg:16,kb:15,stun:36},phoenix:{dmg:12,kb:16,stun:30},hole:{dmg:4,kb:8,stun:18},spark:{dmg:5,kb:10,stun:16},star:{dmg:8,kb:14,stun:26},blade:{dmg:6,kb:9,stun:22},bomb:{dmg:12,kb:13,stun:30},beam:{dmg:18,kb:18,stun:40},rifle:{start:40,spd:34,r:5,dmg:22,kb:22,stun:55,arm:0}};
const ULT={name:'Last Word「Prismatic Danmaku Storm」',loop:60,fn(p,o,k){
 if(k%10===0)for(let i=0;i<8;i++){const b=addB(p,k*.05+i*TAU/8,3.2,1,MOVES.heavyN,300);if(b)b.c=RB[i%6]}            // spirale arc-en-ciel de grosses balles
 if(k%45===20)for(let i=0;i<5;i++){const b=addB(p,p.aim+(i-2)*.22,5,1,MOVES.heavyF,240);if(b)b.c='#fff'}          // éventail visé
 if(k%8===0)for(let i=0;i<3;i++){const b=addB(p,-k*.04+i*TAU/3,2.4,0,null,200);if(b)b.c=RB[(k/8+i|0)%6]}         // quelques petites
 if(k%90===0){focusL=Math.max(focusL,.6);flash(.15,RB[(k/90|0)%6])}}};
const spD=p=>p.ultS?ULT:SPELLS[(p.spI===undefined?p.id:p.spI)%SPELLS.length],spT=p=>p.ultS?T.ULT_T:T.SPELL_T;
// Spell cards (une par perso, données faciles à étendre)
const SPELLS=[
 {name:'Spirit Sign「Fantasy Seal」',loop:90,fn(p,o,k){
  if(k%3===0)for(let i=0;i<4;i++)addB(p,k*.09+i*Math.PI/2,3.2,0,null,260);
  if(k%45===0)for(let i=0;i<8;i++)addB(p,p.aim+Math.PI/8+i*Math.PI/4,4,1,MOVES.heavyN,240)}},
 {name:'Magic Sign「Starlight Rain」',loop:72,fn(p,o,k){
  if(k%18===0)for(let i=0;i<20;i++)addB(p,i*TAU/20+(k%36?Math.PI/20:0),3.5,0,null,260);
  if(k%30===15)addB(p,p.aim,9,1,MOVES.heavyF,200)}}];
function addB(p,a,sp,heavy,m,life){
 if(B.length>=T.MAX_B)return;const c=Math.cos(a),s=Math.sin(a);
 const b=(heavy?{x:p.x,y:p.y,vx:c*sp,vy:s*sp,r:m.r,owner:p.id,heavy:1,m,mult:1,dist:0,life,dead:0,seen:0,breaker:p.state==='spell'&&p.in&&p.in.b&&p.in.b.parry?1:0} // spell + Parry maintenu = gros danmaku breakers
  :{x:p.x+c*14,y:p.y+s*14,vx:c*sp,vy:s*sp,r:4,owner:p.id,heavy:0,dmg:1,life,dead:0,gr:0});B.push(b);return b}

function wall(p,ax){
 if(p.spit){xSpitWall(p,ax);return}
 if(p.fx&&p.fx.spin>0&&p.state!=='hitstun'){if(ax)p.vy*=-1;else p.vx*=-1;xSpinBounce(p);return}
 if(p.state==='dash'){ // wall kick : un seul par dash, rebond avec élan + demi-charge rendue
  if(p.kicked){if(ax)p.vy=0;else p.vx=0;return}
  if(ax)p.vy*=-1.15;else p.vx*=-1.15;Object.assign(p,{kicked:true,noSteer:8,t:Math.max(p.t,6)});p.boost=Math.min(T.DASH_CHARGES,p.boost+.5);
  txt(p.x,p.y-26,'WALL KICK','#fff',13);burst(p.x,p.y,'#fff',12);shake+=6;chroma=Math.max(chroma,6);WAVES.push({x:p.x,y:p.y,t:10,T:10,spd:8,th:14,inv:1});return}
 if(p.slide>0){if(ax)p.vy*=-.8;else p.vx*=-.8;return} // la glissade rebondit sur les murs
 if(p.state==='hitstun'&&Math.hypot(p.vx,p.vy)>T.WALL_MIN){
  if(p.techBuf>0&&!P.some(q=>q!==p&&q.fx.weight>0)){Object.assign(p,{vx:0,vy:0,state:'idle',combo:0,inv:14,techBuf:0});txt(p.x,p.y-30,'TECH','#9f9');burst(p.x,p.y,'#9f9',10);log('tech P'+(p.id+1));return}
  if(p.pips<=0){invF=10;chroma=40;focusL=2;zblur=.25;ko(p,'STREET SMASH!');return}
  if(P.some(q=>q!==p&&q.fx.weight>0)){p.hp-=12;txt(p.x,p.y-40,'CRUSHED!','#8a7a6a',18);if(p.hp<=0){ko(p,'CRUSHED');return}} // Urumi
  if(p.bounceN>0){p.bounceN--;if(ax)p.vy*=-.85;else p.vx*=-.85;shake=Math.min(60,shake+26);flash(.25,'#fff');crack(p.x,p.y);sfx('bord_brise2',.7);big('BOUNCE!','#fff',40);WAVES.push({x:p.x,y:p.y,t:16,T:16,spd:16,th:30,inv:1});return} // surpuissance : rebonds
  if(ax)p.vy*=-.5;else p.vx*=-.5;p.t+=6;shake=Math.min(28,shake+12);chroma=Math.max(chroma,10);burst(p.x,p.y,'#fff',14);WAVES.push({x:p.x,y:p.y,t:12,T:12,spd:10,th:20,inv:1})}
 else if(ax)p.vy=0;else p.vx=0}

function ko(p,why){
 if(p.state==='dead')return;
 if(p.fx&&p.fx.phoenix>0){rebirth(p);return}
 {const k=frame-(p.lastByF||-1e9)<600?p.lastBy:-1;if(k>=0&&k!==p.id&&P[k])P[k].kos=(P[k].kos||0)+1;else p.sd=(p.sd||0)+1;p.lastByF=-1e9;p.dX=p.x;p.dY=p.y;p.dRT=performance.now();p.acts=[]}
 chKill(p);
 const mx=p.vx||p.kbx,my=p.vy||p.kby; // rayon de KO façon Smash : part du point d'éjection, vers l'intérieur
 const a=(mx||my)?Math.atan2(my,mx)+Math.PI:Math.atan2(T.MAP_H/2-p.y,T.MAP_W/2-p.x);
 KOB.push({o:p.id,x:p.x,y:p.y,a,t:120});sfx('charge',.8);sfx('aimreal',1.7);sfx('se_pldead00');big(why,'#fff',why.length>6?72:110);if(!p.cpu)big('AIM YOUR KO BEAM!',COLS[p.id],30,'kb'+p.id);
 slow=p.stocks<=1?120:60;zk=.35;flash(.8);invF=Math.max(invF,6);chroma=Math.max(chroma,32);focusL=1.5;zblur=.18;bright=1;crack(p.x,p.y);crack(p.x,p.y); // onde d'inversion des couleurs
 WAVES.push({x:p.x,y:p.y,t:50,T:50,spd:55,th:160,inv:1},{x:p.x,y:p.y,t:36,T:36,spd:30,th:70,inv:1},{x:p.x,y:p.y,t:24,T:24,spd:14,th:30,inv:1});
 p.stocks--;if(p.stocks<=0)p.outAt=frame;stopRifle(p);Object.assign(p,{state:'dead',t:130,vx:0,vy:0,diPend:false,koPend:false,blade:0,bombs:0,rifle:0,ult:0,mirror:0,giant:0,clone:0,spk:0,star:0,cam:0,fx:{},histBuf:[],posBuf:[],eaten:0,qiBank:0,burn:0,pois:0,sleep:0,drug:null,frozen:0,vuln:0,cage:null,spit:0,lily:0,dark:0,krobe:0,kshield:0,pStk:0});
 shake=60;hitstop=Math.max(hitstop,15);txt(p.x,p.y-40,why,'#fff',28);burst(p.x,p.y,COLS[p.id],60);
 RINGS.push({x:p.x,y:p.y,r:0,m:260,t:30,c:COLS[p.id]});
 for(const b of B)if(b.owner===p.id)b.dead=1;
 log(why+' P'+(p.id+1)+' (lives '+p.stocks+')');
 {const al=P.filter(q=>q.stocks>0);if(new Set(al.map(q=>TEAMS?TEAMA[q.id]:q.id)).size<=1){winner=bestId();winT=0}}}

function respawn(p,o){
 const ax=T.MAP_W*.2,ay=T.MAP_H*.25,C=[[ax,ay],[T.MAP_W-ax,ay],[ax,T.MAP_H-ay],[T.MAP_W-ax,T.MAP_H-ay]];
 let best=C[0],bd=-1;for(const c of C){const d=Math.min(1e9,...P.filter(q=>q!==p&&q.state!=='dead').map(q=>Math.hypot(c[0]-q.x,c[1]-q.y)));if(d>bd){bd=d;best=c}}
 Object.assign(p,{x:best[0],y:best[1],vx:0,vy:0,hp:T.HP,pips:T.PIPS,state:'idle',inv:T.RESPAWN_INV,combo:0,buff:null,buffT:0,boost:T.DASH_CHARGES,slide:0,run:false,power:1,charging:false,blade:0,rifle:0,bombs:0,ult:0,mirror:0,giant:0,clone:0,spk:0,star:0,cam:0,fx:{},histBuf:[],posBuf:[],eaten:0,qiBank:0,burn:0,pois:0,sleep:0,drug:null,frozen:0,vuln:0,cage:null,spit:0,lily:0,dark:0,krobe:0,kshield:0,pStk:0});
 RINGS.push({x:p.x,y:p.y,r:0,m:120,t:30,c:'#fff'});WAVES.push({x:p.x,y:p.y,t:20,T:20,spd:14,th:30,inv:1});flash(.2,COLS[p.id])}

