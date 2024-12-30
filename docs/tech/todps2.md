# Tales of Destiny for the PlayStation 2

Versions:

- ***:r Vanilla***: Original PS2 version; released November 30, 2006 in Japan.
- ***:g DC***: Director's Cut — PS2 version with additional content; released January 31, 2008 in Japan.

Version differences can be found *:{'redirect' : '#version-differences'} here*.
A technique or sentence that only applies to a specific version will have the following symbol next to it: *:{'versions' : 'Vanilla/DC'}*

## Mechanics

### Status

Each character has 8 different parameters, separated into two categories:

Primary:

- **Physical Attack (攻撃)** → Physical Damage dealt is increased.
- **Physical Defense (防御)** → Physical Damage received decreased.
- **Magical Defense (術防)** → Magic Damage received is decreased.
- **Magical Attack (術攻)** → Magic Damage dealt is increased.

Secondary:

- **Strength (体力)** → Determines Character HP.
- **Evasion (回避)** → Increases Evasion chance.
- **Concentration (集中)** → Increase Critical hit chance.
- **Accuracy (命中)** → Decreases enemy blast gain rate and breaks through Evasion.

*:{'media' : 'media/TODPS2/stats.png', 'caption' : 'The status menu in-game. Primary parameters are in gold and secondary in purple.'}*

Status can be increased by equipment and by using herbs. Every primary parameter is increased at every level up. This growth is defined by the following formula: $\frac{\alpha * \beta}{Phy.Atk + Phy.Def + Mag.Atk + Mag.Def}$, $\alpha$ being the primary parameter being increased and $\beta$ being the growth rate for that character. Keep in mind that herbs, equipment, and jewels also affect the values in the formula. Therefore, changing your equipment before leveling up can affect your character's growth. For example, increasing Physical Attack as much as possible and decreasing the other stats (such as removing armors) will make so that you will have a higher Physical Attack gain than normal. A table with the growth rate for each character is shown below:

| Character | Growth Rate |
| :-------- | :----------: |
| Kongman   | 15.00        |
| Chelsea   | 13.50        |
| Johnny    | 13.50        |
| Stahn     | 12.66        |
| Rutee     | 12.36        |
| Phillia   | 12.36        |
| Woodrow   | 12.36        |
| Mary      | 11.76        |
| Lilith    | 11.76        |
| Leon      | 11.46        |

Secondary parameters are based on the value of two primary ones, and work based on the following formula: $\frac{(\alpha * 2) + \beta}{6}$, $\alpha$ being the primary parameter with the lowest value and $\beta$ the one with the highest value. Secondary parameters scale off the following primary parameters:

- Strength: Physical Attack and Physical Defense.
- Evasion: Physical Defense and Magical Defense.
- Concentration: Magical Attack and Magical Defense.
- Accuracy: Physical Attack and Magical Attack.

Each character also has an innate bonus to certain secondary parameters:

- Stahn: Strength +4.
- Rutee: Evasion +5, Accuracy -10.
- Leon: Evasion +25, Accuracy +20.
- Mary: Accuracy -10, Concentration +10.
- Chelsea: Evasion +40.
- Johnny: Strength +40.
- Kongman: Strength +100, Concentration +30.

#### Definitions

While primary parameters are straightforward, secondary ones can have multiple effects during battle.

**Strength** is the most basic one, which is the parameter that defines your maximum number of health points (HP). Your HP is $Strength * 6$.

**Evasion** is a defensive parameter that affects two mechanics. First, it increases the chance your character will automatically guard against attacks (if not in a *:{'redirect' : '#battle'} chain*). For enemies, instead of guarding those attacks will hit aa *:{'redirect' : '#guarding'} iron stance*. The second effect is that evasion decreases the chance for that character to receive critical hits.

**Accuracy** is a parameter that counter-acts evasion. Increasing accuracy decreases the chances that an attack is evaded. Additionally, accuracy also affects how much *:{'redirect' : '#battle'} blast* the enemy gains for your every attack. Your actual accuracy value changes constantly during the fight depending on your actions, which will be shown in the following sub-sections.

**Concentration** is an offensive parameter that increases the chance of performing a critical hit. Critical hits deal increased damage, restore 2 CC, can stun or apply status effects, restore your lost accuracy by 10%, and reduce enemy blast by 5%. Keep in mind that criticals have an internal cooldown before they can be done again. The formula that controls critical hits is as follows: $\frac{Conc.^2 * \alpha}{Eva.^2} * 100%$, $\alpha$ being a multiplier specific to the attack and Eva. the evasion value from the opposing entity. How much more damage critical hits do depends on the difficulty, which is shown in the table below:

| Difficulty | Multiplier |
| :-------- | :----------: |
| Simple | 1.2x  |
| Normal | 2.0x |
| Second  | 2.5x  |
| Hard  | 3.0x   |
| Evil  | 4.0x   |
| Chaos  | 5.0x   |

### Swordian

Certain characters have access to Swordians. These are weapons that can grow based on the user's level, unlocking useful skills. This is controlled by the number of swordian device points, which you gain every time you level up, following the formula: $\lceil \frac{level}{10} + 1\rceil$. Swordian device points can also be gained by defeating certain bosses in the Hard difficulty or higher. There is also a *:{'redirect' : '#infinite-swordian-points'} glitch* that can be performed to increase points in the arena.

With enough points, you can set active skills in the swordian menu. Each skill costs a set amount of points. After fighting a certain number of battles with a skill set, it can be mastered, reducing the number of points required to set it by 20%.

*:{'media' : 'media/TODPS2/swordian.png', 'caption' : 'The swordian menu in-game. The star denotes a mastered skill.'}*

### Re-rise

For armor, jewels, and characters that do not use swordians, upgrading equipment is done through the re-rise system. By using lenses, which are dropped from monsters, you can create and upgrade various items. Once an item has been upgraded, it cannot be rolled back. To be able to re-rise certain pieces of equipment, you may need to increase your party level, which is the average level between all party members. There is no level requirement for using different types of lenses.

*:{'media' : 'media/TODPS2/rerise.png', 'caption' : 'The re-rise menu in-game.'}*

### Battle

Actions in battle are based on the chain capacity (_CC_) system. If you have enough CC, you can perform any action freely. CC is divided into minimum and maximum CC. You begin each fight with your minimum CC value and, by doing *chains*, you increase your current maximum CC by 1. This happens until you reach your character's maximum CC value; if you do any actions after that, your current maximum CC goes down to your current CC value or your minimum CC (the highest one). In any occasion, CC recovers naturally when not in a chain, at a rate of 1 CC for every 4 frames.

*:{'media' : 'media/TODPS2/cc.png', 'caption' : 'The battle arena. In the picture, the first character has a minimum CC of 8 and a maximum of 16.'}*

Doing offensive or movement actions starts a _chain_. This can affect a myriad of things, from techniques to casting time. CC will not recover naturally while in a chain. A chain will be extended by doing any other action while in one, and will only end once your character goes into a neutral stance. Once you hit 0 CC, any action that would require CC to perform will fail (even if you have bonuses that decrease that action's cost to 0), making you end your chain. If you have more than 0 CC but try to perform an arte that requires more than your current amount, a normal attack will happen instead.

When attacking, defeating an enemy (scales out of the combo counter), blocking (scales out of the damage received and max HP), or taking damage (scales out of the damage received and max HP) you will gain blast points. Additionally, when using an action that has invincibility (attacks do not connect and deal no damage), you will gain blast as if you would have taken damage. This blast can have different uses depending on the situation. Enemies gain blast when getting hit and this value is reduced every frame that they are attacking or casting (animation). Once enemies hit 100% blast, they will gain a small amount of invincibility and perform an attack. Enemy blast gain is also tied to your character's accuracy. When doing attacks, your accuracy value is decreased slightly, and you get a further penalty for repeating the same attack multiple times (up to 7 times). All these reductions are recovered when performing a _charge_ or using a different attack (in the case of the same attack penalty).

### Universal Controls

#### Normal Attacks

Normal attacks are the cheapest offensive action costing only 1 CC. However, doing multiple normal attacks in the same chain will cause them to suffer a damage reduction of 10% for each attack, up to a maximum of 90% (80% on *DC*). This reduction is removed by doing an arte or spell while in the chain. Ending the chain will also reset this reduction.

#### Guarding

Guarding is used to reduce damage from physical attacks and to prevent being staggered. Damage is reduced by 75% when guarding on the vanilla version, but on the DC version, damage is further reduced based on difficulty. You can also perform a *Flash Guard* by guarding just before an attack hits, which reduces damage by 90% (which is lower than normally guarding attacks when playing the DC version at the Chaos difficulty).

| Difficulty | Reduction   |
| :--- | :----: |
| Simple | 75%  |
| Normal | 75% |
| Second  | 76%  |
| Hard  | 80%   |
| Evil  | 85%   |
| Chaos  | 92%   |

CC also affects guarding, your current CC being the number of hits you can guard. Once your you guard the amount of CC you have, you will begin to flash red and the next attack will guard break you. Getting hit or doing any action that uses CC will restore the amount of hits you can take up to the maximum.

By holding guard and tapping down you will perform a *charge*. This costs 2 CC, will guard against magical attacks, restores your lost accuracy, and makes it so that your next attack will always break your enemy's guard if able.

When an enemy activates evasion, or when they're doing certain attacks, they gain _iron stance_. When hit at this point, a small white puff of air will appear where the attack hits. The attack will not connect and will do only 60% of the damage. Enemies can drop all iron stance after or before certain attacks, just like the player cannot activate evasion when they are attacking. Enemies may also have _superarmor_, which is similar to iron stance but cannot be broken. An iron stance that lasts a set number of hits is called penetrate. If an enemy has a penetrate value, it will be shown on screen how many hits are needed until the penetrate is broken.

#### Movement

You can walk left or right with the D-Pad. Double pressing a direction or using the left stick will allow you to run, which enables you to pass through enemies. Certain enemies can push you back when you try to pass through them by blocking. You can also do the same against enemies who try to run behind you.

*:{'media' : 'media/TODPS2/guardPush.mp4'}*

By holding guard and pressing forward you will do an aiming dash. This will make your character dash towards the enemy, and go into the air if needed. By pressing backward instead, you will backstep. This will make your character take a step back to evade enemies' attacks. Backsteps and aiming steps do not have invincibility and cost 1CC (without NG+ options). While backsteps can be done indefinitely, aiming dashes from the ground cannot be done successively without a different action in between. Additionally, if you are in a chain, you are limited to one aiming dash unless you do a backstep, touch the ground from landing, or if you are in the air. Aiming dashes and backsteps should always be done based on the direction your character is facing. This is important if you're running away from an enemy or if you jump over them. If you're running away from the enemy while on the ground, your backstep will instead make you stop and face the enemy. Therefore, if you wish to backstep while running away, you have the hold guard and press towards the enemy to stop and face the enemy, then hold guard and press away from the enemy to backstep.

If an enemy knocks you up into the air, pressing square just as you touch the ground will perform a backstep instead of getting knocked down. This only works for attacks that launch you high enough up in the air. Attacks with a hard knockdown are unable to be recovered (your character will lay down again before getting up).

Holding guard and pressing up will make you jump. This can also be done by just holding up on the left stick when in manual mode. Jumping can be used to evade enemy attacks and to cancel actions. Running before jumping will also conserve your momentum. Each jump costs 1 CC and can be done twice in succession. Doing artes, normal attacks, or touching the ground will reset this limit. After a certain height, no actions other than jumps and aiming dashes are allowed. This is due to the player character being too close to the physical ceiling of the map. Touching the physical ceiling of the maps allows you to perform *:{'redirect' : '#air-walking'} air walking*.

#### Artes and Spells

Artes and spells cost more CC than a normal attack, but they normally do more damage and have special effects. They are denoted by a sword symbol (physical artes), a flaming sword symbol (magical artes), a purple glyph (offensive spells), or a blue glyph (support spells).

Spells require a certain cast time before coming out. This is divided into the casting animation and the release animation. Spells can be held and not released by holding the artes button or be canceled by tapping guard (produces the same animation as turning around when running, which has a different recovery time depending on the character). Spells **cannot be canceled** if done at the start of a chain in semi-auto mode (will cause them to be re-cast instead). Additionally, some spells may impose a limit on how many are present on the screen. These are usually reserved to screen-wide spells and they are limited to 4 at a time.

Cancelling spells can be an easy way to reach max CC. However, make sure you don't do it after guarding, as that will lock your CC in place. Doing any attack or movement option (other than walking or running) will cancel this.

As you use artes and spells, they gain additional effects:

> ⭐  - Critical Rate is doubled. (100 times)  
> ⭐⭐ - Accuracy reduction when using the arte is reduced by 25%. (300 times)  
> ⭐⭐⭐ - 20% Chance of gaining back 1 CC Point if successfully hit. (600 times)  
> ⭐⭐⭐⭐ - Increase Enemy Stagger Time by four frames. (1000 times)  
> ⭐⭐⭐⭐⭐ - 100% Chance of gaining back 1 CC Point if successfully hit. (5000 times)

There are various mechanics which impact the casting time of spells. Before a battle, you can use skills and equipment to reduce casting time. Additionally, Leon's De-Earth (*ディアース*) skill also reduces the cast time of Dark Spells, and the same applies to Phillia's Mental Necklace (*メンタルネックレス*). During battle, using artes and spells will reduce the casting time for spells as far as 80%. This reduction has a hardcoded limit of 31 frames. Casting time follows the formula $\frac{C.Time * \alpha}{10}$, $C.Time$ being the cast time for that spell after any out-of-battle reduction and $\alpha$ is a variable that is increased by 1 for each arte used in the current **chain** and 2 for each spell.

If a spell can't be released due to the screen-wide spell limit, the casting time will be set to 4 frames until a spell slot opens up. Also, if you cast the same spell multiple times in succession, the second and any subsequent spells will not have any reduction in the Casting Time, however, the actual reduction will persist when casting a different spell.

Examples (current applied reduction in between parentheses):

- Demon Fang (100%) -> Fireball (90%)
- Fireball (100%) -> Demon Fang (80%) -> Fireball (70%)
- Grave (100%) -> Normal Attack (80%) -> Grave (80%) -> Stone Wall (60%)
- Grave (100%) -> Grave(100%) -> Grave(100%) -> Stone Wall (40%)

Another effect that artes can have is related to healing. Healing artes will drop the healing effectiveness by 5% per use. Rutee's Resurrection is the only exception since it will drop it by a total of 20%. This will continue to decrease until healing actions restore only 50% of their original value. To recover effectiveness, simply land a hit to recover 5% per hit. You can also use Rutee's Search Gald and Trickster, which restores 20% effectiveness and can boost healing to up to 150%.

#### Blast use

Once you have a full blast gauge, you can use a Blast Caliber by pressing or holding its respective button. You can also perform Blast Calibers by holding the arte and normal attack buttons. If this is done on NG+ with 2 full blast gauges and on a combo with 100+ hits, a special Blast Caliber will be performed (has a total of three versions that can be done after the previous tier is done).

If your character is being continuously staggered by the enemy (more than one hit/arte) and you have 1 complete blast gauge, press L1 (just before or during a hit) to perform a Damage Break. Damage Break takes 500 Blast Points (half a gauge), gives you invincibility for 60 frames, and, on the DC version, restores your HP by 10%. This is similar to the effect that enemies have when they reach 100% blast (minus the healing). Most enemies can only do a damage break when on the ground, while the player and some specific enemies can also do it in the air.

*:{'media' : 'media/TODPS2/damageBreak.mp4'}*

#### Control Modes

By pressing the select button during battle, or changing it manually in the artes menu, you can change between three control types: auto, semi-auto, and manual.

On auto, the default control mode for your party members, the character will act according to the strategy you have set. You cannot move characters or do any action manually other than using items, using shortcut artes from your controlled character, or requesting them to do artes or spells from the artes menu. On semi-auto mode, you can move and perform actions yourself. At the first attack of a chain (and only if you are not currently in a chain), your character will adjust their position automatically (with running and dashing). Additionally, attacks are automatically defended against if possible. This is similar to the auto-guard that happens when evasion triggers. On manual, all actions are controlled by the player.

### Combat States

#### Stagger

The player and enemies may be in various states during battle. The most common of these is the staggered state. If an attack hits, the enemy is staggered and is allowed to be combo'ed. An attack can also launch its target into the air, which will cause a slight bounce when they touch the ground. Other than the vertical launch, aerial combos and launch attacks do not have any special effects on stagger time. During a combo chain (a chain where you've previously hit the enemy), attacks cause an initial burst ( *chain stagger extension*) of stagger on startup to allow further attacks to connect better. This is 12 frames for normal attacks and around 14 frames for artes (though it differs from arte to arte and can be 20+ frames). Combo'ed enemies can only drop out of combos by running out of stagger, using a *:{'redirect' : '#blast-use'} damage break*, or by boss-specific mechanics. Combos also increase experience points. After 100 hits, the launch power of attacks becomes slightly random to make infinite combos harder.

Some attacks can also also cause a knockdown. This is a state where the character is knocked into the ground and does not receive any additional stagger other than from a chain stagger extension. They will also iron stance through attacks if hit when at 10 stagger or below. A knockdown can also be caused by hitting an enemy from high enough from the ground and letting them fall. The knockdown effect, if applied on the air, can be overwritten by another status (such as a normal stagger) if it is applied before the enemy touches the ground. Some specific attacks can also cause a hard knockdown. This is the same as the normal knockdown but will not cause a bounce if done from the air. When on the ground, enemies can only take so much stagger before instantly going into a knockdown state. This happens when a chain stagger extension or *:{'redirect' : '#stagger-storage'} similar mechanic* makes the stagger value reach 50 frames.

To continue combo'ing from a knockdown, some attacks have the off-the-ground (OTG, also called restand) property. This will cause the enemy to get back up from the knockdown state. Another unique property is the freeze effect, which will make enemies not be able to be pushed around (both in ground and air) and they will stay still during the stagger time of the attack that caused it. A freeze attack that stuns will be extended. The momentum of that attack will also be applied once the effect ends.

Some enemies cannot get knocked down. While this doesn't affect stagger time directly, they still gain the knockdown effects (and thus won't gain stagger from connecting attacks) if they would be knockdown due to high stagger (>50 frames). This can make enemies feel like they're resisting stagger when in fact they're being treated as knockdown'ed. While there are no visual cues to this effect, doing an OTG attack will also clear the knockdown effect as it would do normally.

*:{'media' : 'media/TODPS2/staggerKnock.mp4', 'caption' : 'Example of an enemy that normally cannot get knocked-down, but does due to high stagger.'}*

#### Status Ailments and Stun

Critical hits are tied to status ailments and stuns. Universally, they amplify the stagger value of the attack that caused it and cause a knockdown. For status ailments, they have various effects and disable the use of Blast Calibers. Different status ailments have different durations and cooldowns, which can cause you to perform less critical hits. If a status ailment is not applied, the enemy will be stunned. Stuns causes a different staggered state (with its own duration), the next hit while the enemy is stunned also receives bonus stagger time. When the enemy is stunned, all attacks OTG (including the hit that caused the stun, which means that attacks that knockdown will not if they cause a stun). Stunned airborne enemies that touch the ground can still get knocked down. Stun duration may be modified by equipment, however, spells that cause a force stun will ignore those modifiers (and possibly even reduce the duration if the enemy is already stunned). Additionally, each enemy has a definitive strike chain, which is a set combo that will stun the enemy and increase the drop rate in that battle to 100% (or double it in successive encounters).

A special status is the stop effect. This is caused by specific artes and the hourglass item. During stop, the enemy will stay still until the stop effect ends. Stun duration keeps counting down during stop.

#### Elemental Advantages

There are 10 elements in the game: Slash, Strike, Pierce, Sound, Earth, Wind, Fire, Water, Light, and Dark. Swordians and equipment may also have an attribute. These only affect normal attacks and specific artes.

Elements are divided into offensive (applying elemental effects) and defensive attributes. Defensive attributes are further divided into resistances and weaknesses. Attacking a resisted element will do reduced damage, increase the chance of evasion (hit rate and critical rate are reduced to 1/4), and reduce the stagger duration for that attack by 2 frames. Weakness gives increased damage, increased accuracy, increased critical rate, and increased stagger time by 2 frames. Attacking both a weakness and a resistance at the same time will result in a normal hit. Additionally, if the same attack hits more resistances than weaknesses, the attack will be considered a resisted attack. Below is a table showing how weaknesses and resistances affect damage:

| Difficulty | Resist   | Weakness   |
| :--- | :----: | :----: |
| Simple | 0.90x  | 1.10x |
| Normal | 0.50x | 1.50x |
| Second  | 0.50x  | 1.75x |
| Hard  | 0.40x   | 2.00x |
| Evil  | 0.40x   | 2.50x |
| Chaos  | 0.30x   | 3.00x |

## Techniques

### General Techniques

#### :{'media' : 'media/todps2/healR.mp4'} Arte Redirection

When canceling a healing spell with a guard, you will still have your target at party members. This allows you to use artes without facing the enemy. Arte redirection only applies for the first arte in a chain and gets canceled when you cast another spell or perform a Blast Caliber.

#### :{'media' : 'media/todps2/castRedct.mp4'} Semi-auto Casting Reduction

Cancelling spells in semi-auto still maintains your chain reduction. By canceling low-CC spells, you can max out your casting reduction in a shorter span of time than casting them fully. For 8 CC (canceling 4 2CC artes) you can get an almost instant 80% reduction on your next cast. You still need to fully cast the spell you buffered in semi-auto to perform a different spell. With *:{'redirect' : '#sb-storage'} SB Storage* you can also perform this technique mid-combo or make use of the reduction without casting the buffered spell.

#### Weakness Carryover

Weakness combos are based on the *:{'redirect' : '#battle'} _chain_* system. This means that, if you start a weakness combo, that weakness will persist only until you end your current chain. For example, ending your chain after a weakness combo and then doing a resisted hit (while the combo counter is still up) will change that combo to a resisted one.

To bypass this system, you can use the lingering hitboxes of artes and spells to carry over the weakness effect to a new chain. As such, performing a spell the enemy is weak against, ending your chain, and then continuing the combo as that spell hits the enemy will maintain the weakness combo even if you do not hit any weakness element with your current chain.

Another interesting effect is, since weakness combos are based on the current chain, hitting an enemy's iron stance (also includes the penetrate counter) with a weak element will also count as a weakness combo if you break that enemy in that same chain (no matter the element of the hit that breaks it).

### Movement Techniques

#### Gliding

The first normal attack of any _chain_ has different properties than other ones. That normal attack will maintain the momentum of your character, enabling unique combos. Successive normal attacks will be more _floaty_, maintaining your current height at the cost of killing your momentum.

You can use the property of the first normal attack to quickly cross the battlefield by performing a **glide**. To do this, use your first normal attack after an aiming dash that goes into the air.

*:{'media' : 'media/todps2/gliding.mp4'}*

The velocity of your glide depends on the distance and angle your character has with the enemy. Additionally, you can perform a glide even if you've already used your first normal attack if the enemy is positioned above you. You can preserve your current momentum by extending your glide with jumps. Aditionally, you may still use normal attacks to reset your jumps if you're going towards the enemy. Doing normal attacks when going away from the enemy, or doing normal attacks with an angle towards the enemy will stop your glide instead.

Chelsea air normals have different properties due to being a bow shot. This makes her unable to do glides.

#### :{'media' : 'media/todps2/airWalking.mp4'} Air Walking

The edges of the battle arena cancel any momentum when touched. For the left and right bounds, this enables you to instantly change direction after touching the wall, without needing to do another jump. The ceiling of the battle arena also has an interesting effect. When in the air, reaching the ceiling will reset your vertical momentum but also reset your jump limit. This enables you to stay mid-air by continuously jumping. By releasing the guard button (if you have it pressed), you can change your direction in midair by slightly tilting the left stick when jumping.

#### :{'media' : 'media/todps2/slowFall.mp4', 'forcedmedia' : false} Slow Falling

Floaty normal attacks (as in, the second+ normal attack in a chain), can also be utilized to perform unique actions. By doing a normal attack just as the momentum is changing from upwards to downwards, you will able to stall mid-air. Depending on your timing, your character will fall slowly instead. Some artes can also present similar effects.

#### :{'media' : 'media/todps2/hitboxes.mp4'} Moving Hit-Boxes

Performing an aiming-dash or backstep a few frames after an attack can move its hitbox. This behavior heavily depends on the attack used.

### Defensive Techniques

#### Spell Locking

If you quickly cancel a screen-wide spell 4 times (by casting and guarding), all current and future casting animations will lock up (they will not stop casting). This happens due to the limit of 4 screen-wide spells in the field and because canceling a spell does not clear its casting time in memory. This also applies to enemy spells.

The first spell in a chain in semi-auto is automatically canceled. However, this effect cannot be abused to instantly lock spells.

#### Spell Block

Casting a spell just as an enemy hits you negates the damage you would take. This requires a skill (either from an accessory or a swordian) that reduces your casting time (which can be seen visually by the "High Speed" pop-up once you cast a spell). Only works for attacks that lose their hitbox once they hit something, as multi-hits attacks will still hit you on their second hit. Hits negated this way still generate blast as a normal hit would.

Similarly, the spell release animation also has invulnerability frames. It is longer than the spell cast invulnerability and can be more easily used by holding the spell down and releasing it before a hit.

*:{'media' : 'media/todps2/spellBlock.mp4'}*

#### :{'media' : 'media/todps2/push.mp4'} Push

When an enemy attack requires melee distance to perform, you can aiming dash just as the attack is about to come out (just when the enemy finishes walking or running, but before the attack comes out) to push the enemy away. The distance pushed depends on the distance you had between the enemy before doing the aiming dash.

#### :{'media' : 'media/todps2/baitReset.mp4'} Bait Reset

If you stagger an enemy on the same frame they would start an attack, they will store that action and perform it as soon as they're out of stagger. You can more easily do this by properly spacing yourself as the enemy walks or runs towards you. Most of the time, at this point the enemy's aggression timer is at 0, meaning they will start an action as soon as they get close enough.

If the enemy is in a combo and they perform a stored attack, punishing that attack will continue your combo as normal (not considered a dropped combo). This also happens with certain enemy's damage break attacks.

### CC-Related Techniques

#### Faster Recovery Techniques

When doing a straight fall (no horizontal momentum), your character takes 42 frames to start to recover CC, which increases at a rate of 1 every 4 frames.

There are two ways to make this recovery faster:

- The first is using a normal attack before landing. This needs to be high enough from the ground so that touching it will cause the animation of the attack to cancel. This costs 1 CC and reduces the landing recovery from 42 frames to 25, resulting in you recovering faster and having more CC available for use (+3 CC by the time the other recovery animation would be ending). *:{'reference' : true} 1*
- The second is using a spell and instantly canceling it with a guard. The spell needs to be done just before touching the ground, while you're still in the air. Your character will proceed to lock to the ground to perform the spell, where you can then cancel it. This method also reduces the recovery to 25 frames, however, it costs at least 2 CC (causing you to have only +2 CC than not using it) and it is harder to perform. Can be useful for cases where you do not want your normal attack to hit.

For falls with horizontal momentum, the recovery time will be 25 frames, and using one of the techniques above will not reduce it.

Having a faster landing recovery can also be useful to reset the properties of your normal attack.

Another recovery that can be beneficial to cancel is the release of spells. These usually take 72 frames to start recovering CC, but can be canceled earlier. By chaining the spell with another and then instantly canceling it, you can reduce the recovery to 42 frames (+5 CC). You can also use an aiming dash or backstep if you have only 1 CC left since those still recover faster than waiting for the spell release animation.

#### :{'versions' : 'Vanilla'} CC Recovery Glitch

Another way to increase your maximum CC is to manipulate the end of a chain. Just as a chain is ending, mash the block button. This will cause your CC to rise much more than it was supposed to, possibly even to the max. Only works in Manual Mode. *:{'reference' : true} 2*

### Attack Cancel

Pressing the artes and the normal attack button on the same frame can cause some interesting effects. Since the game thinks you're doing a normal attack (which registers before your arte), every arte you do will not have the accuracy penalty that is applied for repeated artes. This is called an Attack Cancel (AC). Due to how it works, ACs can be used for various effects, which will be shown in the next subsections.

#### :{'media' : 'media/todps2/followUp.mp4'} Follow-up Negation

An AC can be used to ignore follow-up artes or other mechanics that require 2 moves to be used in succession. For example, Leon can use Demon Fang twice in a row if the second one is AC'ed.

#### :{'media' : 'media/todps2/magicDash.mp4', 'forcedmedia' : false} Magic Landing Dash

When landing, if you do an Attack Cancelled Spell, you will get a small momentum forward (like most normal attacks have). Works mid-chain.

#### Attack Cancel Spell

When casting an AC'ed Spell, there will be no restriction on casting time when doing the same spell. This cost +1 CC. Thus you can do A.C Spell (100%) -> A.C Spell (80%) -> A.C Spell (60%).

### Stagger Manipulation

#### :{'media' : 'media/todps2/staggerStorage.mp4'} Stagger Storage

By doing any offensive arte and **dropping** the chain (as in, not continuing the combo) you get an additional 20 frames of stagger stored on your next aiming dash. Doing an aiming dash/backstep/charge/landing (from a jump) before using the stored stagger negates the effect. Jumps and other artes can be done safely without consuming the stored effect.

### Spatial-buffer Cancel

Semi-auto on Destiny works mostly in grounded combat since air actions do not have any proximity correction mechanics. Any ground action that you do while not being in a chain or after other unique actions such as landing from a jump, backstepping, aiming dashes, and charging, will start a running animation (the semi-auto run that is present in most entries on the franchise). This is because, while in semi-auto mode, actions that would whiff if done where you are will be buffered and make your character run instead. This semi-auto run will end depending on the distance (between you and the enemy) that is necessary for the buffered action to "connect".

Once your character gets close enough, the buffered action will be used and the buffer is cleared. You can cancel the semi-auto run animation by either jumping, doing an aiming dash, or stopping (by doing the input for a backstep). Both jumping and stopping will also clear your buffered action.

Two properties of semi-auto can be exploited to do advanced techniques. They are the two spatial properties: the current distance between you and the enemy and the distance necessary for your action to be performed (after the semi-auto run); and the action buffer.

Under normal circumstances, you cannot have an action buffered if you're not in the semi-auto run state. However, if you run away from the enemy and perform a normal attack or arte that requires your character to be closer to the enemy, your character will first do an animation to stop and turn around. This action, which will be called the _forced neutral animation_, is one of the only periods where you can perform another action while you still have a buffered action.

In short, any action you do while running away from the enemy will initiate a _forced neutral animation_ and be buffered. This animation can then be canceled in any other action which will come out on the spot. After the action is finished, your character will once again return to neutral and start the semi-auto run to perform his buffered action.

The three key points to that behavior are the **buffered action**, the **forced neutral animation**, and the **forced action** (the action that is used to cancel the _forced neutral animation_). This, however, is still nothing that couldn't have been done in manual mode. That is where the spatial properties come into play. During the _forced action_, if your character comes close enough to the enemy to the point where you wouldn't need the semi-auto run, your _forced action_ will instantly be canceled and the _buffered action_ will come out.

This is called a Spatial-buffer cancel (SB Cancel). The cancel can even mess up your momentum and your character's state (such as color).

*:{'media' : 'media/todps2/sbCancel.mp4'}*

There are other important points to SB Canceling:

- If you go airborne during your _forced action_, keep in mind that air-enabled actions have different spatial properties for air and ground (this depends both on the _forced action_ and the _buffered action_). If your _buffered action_ does not come out, it will be cleared due to the semi-auto rules mentioned above. If your chain does not work because of spatial properties, you can consider using a normal attack as the _buffered action_, since the air version of it does not need spatial considerations to come off (works on any distance). You can then chain your preferred action to the normal attack, while still canceling the _forced action_. You should also take into consideration that various artes may not look like they leave the ground, such as Leon's Dragon Swarm, but they will consume any air-enabled _buffered action_ or clear the buffer during its execution.
- If the _forced action_ you used was using an artes button (o/x), the _buffered action_ will be overwritten to be the same as the _forced action_ you just used. If the _forced action_ you used was using a shortcut (L2/R2), your _buffered action_ will stay the same.
- Airborne enemies change the spatial properties required for your _buffered action_ to come out. Your character can either cancel as normal, do an aiming dash after your forced action is done (thus not canceling it), or be temporally stuck in a loop where you automatically walk left and right beneath the enemy (until he's within range for the _buffered action_ to come out).
- You can also buffer an action without a _forced neutral animation_, however, this must be done frame perfectly (pausing or using the targeting menu can help).
- If your _forced action_ is AC'ed or if the _buffered action_ is an AC'ed arte, the _buffered action_ will be the same as a normal attack.

#### :{'media' : 'media/todps2/sbShortHop.mp4'} Short-hop actions

If you backstep while you have a _buffered action_, you can activate it while being extremely close to the ground. This can easily be done by making your _forced action_ a backstep. The only confirmed example for this is doing short-hop normals, since they do not require spatial properties.

You may also use the backstep after your _forced action_, if your _buffered action_ was not consumed.

#### :{'media' : 'media/todps2/spellSb.mp4'} Spell SB Cancel

SB canceling spells (i. e. using shortcut spells with another action buffered) can be a good option select since it can make an arte come out before the spell has finished casting, making so that you don't get punished in situations you normally would be. It can also be used to completely negate the spell release frames, regaining control faster. Additionally, if casting a spell on semi-auto, changing your control mode to manual will still have that spell buffered, which can help with SB Storage.

Finally, if the spell ends in the air and if the _buffered action_ is air-enabled, the moment your character leaves the ground the animation will be canceled and the air action will come out.

*:{'media' : 'media/todps2/demonLanceCancel.mp4'} For example, Leon can use Dragon Swarm just after the jump from Demon Lance, making the lance follow Leon while Dragon Swarm is in effect.*

#### SB storage

By changing to Manual during the _forced neutral animation_ (or during casting for spells and 1 frame after pressing the artes button for screen-wide artes), the _buffered action_ will be saved in memory but will not be consumed. Once you return to semi-auto (even mid-chain), the _buffered action_ will still be available to use. Since you can have much more accurate movements in manual mode, it is possible to set up a specific position and then change to semi-auto, automatically canceling your action due to the spatial properties of the technique.

*:{'media' : 'media/todps2/sbBuffer.mp4'}*

The same rules apply once you return to semi-auto mode (normals, air actions...). This can be used to properly cancel attacks with air-enabled spells.

This cannot be used to bypass the air limitations of the battle arena.

This enables you to cancel actions not possibly on just semi-auto. For example, SB canceling a grab arte (from Kongman or Stahn) will make it so that the enemy will get stuck to that character until your chain ends (which can be prolonged indefinitely by holding a spell with Stanh and doing backsteps with Kongman with the *Free Movement* option from NG+).

### Transition Glitch

Spells in this game work in a certain way. First, when starting to cast a spell, information related to that spell is loaded into memory. Then, after a certain amount of time (casting time) and if the screen allows it (for screen-wide spells), the spell comes out. At this point, new effects may be loaded into memory, such as graphical elements or other animations. These are called successively until the spell is finished. Some effects, however, have windows on their transitions where one can overwrite their behavior, which is the basis of the transition glitch.

This takes into consideration the following aspects: the characteristics of the effect/spell currently on screen, if the spell was already loaded in memory (requires you to start the casting animation at any point during the battle -- it is not required that you complete the cast), and if that effect was generated normally or due to another transition glitch. If done correctly, you can create a spell that is not correctly handled by the game, allowing further glitchy effects. There are two known ways to create a "stale" effect to perform the transition glith: using the Fearful Flare spell and the Surviving Hollin Blast Caliber.

#### :{'media' : 'media/todps2/transitionFearful.mp4'} Fearful Flare

The last fireball from the Fearful Flare spell has a stale animation that can be abused by a transition glitch. First, load the spell you want to perform in the place of the last fireball in memory by casting it (can be canceled by guarding, just starting the chant works). This spell will be loaded in memory until the end of the battle. Then, cast Fearful Flare and start casting your loaded spell just as the last fireball (fifth hit) of Fearful Flare is on screen. You do not need to finish casting the spell for the glitch to work. Based on the spell loaded (some may result in no effects or just graphical artifacts), a glitchy animation will play out. If the spell does damage, that damage will also use the same multiplier as Fearful Flare.

While only Stahn and Phillia have access to Fearful Flare, other characters can still perform step 3. You can also perform this glitch when the enemy uses Fearful Flare on your team. This may result in different effects than casting Fearful Flare on your own.

#### Surviving Hollin

The last laser of Surviving Hollin also has a stale animation. The principle behind it works the same way as the Fearful Flare variation. Load a spell, do Surviving Hollin, then cast the loaded spell just as the final laser is on-screen. This results in different effects from the fireball from Fearful Flare.

*:{'media' : 'media/todps2/transition.mp4'}*

In the video, the final laser is canceled by Dark Hole. This creates a persistent graphical artifact that can be used to perform other transitions easily. At this point, every animation not tied to a character can be manipulated by a Transition Glitch, enabling further effects not tied to Fearful Flare or Survivin Hollin. An animation is then canceled to Holy Lance which is quickly canceled into Explode, glitching the background and creating multiple instances of it. This is then canceled to Piko Piko Hammer, Stone Wall, and Indignation.

Various effects can be created using transition glitches. However, keep in mind some may exhaust the number of loaded animations in memory (causing no more projectiles or spell effects to happen for the rest of the battle) or crash the game.

## Glitches

### Out-of-Bounds and Sequence Breaks

#### :{'media' : 'media/todps2/caveQueen.mp4'} Skip Cave Queen

By walking on the side of a ledge on the screen where the Cave Queen boss battle starts, you can skip it and get to Moreau earlier than intended. You can buy some items there and talk to NPCs, but you still need to beat Cave Queen to continue the story. You can also get a dagger for Leon early. *:{'reference' : true} 3*

#### Mid-game battles while in Early-game

You can trigger encounters from the Phandaria region, which has enemies around level 34 normally encountered at the end of Arc 1, by going to the place in the following picture:

*:{'media' : 'media/todps2/Snow.png'}*

You can use this spot to farm levels or lenses, especially while on NG+. Ideally, you'd fight a group that contains a bear and perform 2 (or possibly 3) sets of Universal BCs against it for tons of experience, enough to get you to level 50+.

Available since the beginning in Leon's Side and once Leon joins the party in Stahn's Side.

### Exploits

#### Infinite Gald and EX points

*:{'media' : 'media/todps2/gald.mp4'}*

Go into a shop and buy something (x1). After that, add one of one item (D-Pad right) then click buy on another item (circle). Doing a cancel (X) will then cause an underflow, after this, you can do R-STICK left to "buy" the minimum possible, thus, gaining infinite gald or ex points. Using this when selling will cause you to lose all your money (and the items) instead. *:{'reference' : true} 4*

#### Infinite Swordian Points

"Cave Queen" (Stahn), "Cave Head" (Leon), "Cave Swell" (Phillia) monsters in the Definite Strike arena award Swordian Points when defeated on Hard or higher (3 points in Hard, 4 in Evil and 9 in Chaos). This mode becomes available in Noischtat once the final boss is defeated. Can easily be exploited for max Swordian Points. *:{'reference' : true} 5*

These are the Definite Strikes you have to perform against each part:

- Leon vs Cave Head: Garyuusen → Garyuumeppa → Kuushuuken
- Philia vs Cave Swell: Wind Arrow → Lightning
- Stahn vs Cave Queen: Bakuenken → Souryuu Rengazan

## Characters

This section is under construction and may not represent correctly the contents that will be present in the final version.

[TODO] List of characters and (important) arte parameters.

[TODO] Strategy Menu.

### Leon

Aerial spells require a hit confirm.

- Leon's Glimmer Dragon (Garyuusen): +22 frames of stagger.

#### :{'media' : 'media/todps2/leonJump.mp4'} Swallow Talon Glitch

Swallow Talon has an interesting effect when mid-way canceling with a jump. Normally, the user will jump forward slightly. However, if you jump just before the second part of the attack, you will get a large amount of momentum backward. If you do a normal attack instead, you will get some vertical height during your attack.

#### Attack Cancel Glitched Artes

Using *:{'redirect' : '#attack-cancel'} attack canceled* artes after a normal attack or another attack canceled arte can have some glitchy effects. For example, Dragon Swarmn and Phantom Edge will have half as much range. Only some artes can cause this effect. Artes that are not affected by this glitch will not cancel it, and the effect will be stored in memory until it is consumed. For example, you can do a normal attack followed by an attack canceled arte that doesn't consume the effect (ex: Glimmer Dragon) to store it for a future combo.

### Strategy Menu

### Boss Strategies

#### Boss AI Manipulation

Multiple bosses in Tales of Destiny can be manipulated to make fights easier, such as ignoring mechanics or skipping phases. Bait resets can be used to easily punish bosses, and spell locking can trivialize some fights.

Certain fights, however, have unique ways in that they can be manipulated.

*:!Ilene* has a unique glitch where, if she blocks a BC, she will stay in that state until you pause the game, try to change targets, or hit her. This effect changes in the different versions of the game. You can use this time to heal up, cast spells, or even safely set up the spell lock technique.

The *:!Rembrandt* fight has multiple ways in which you can manipulate it. The fight has certain HP thresholds where he changes from a ground form to an air form. All of these can be canceled by using a BC. You can also use a BC just after the change form animation is playing: if you do it while he is going to the air, he will be stuck in the air on the ground form; if you do it while he is going to the ground, he will be stuck in the ground on the air form.

## Misc

### Game Mechanics

#### Narikiri Dolls

Narikiri Dolls changes the character it is equipped on to another character. This lets you use characters that are not available yet in the story or are not in your current party. You can also use it to apply the effect of pieces of equipment and attacks of certain characters to another.

When equipping narikiri dolls, some attacks change properties to reflect the wearer's (original character, not the narikiri) attack properties, despite what is shown in the attack description.

#### Text Skipping

Holding X and Square will automatically skip text. It  Also possible to be perform after options confirmations.

### Minor Combat Glitches

#### :{'versions' : 'Vanilla'} Elemental Damage Glitch

In the vanilla version, elemental physical attacks (artes with the flaming sword symbol) will check against the enemy's defense and **your character's magic defense**.

#### :{'media' : 'media/todps2/microDash.mp4', 'forcedmedia' : false} Micro-Dash

If you start moving left or right but use an arte at the same time, you will get a small momentum forward. Moving back produces the most distance, but it is still very small. Also works with spells. The same happens when landing from the air (depending on your momentum).

Since it requires a movement animation, it can only be done at start of a chain.

#### Fake Normal Attack

When using a non-air-enabled arte in the air, a normal attack comes out. Has no extra effects. You can also attack cancel this attack, causing you to spend 2 CC for 1 normal attack.

### Charge Sound Effect

Performing a Charge with Lilith will produce a "Bang!" sound effect, even if you´re using another character by equipping a Narikiri Doll.

### Food

You also have a food strap which you can use to make food during battle. The Food strap can be filled in a food store or inn for the 1 gald per food. There are two conditions where food can be used by food recipes: during battle or at the end of the battle. Only food items that are set are active. The strap with the lowest number will be activated first in case multiple can be activated. You only cook during battle once. The amount of food inside the food strap is increased by 2 each time it is used, and this becomes 1 once above 900 food points. The strap can also be evolved based on your current maximum amount, increasing the number of food recipes you can use at the same time:

| Evolution | Requirement   | Recipes |
| :--- | :----: | ----: |
| Sack | N/A  | 4 |
| Bag | 180 | 6 |
| Backpack  | 420  | 8 |
| Box  | 850   | 16 |

### Version Differences

Below is a non-exhaustive list of version changes that were made for the 2008 re-release (DC - Director's Cut).

- The total number for each individual lens you can carry has been increased to 9990 from 990.
- The upper limit for stats has been increased to 1999 from 999.
- An event was added to Stanh's side which enables you to change your character portraits.
- An icon was added to the food strap to show when a recipe was mastered (25 uses). In the original, this was only seen in the recipe book.
- Holy bottles will disable encounters instead of reducing their chance. Additionally, Woodrow's support effect was increased to 50% from 20%.
- Hint icons were added to some NPCs to show when they have an active event.
- New songs were added to the sound test.
- Titles, Artes, and the Food Strap can now be carried over on NG+.
- Artes that required codes from websites were changed to be unlocked in-game.
- A data transfer option was added to the main menu to convert your past save from the 2006 version.
- The "Second" difficulty was added.
- The damaged reduction from guarding against attacks now scales based on difficulty.
- The "damage break" mechanic has been changed.
- Some bosses have new behavior, new artes were added, some definite strike combos were changed, new side-quests, new skits, and new bosses for Lion's side.
- Several arte properties were changed. Leon got 7 new artes and Chelsea got 1 new arte.
- Rank 6 and Definitive Strike options were added to the arena.

## References

**[1]** [https://www.youtube.com/watch?v=58AZmkFtH-I](https://www.youtube.com/watch?v=58AZmkFtH-I)

**[2]** [https://www.youtube.com/watch?v=IlQw_DRxGj0](https://www.youtube.com/watch?v=IlQw_DRxGj0)

**[3]** [https://www.youtube.com/watch?v=kzvcOjRu81o](https://www.youtube.com/watch?v=kzvcOjRu81o)

**[4]** [https://www.youtube.com/watch?v=sAJMLSBYs1A](https://www.youtube.com/watch?v=sAJMLSBYs1A)

**[5]** [https://www.youtube.com/watch?v=aBKJ1egh_-g~](https://www.youtube.com/watch?v=aBKJ1egh_-g)

### Contributors

- Crystal Spire
- Just_Samu
- Kevassa
- Muctales
- VCent
- Zeke Belforma

### Resources
