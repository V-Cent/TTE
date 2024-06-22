# Tales of Destiny for the Playstation 2

Versions:

- ***:r Vanilla***: Original PS2 version; released November 30, 2006 in Japan.
- ***:g DC***: Director's Cut — PS2 version with additional content; released January 31, 2008 in Japan.

Special thanks to the [gamefaqs community](https://gamefaqs.gamespot.com/boards/942208-tales-of-destiny-directors-cut/75150763), [atwiki community](https://w.atwiki.jp/tod_remake/) and users [Zeke Belforma](https://www.youtube.com/watch?v=kzvcOjRu81o), [Bertin](https://www.youtube.com/watch?v=IlQw_DRxGj0), [Joeyjoejoejoejoe](https://www.youtube.com/watch?v=58AZmkFtH-I), [えく+Excd](https://www.youtube.com/watch?v=sAJMLSBYs1A), [tony](https://www.nicovideo.jp/watch/sm19929958), [Crystal Spire](https://www.youtube.com/c/CrystalSpire/featured) and [Muctales](https://www.youtube.com/user/muctales).

## Base Mechanics

Here will be displayed a simple description of the base mechanics in the game. Most of there are already explained during gameplay, but may have some effects that were only found out during experimentation.

### Stats

Each character has 8 stats separated into two different categories:

Main Stats:

- Physical Attack(_Phy.Atk_) → Physical Damage dealt is increased, does not increase iron stance break chance, or crit chance, or anything else.
- Physical Defense(_Phy.Def_) → Physical Damage received decreased.
- Magic Attack(_Mag.Atk_) → Magic Damage dealt is increased.
- Magic Defense(_Mag.Def_) → Magic Damage received is decreased.

Sub Stats:

- Strength(_Str_) → Determines Character HP. [HP = Strength Stat X 6]
- Evade(_Eva_) → Decreases Enemy's Critical Rate and increases chances of activating Evasion.
- Concentration(_Con_) → Increase Critical Rate. Keep in mind that criticals have a cooldown before they can be done again.
- Accuracy(_Acc_) → Decreases enemy blast gain rate and breaks through enemies Evasion.

Definitions:

**Evasion**: Chance to activate iron stance and auto-guard attacks, has to be massive to be able to auto-guard and iron stance through bosses attacks.

**Iron Stance**: Attack does no stagger (but still does damage). A small white/gray puff of air will appear where the attack hits. Enemy may drop all iron stance after or before certain attacks, and the player drops all during attacks.

**Auto-guard**: The character/enemy will automatically enter guard animation when hit by an attack. This decreases damage more than a iron stance.

The difference between these two categories is that the main stats will increase as the character Levels up while the Sub Stats does not. The Sub Stats values are determined by the Main Stats itself. They take 1/6 of the highest value stat and then add to 1/3 of the lowest value stat.

Strength - Phy.Attack and Phy.Defense

Evade - Phy.Defense and Mag.Attack

Concentration - Mag.Attack and Mag.Defense

Accuracy - Mag.Defense and Phy.Attack

All stats can be increased by other means such as Accessories or Herbs.

The formula used for stat growth on level up is: Primary stat value x Growth rate / (Attack + Defense + Magic Attack + Magic Defense)

The Growth rate for each character is:

| Character |  Growth Rate |
| :-------- | :----------: |
| Kongman   | 15.00        |
| Chelsea   | 13.50        |
| Johnny    | 13.50        |
| Stahn     | 12.66        |
| Rutee     | 12.36        |
| Phillia   | 12.36        |
| Woodrow   | 12.36        |
| Mary      | 11.76        |
| Lilith    | 11.76        |
| Leon      | 11.46        |

Finally, each character gets following bonus to their secondary stats:

- Stahn: Strength +4.
- Rutee: Evade +5, Accuracy -10.
- Leon: Evade +25, Accuracy +20.
- Mary: Accuracy -10, Concentration +10.
- Chelsea: Evade +40.
- Johnny: Strength +40.
- Kongman: Strength +100, Concentration +30.

Survival mode increases your intrinsic defense value by a ton. This means guarding would make some attacks hit 0s.

### CC

This game works with a chain capacity (_CC_) system. You begin each fight with your minimum CC value and, by doing actions, you increase your current maximum CC by 1. This happens until your character's maximum CC value; if you do any actions after that, your current maximum CC goes down to the current value or your minimum CC (the highest one).

### Blast Mechanics

When attacking, blocking or taking damage you will gain blast points. This blast can have different uses depending on the situation. With 1, 2 or 3 full bars of blast, you can do your Blast Caliber (BC) during a chain. With at least 1 full bar, you can do a Damage Break. When the enemies have full blast (by getting hit), they also do a damage break automatically. Also, when you complete a bar, you get quite a few i-frames.

*:{'todo' : true} Definitions:*

**Damage Break**: If your character is being continuously staggered by the enemy (more than one hit) and you have 1 complete Blast gauge, press L1 (just before or during a hit) to activate Damage Break. Damage Break takes 50 Blast Points and activates the blast break effect (same as enemies) for 1 second. After you perform a damage break, there is a small cooldown period before another can be activated. Most enemies can only do a damage break when on the ground, while the player and some specific enemies can also do it in the air.

**I-Frames**: Invincibility Frames; frames where you take no damage and do not stagger. You can also gain blast during this, if the source of the I-Frames wasn't a bar gain.

### Spells and Artes

Artes and spells cost more CC than a normal attack, but they normally do more damage and have special effects. Some artes and spells can OTG and Freeze enemies. They also can cause various status effects to the user and enemies. Spells usually have a higher stagger and damage, but they need to be casted before coming out. There is also a limit to 4 "big" spells on screen.

You can use skills and equipment to reduce casting time. DeEarth also reduces cast time of Dark Spells, same for Phillia's earth necklace. You can also reduce it by doing artes or other spells.

*:{'todo' : true} As you constantly use artes in combos, the Casting Time for all spells will reduce as far as 80%, enabling spells to cast faster. This has a limit to 31 frames. Below is the list of methods on how this feature works.*

- Normals will not reduce Incantation Time.
- Every arte used in combos will reduce Casting Time by 10%.
- Every spell used in combos will reduce Casting Time by 20%.
- If you cast the same spell more than one time, that second and any subsequent spells will not have any reduction on the Casting Time, however, the actual reduction will still persist when casting another spell.

Example: Grave (100%) -> Grave(100%) -> Grave(100%) -> Stone Wall (40%)

Definitions:

**OTG**: When used against an enemy in any knockdown state (light to hard knockdown), they will get back up to a normal standing state.

**Freeze**: The freeze effect causes a position lock; enemies will not be able to be pushed around (both in ground and air) and will stay still during the stagger time of the attack that caused it. It is easier to see after a stun, since the stagger value of a move that can freeze would be increased to more than 80 frames. Leon's Phantom Edge is a good example of a move that causes the freeze effect. It also happens, though in a smaller scale, during various artes.

### Extra Information

**Air Recovery**: If the enemy knocks you up into the air, press square just as you touch the ground to perform a backstep and not be knocked down. Only works for attacks that launch you high up in the air. Attacks with hard knockdown also are unable to be recovered (your character will lay down again before getting up).

**Charge**: Press Square + Down to Charge. When Charging, the character will decrease enemy Spell Damage by 75% (also not stagger to spells), get an Accuracy buff and the next attack will break the enemy's guard. Consumes 2 CC Points per use.

**Guarding**: The amount of hits you can guard depend on your CC. When you're about to get guard crushed your character will start to flash orange. To avoid this, simply use a charge to regain the full amount of hits you can block.

**Healing**: Any healing action will drop the healing effectiveness by 5% per use. Rutee's Resurrection is the only exception since it will drop by a total of 20%. This will continue to decrease until healing actions are at 50% of their original value. To recover effectiveness, simply land a hit to recover 5% per hit. You can also use Rutee's Search Gald and Trickster, which restores 20% of effectiveness and can boost healing to up to 150%.

**Penetrate**: All hits are blocked with a super armor effect (cannot be broken) until the penetrate status is broken by having the user be hit by a fixed number of attacks. Works even during attacks and recovery frames. Some bosses have this status (either at the start of the fight or after a specific arte) and Leon (with Demon Lance Zero) can make use of it too.

**Back-row Protection**: If an enemy is running and tries to pass through you, you can block before they pass you to bounce them back, negating all Iron Stance in the process. Some enemies may try to do this to hit you (such as golems).

**Nakiriri Dolls**: Nakiriri Dolls change the character it is equipped on to another character. This lets you use characters that are not available yet in the story or are not in your current party. You can also use it to apply the effect of equipments and attacks of certain characters to another.
When equipping narikiri dolls, some attacks change properties to reflect the wearer's attack properties despite what is shown in the attack description. The following is a full list of such attacks:

- Stahn: All regular attacks, Rekuuzan, Kogahazan, Souryuu Rengazan, Senkuuretsuha
- Rutee: All regular attacks, Snipe Air, Snipe Roar, Bloody Rose
- Philia: Regular attacks that use her sword (her bomb attack Up + Circle remains blunt)
- Woodrow: Regular attacks that use his sword (his bow attacks remain piercing), Kourinshou, Bassaiga, Setsuna
- Leon: All regular attacks, Souryuu Rengazan, Sougazan
- Mary: All regular attacks, Moushuuken, Shunjinrouga, Senhoushou, Houtsuishou, Shishiou Messai, Kappa Bakusougeki
- Chelsea: None
- Johnny: All regular attacks
- Kongman: All regular attacks, Falcon Fledge, Great Upper, Rhomb Shoulder, Ikasu Hip, Hell's Hurricane, Ressurect Kiai, Messa Throw, Heart Break
- Lilith: All regular attacks, Turn Over, Lilith Rush, Flash Back

E.g., Johnny equipping Narikiri Stahn will change his regular attacks, Kogahazan, Rekuuzan, Souryuu Rengazan and Senkuuretsuha to sonic attacks. Mary equipping Nariki Stahn would change all those attacks into slash and blunt property attacks and so on.

*:{'todo' : true} **Advance Gate Points**: You can use these on the New Game + shop to buy special effects. Float Gravity, for example, increases the launch power of all attacks by a multiplier. You can also manipulate your end game save file to gain more points. Decreasing and then increasing the difficulty in the same playthrough (so fight the final boss, save, load, fight again), has no effect on the points. Difficulty only has an effect based on the last playthrough difficulty.*

**Critical Attacks**: Criticals can stun enemies or apply status effects depending on the character used. Critical attacks makes the current stagger value rise to 80+, the next hit (while the enemy is stunned) also receives bonus stagger time. When the enemy is stunned, all attacks OTG.

**Text Skip**: Hold X and Square to skip all current text. Works better than mashing. Possible to use after options too.


*:{'todo' : true} **Collector's Book Bonus**: Maxed Collectors book gives you 15 of every item after beating the final boss.*

**Dash Lock**: After doing a ground dash on a chain (outside of chains you can link ground dashes after any action other than spells and a ground dash) you can only dash again after a back step or after touching the ground without doing any moves. "wavedashing" (jumping then dashing to the ground) can be a good option for enemies too far away for a single dash (as long as they're ground enemies with normal height), since it does not have the same penalties of the ground dash.

**Dash Direction**: To dash to an enemy, always do the input to the direction your character is facing. Including when you mix-up an enemy during a jump or chain. This is also important if you want to backstep after jumping over an enemy, since you would have to first dash towards the enemy (cancelling the landing animation) and then away from it (finally backstepping).

**Random Launch Power**: After 100 hits, launch power becomes slightly random (+/- a variable) to make infinite combos harder.

**Air limitations**: After a certain height, no action other than jumps and aiming dashes are allowed. This is due to the player character being too close to the physical ceiling of the map.

**Elemental Physical Attacks**: Due to a glitch, elemental physical attacks will check against the enemy's defense and your character's magic defense. Therefore, you will do more damage with these attacks against an enemy whose magic defense is higher than your own.

## Glitches

In this section, we have a group of glitches and a small description on how to replicate/explain them. In this section, you will not find glitches that are currently useful for combat, this is found on the next segment.

### Out of Bounds and Sequence Breaks

#### :{'media' : 'media/todps2/caveQueen.mp4'} Skip Cave Queen

By walking on the side of a ledge on the screen that the Cave Queen boss battle starts, you can skip it and get to Moreau town faster. You can buy some items there and talk to NPCs, but you still need to beat Cave Queen to continue the story. More information [here](https://www.youtube.com/watch?v=kzvcOjRu81o).

#### Mid-game battles while in Early-game

You can trigger encounters from the Phandaria region, enemies around lv34 which you normally encounter at the end of Arc 1, by going to the place in following picture:

*:{'todo' : true}*

You can use this spot to farm levels or lenses, especially while on NG+.

Ideally you'd fight a group that contains a bear and, thanks to Narikiri Johnny and his Maware Rondo, you can do 2 or maybe 3 sets of Universal BCs against it for a ton of experience, enough to get you to lv 50+.

Available since the beginning in Leon's Side and once Leon joins the party for Stahn's Side.

### Exploits

#### Infinite Gald and EX points

*:{'media' : 'media/todps2/gald.mp4'}*

Go into a shop and buy something (x1). After that, add one of one item (dpad-right) then click buy on another item (circle). Cancel (X) then you will see an underflow, after this, you can do R-STICK left to "buy" the minimum possible, thus, gaining infinite gald or ex points. Using this when selling will cause you to lose all your money (and the items) instead. More information [here](https://www.youtube.com/watch?v=sAJMLSBYs1A).

#### :{'todo' : true} Infinite Swordian Points

"Cave Queen" (Stahn), "Cave Head" (Leon), "Caves Swell" (Phillia) monsters in the Definite Strike arena award Swordian Points when defeated on Hard or higher (3 points in Hard, 4 in Evil and 9 in Chaos). This mode becomes available in Noischtat once the final boss is defeated. Can easily be exploited for max Swordian Points.

These are the Definite Strikes you have to perform against each part:

- Leon vs Cave Head: Garyuusen → Garyuumeppa → Kuushuuken
- Philia vs Cave Swell: Wind Arrow → Lightning
- Stahn vs Cave Queen: Bakuenken → Souryuu Rengazan

You can see an example of this exploit in action [here](https://youtu.be/aBKJ1egh_-g).

### Minor Combat Glitches

#### :{'media' : 'media/todps2/microDash.mp4', 'forcedmedia' : false} Micro-Dash

If you start moving left or right but use an arte at the same time, you will get a small momentum forward. Moving back produces the most distance, but it is still very small. Also works with spells. The same happens when landing from the air (depending on your momentum).

Since it requires a movement animation, it can only be done on start of chains.

#### Fake Normal Attack

When using a non air-enabled arte in the air, a normal attack comes out. Has no extra effects. You can also attack cancel this attack, causing you to spend 2 CC for 1 normal attack.

#### :{'todo' : true} Definite Strike Lock

If you're currently doing a definite strike chain and stun/sleep/stone an enemy that floats/flies without making it drop to the ground, the enemy will not be able to recover from the hit and will stay floating in the air.

#### Stagger Overload

Enemies can only take so much stagger before going instantly into hard knockdown state. It happens when stagger is past 40 frames and you do any attack, arte or action that adds more stagger.

## Combat Techniques

Here we will discuss various different techniques/glitches that can be used during combat.

### General Techniques

#### Spell Locking

If you quickly cancel a long spell 4 times (by casting and guarding), all spells will lock (they will not stop casting). This is because of two factors:

1. The max number of big spells in the field is 4.
2. The casting time when you cancel a spell still ticks down in memory.

It is not possible to abuse 2 to cast faster. However, since you can stack 4 spells without them coming out a flag is activated that stop any more spells. Since no spells are ending (and thus clearing the flag), no more spells come out for the rest of the fight (including from enemies)!

#### :{'versions' : 'Vanilla', 'todo' : true} Stop Flow Glitch

Cast Stop Flow 128 times to use spells with no casting time. Each Stop Flow increments the total casting time for spells by a little bit, until an overflow happens (@128). You can also only cast Stop Flow then cancel it to have the same effect (no need to fully cast the spell).

#### :{'media' : 'media/todps2/hitboxes.mp4'} Moving Hit-Boxes

Dashing a few frames after an attack can move its hitbox. It depends heavily on the attack for this to work. Needs to be done 1-6 frames after the attack.

#### Spell Block

Casting an spell just as an enemy hits you negates the damage you would take (gives you i-frames). You can also enter the incoming attack's hitbox with the magic cancel (by guarding as your in the casting animation) animation ! Only works for attacks that lose their hitbox once it hits something, as multi hits attacks will still hit you on their second hit. It can trigger a blast gain, and that generates more i-frames. The spell release (just before the spell comes out) animation has even more i-frames, and can be used easily by holding the spell down.

*:{'media' : 'media/todps2/spellBlock.mp4'}*

#### Arena Edges

The edges of the battle arena cancel any horizontal momentum when touched. This enables you to instantly change direction after touching the wall, without needing to do another jump.

#### :{'media' : 'media/todps2/airWalking.mp4'} Air Walking

The ceiling of the battle arena also has an interesting effect. When in the air, reach the ceiling (possible with just normals and jumps) and keep jumping against it to have infinite jumps. By releasing the guard button (if you have it pressed), you can change direction midair. Fall speed is increased when you bonk your head in the ceiling, since your vertical momentum is reset each time.

#### :{'media' : 'media/todps2/slowFall.mp4', 'forcedmedia' : false} Slow Falling

During a chain where you used at least one normal attack (to activate its floaty properties), do a normal attack just as the momentum is changing from upwards (momentum higher than 0) to downwards (momentum lower than zero), you will then stall in the air or, most of the time, fall slowly. Can also work after some artes.

#### Faster Recovery Techniques

When doing a straight fall (no horizontal momentum), your character takes 42 frames to start to recover CC, which increases in a rate of 1 every 4 frames.

There are two ways to make this recovery faster:

- The first is using a normal attack before landing. This needs to be high enough from the ground so that touching it will cause the animation of the attack to cancel. This costs 1 CC and makes the recovery drop from 42 frames to 25, resulting in you recovering faster and having more CC available for use (+3 CC by the time the other recovery animation would be ending). More information can be found [here](https://www.youtube.com/watch?v=58AZmkFtH-I).
- The second is using a spell and instantly cancel it with a guard. The spell needs to be done just before touching the ground, while you're still in the air. Your character will proceed to lock to the ground to perform the spell, where you can then cancel it. This method also reduces the recovery to 25 frames, however, it costs at least 2 CC (causing you to have only +2 CC than not using it) and it is harder to perform. Can be useful for cases where you do not want your normal attack to hit.

For falls with horizontal momentum, the recovery time will be 25 frames and using one of the techniques above will not reduce it.

Having a faster landing recovery can also be useful to reset the properties of your normal attack (see Gliding segment below).

Another recovery that can be beneficial to cancel is the release of spells. These usually take 72 frames to start recovering CC, but can be cancelled way earlier. By chaining the spell with another and then instantly cancelling it, you can reduce the recovery to 42 frames (+5 CC). You can also use an aiming dash or backstep if you have only 1 CC left, since those still recover faster than waiting for the spell release animation.

#### Bait Reset

When an opponent is walking or running, just before they start an attack, stagger them. When you drop the combo (on purpose) they will perform their (stored) attack immediately and you can punish them while they're stuck in an animation, thus continuing the combo.

#### Boss AI Manipulation

Multiple bosses in Tales of Destiny can be manipulated to make fights easier, such as ignoring mechanics or skipping phases. Bait resets can be used to easily punish bosses, and spell locking can make some fights a joke.

Certain fights, however, have unique ways in that they can be manipulated.

*:!Ilene* has a unique glitch where, if she blocks a BC, she will stay in that state until you pause the game, try to change targets or hit her. This effect changes on the different versions of the game. You can use this time to heal up, casts spells or even safely set up the spell lock technique.

The *:!Rembrandt* fight has multiple ways in which you can manipulate it. The fight has certain HP thresholds where he changes from a ground form to an air form. All of these can be cancelled by using a BC. You can also use a BC just after the change form animation is playing: if you do it while he is going to the air, he will be stuck in the air on the ground form; if you do it while he is going to the ground, he will be stuck in the ground on the air form.

#### Bounce

Some artes make the enemy bounce on the ground and others do not. For example, most artes that have the hard knockdown effect causes the enemy to **not bounce** in the ground. Ending those combos with a normal instead will make so that the enemy will bounce once it touches the ground. Normal attacks will always bounce, unless you're using a special belt from Kongman (even with a Nakiriri Doll equiped). Keep in mind that that belt effects are only for normals done while in the ground.

#### :{'media' : 'media/todps2/push.mp4'} Push

When an enemy attack requires melee distance to perform, you can aiming dash just as the attack is about to come out (just when the enemy finishes walking, but before the attack comes out) to push the enemy away. You can walk forward to make the enemy end their walk animation while you're closer to them, which makes the push have a bit more pushback.

#### Faster Max-CC

By rapidly casting and cancelling base spells (like fireball), you can quickly increase your minimum CC all the way to your maximum CC.

#### :{'versions' : 'Vanilla'} CC Recovery Glitch

After doing any action, mash block. This must be done just as the Chain ends or the recovery time of your action ends. This will cause your CC to rise much more than it was supposed to, possibly even to max. Only works on Manual Mode. More information can be found [here](https://www.youtube.com/watch?v=IlQw_DRxGj0).

#### :{'media' : 'media/todps2/leonJump.mp4'} Swallow Talon Glitch

Character Specific: Leon.

Swallow Talon has an interesting effect when mid-way cancelling with a jump. Normally, the user will jump forward slightly. However, if you jump just before the second part of the attack, you will get a huge jump backwards. If you do a normal attack instead, you will get some vertical height during your attack.

#### Fearful Flare Glitch

To perform this glitch, you need to do the following steps:

1. Cast a 3CC spell or higher spell but cancel the chant. (Some spells may not work. However, most 4CC+ spells **will** work.)
2. Cast Fearful Flare.
3. Cast any other spell just before the fifth hit of Fearful Flare hits. You do not need to release this spell, and you can even cancel it. (Some spells may result in no effects.)

If done correctly, you will see that part of the animation of the spell cast in step 3 will come out (and it also deals damage)! Some spells may be done a bit earlier or late for it to work.

This glitched spell will also do the fire damage of Fearful Flare and use another damage multiplier (which may cause some spells to do big amounts of damage).

While only Stahn and Phillia have access to Fearful Flare, other characters can still perform step 3. Also, you can also perform this glitch when the enemy uses Fearful Flare on your team.

Be careful not to cast Fearful Flare again just as a glitchy animation is playing, since that may crash the game.

You can see this glitch in action [here](https://www.nicovideo.jp/watch/sm19929958).

### Gliding

#### Gliding Basics

It is important to note that the first normal attack of a chain has some hidden proprieties: first off, it carries momentum. So it enables Gliding and other combos. However, if you used it already, it gets floaty.

So, how does one use this behavior to do Glides? You can simply do an aiming dash in the air (after a jump, double jump, arte or jumps into an arte) into a normal attack to maintain the momentum of the aiming dash. Doing this with a floaty normal attack will only cause you to stop after the end of the normal.

*:{'media' : 'media/todps2/gliding.mp4'}*

Theres one exception: If an enemy is above you you can always Glide, but you can only Glide from above them one time (and as said before, you lose this above Glide if you use a normal attack). The velocity and angle depend on the distance and angle you have with your enemy.

To do this straight from the ground, the fastest way you can get an air aiming dash is to use your left stick and do an Up-Away to Forward motion, passing through the neutral of the stick.

The floaty normal attacks can extend your glide if you use them in conjunction with jumps. Using a floaty attack holding the opposite direction of glide will stop it instead.

The only character unable to do glides is Chelsea due to her normals being floaty arrow shots.

### Attack Cancel

By pressing artes (or shortcut artes) and the normal attack button on the same frame you can get some interesting effects. Since the game thinks you're doing an actual normal attack (which registers before your arte), every A.C arte you do will not have the blast penalty that is applied for repeated artes. A.C can also be used for the following effects:

#### :{'media' : 'media/todps2/followUp.mp4', 'forcedmedia' : false} Follow-up Negation

A.C can be used to ignore follow-up artes or other mechanics that require 2 moves to be used in succession. For example, Leon can use Demon Fang twice in a row if the second one is A.C.'ed.

#### :{'media' : 'media/todps2/magicDash.mp4', 'forcedmedia' : false} Magic Landing Dash

When landing, if you do a Attack Cancelled Spell, you will get a small momentum forward (like the normal would do). This is similar to a Micro-Dash.

Works mid-chain.

#### Attack Cancel Spell

When casting an Attack Cancelled Spell, there will be no restriction on casting time when doing the same spell. This cost +1 CC. Thus you can do A.C Grave (100%) -> A.C Grave(80%) -> A.C Grave(60%)

### Stagger Techniques

#### :{'media' : 'media/todps2/staggerStorage.mp4'} Stagger Storage

By doing an arte and dropping the combo you get an additional 20 frames of stagger stored on your aiming dash. Then, if you do a normal attack or arte into an aiming dash, said attack/arte will get an additional 20 frames of stagger. Doing an aiming dash/backstep/charge/landing(from a jump) before using the stored stagger negates the effect. Stagger Storage only works during a chain where the enemy is staggered.

You can use jumps and other artes to delay the stored stagger so it wont knock the enemy down due to stagger overload (taking out some stagger equip also helps).

#### Combo Assist

Like other games, doing an attack while the enemy is still staggered (in Destiny you need at least to do at least 1 frame after the previous attack hits, so sometimes you may need to delay your attacks) increases the stagger by a little bit to help chain things better. The values are:

- Normal Attacks : +12 frames of stagger.
- Most Artes: +14 frames of stagger.
- Leon's Glimmer Dragon (Garyuusen): +22 frames of stagger.
- Weakness attacks: They add 2 stagger. Resisted attacks lose 2 stagger.
- Stagger Equipment: Chelsea best equips add 15 frames of stagger to normal attacks and artes. Philia best equips add 18 frames of stagger to magic and air spells.

The window that you can increase the stagger of the previous attack is about 25 frames.

#### :{'todo' : true} Arte Stagger Change

Doing an attack before the projectile of a previous arte still has not reached the enemy can decrease/increase the stagger from that projectile.

### Semi-auto Techniques

(These require semi-auto to be active)

Semi-auto on Destiny works mostly in grounded combat since air actions do not have any proximity correction mechanics. Any action that you do while not being in a chain or after other uniques actions such as landing from a jump, backstepping, aiming dashes and charging, will start a running animation (the semi-auto run that is present in most entries on the franchise). This is because, while in semi-auto mode, actions that would whiff if done where you are will be buffered and make your character run instead. This semi-auto run will end depending on the distance (between you and the enemy) that is necessary for the buffered action to "connect".

Once your character gets close enough, the buffered action will be used and the buffer is cleared. You can cancel the semi-auto run animation by either jumping, doing an aiming dash, or stopping (by doing the input for a backstep). Both jumping and stopping will also clear your buffered action.

#### Spatial-buffer Canceling

There are two properties of semi-auto that can be exploited to do advanced techniques. They are the spatial properties: the current distance between you and the enemy and the distance necessary for your action to be performed (after the semi-auto run); and the action buffer.

Under normal circumstances, you cannot have an action buffered if you're not in the semi-auto run state. However, if you run away from the enemy and perform a normal attack or arte (excluding spells and some very specific artes), your character will first do an animation to stop and turn around (this lasts ~15 frames). This action, which will be called the _forced neutral animation_, is one of the only periods where you can perform another action while you still have a buffered action.

In short, any action you do while running away from the enemy will initiate a _forced neutral animation_ and be buffered. This animation can then be canceled in any other action which will come out on the spot. After the action is finished, your character will once again return to neutral and start the semi-auto run to perform his buffered action.

The three key points to that behavior are the **buffered action**, the **forced neutral animation** and the **forced action** (the action that is used to cancel the _forced neutral animation_). This, however, is still nothing that couldn't have been done on manual. That is where the spatial properties come into play. During the _forced action_, if your character comes close enough to the enemy to the point where you wouldn't need the semi-auto run, your _forced action_ will instantly be canceled and the _buffered action_ will come out.

This is called a Spatial-buffer cancel (SB Cancel). The cancel can even mess up your momentum and your character's state (such as color).

*:{'media' : 'media/todps2/sbCancel.mp4'}*

There are other important points to SB Canceling:

- If you go airborne during your _forced action_, keep in mind that air-enabled actions have different spatial properties for air and ground (this depends both on the _forced action_ and the _buffered action_). If your _buffered action_ does not come out, it will be cleared due to the semi-auto rules mentioned above. If your chain does not work because of spatial properties, you can consider using a normal attack as the _buffered action_, since the air version of it does not need spatial considerations to come off (works on any distance). You can then chain your preferred action to the normal attack, while still canceling the _forced action_. You should also take into consideration that various artes may not look like they leave the ground, such as Leon's Dragon Swarm, but they will consume any air-enabled _buffered action_ or clear the buffer during its execution.
- If the _forced action_ you used was using an artes button (o/x), the _buffered action_ will be overwritten to be the same as the _forced action_ you just used. If the _forced action_ you used was using a shortcut (L2/R2), your _buffered action_ will stay the same.
- Airborne enemies change the spatial properties required for your _buffered action_ to come out. Your character can either cancel as normal, do an aiming dash after your forced action is done (thus not canceling it), or be temporally stuck in a loop where you automatically walk left and right beneath the enemy (until he's within range for the _buffered action_ to come out).

#### :{'media' : 'media/todps2/sbShortHop.mp4'} Short-hop actions

If you backstep while you have a _buffered action_, you can activate it while being extremely close to the ground. This can easily be done by making your _forced action_ a backstep. The only confirmed example for this is doing short-hop normals (like in the example video), since they do not require spatial properties.

You may also use the backstep after your _forced action_, if your _buffered action_ was not consumed.

#### Spell auto re-cast

If you use a spell as the _buffered action_ and then try to cancel it, it will automatically be re-casted. This only works for non-shortcut set spells (this is because the same spell is both the buffered and the expected action -- constantly.)

Spells (and other very specific artes) will not start a _forced neutral animation_.

This **cannot** be abused to instantly lock large-scale artes.

#### Attack Cancel SB Cancel

If your _forced action_ is A. C.'d or if the _buffered action_ is an A. C. arte, the _buffered action_ will be the same as a normal attack.

#### :{'media' : 'media/todps2/spellSb.mp4'} Spell SB Cancel

SB canceling spells (i. e. using shortcut spells with another action buffered) can be a good option select since it can make an arte come out before the spell has finished casting, making so that you don't get punished in situations you normally would be. It can also be used to completely negate the spell release frames, regaining control faster.

Finally, if the spell ends in the air and if the _buffered action_ is air-enabled, the moment your character leaves the ground the animation will be canceled and the air action will come out.

*:{'media' : 'media/todps2/demonLanceCancel.mp4'} For example, Leon can use Dragon Swarm just after the jump from Demon Lance, making the lance follow Leon while Dragon Swarm is in effect.*

#### SB storage

By changing to Manual during the _forced neutral animation_ (or during casting for spells and 1 frame after pressing the artes button for screen-wide artes), the _buffered action_ will be saved in memory but will not be consumed. Once you return to semi-auto (even mid-chain), the _buffered action_ will still be available to use. Since you can have much more accurate movements in manual, it is possible to set up a specific position and then change to semi-auto, automatically canceling your action due to the spatial properties of the technique.

*:{'media' : 'media/todps2/sbBuffer.mp4'}*

The same rules apply once you return to semi-auto mode (normals, air actions...). This can be used to properly cancel attacks with air-enabled spells.

This cannot be used to bypass the air limitations of the battle arena.
