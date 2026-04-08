// @ts-check
import config from "config.js";
import { world, system, GameMode, ItemTypes, ItemStack, EnchantmentType } from "@minecraft/server";
import { flag, banMessage, getClosestPlayer, getScore, getBlocksBetween, tellAllStaff, getFriends, findPlayerByName, findPlayerByID, setScore, absMax, absMin,lang } from "./util.js";

let entitiesSpawnedInLastTick = 0;

if (config.debug) console.warn(`${new Date().toISOString()} | Debug enabled`);

const scanDelay = config.scanDelay ?? 5;

world.afterEvents.explosion.subscribe((event) => {
	for (const block of event.getImpactedBlocks()) {
		event.dimension.runCommand(`tag @a[r=1,x=${block.x},y=${block.y + 1},z=${block.z}] add IsHurt`);
	}
});

world.afterEvents.projectileHitBlock.subscribe((event) => {
	if (event.projectile.typeId.includes("wind_charge")) {
		event.dimension.runCommand(`tag @a[r=4,x=${event.location.x},y=${event.location.y + 1},z=${event.location.z}] add IsHurt`);
	}
});

world.afterEvents.projectileHitEntity.subscribe((event) => {
	if (event.projectile.typeId.includes("wind_charge")) {
		event.dimension.runCommand(`tag @a[r=4,x=${event.location.x},y=${event.location.y + 1},z=${event.location.z}] add IsHurt`);
	}
});

system.runTimeout(() => {
	world.sendMessage(`§b◆ §r§9[§bBlarion§9]§r ${lang.message.global.load_successfully}`);
}, 20);

system.runInterval(async () => {

	const now = Date.now();
	if (config.misc_modules.itemSpawnRateLimit.enabled) entitiesSpawnedInLastTick = 0;

	// Run as each player
	for (const player of world.getPlayers()) {

		if(!player) continue;

		try {
			//Check a player is riptiding
			if (player.hasTag("riptide")) {
				player.isRiptiding = true;
				player.StartRiptide = now;
				//console.warn("riptide detected");
				player.removeTag("riptide");;
			}

			// Sexy looking ban message
			if (player.getDynamicProperty("banInfo")) banMessage(player);

			if (config.modules.nukerA.enabled && player.blocksBroken >= 1) player.blocksBroken = 0;
			if (config.modules.killauraC.enabled && player.entitiesHit?.length >= 1) player.entitiesHit = [];
			if (config.modules.autotoolA.enabled && now - player.startBreakTime < config.modules.autotoolA.startBreakDelay && player.lastSelectedSlot !== player.selectedSlot) {
				player.flagAutotoolA = true;
				player.autotoolSwitchDelay = now - player.startBreakTime;
			}

			// Crasher/A = invalid pos check
			if(config.modules.crasherA.enabled && Math.abs(player.location.x) > 30000000 ||
				Math.abs(player.location.y) > 1024 || Math.abs(player.location.z) > 30000000)
					flag(player, "Crasher", "A", "Exploit", `x_pos=${player.location.x},y_pos=${player.location.y},z_pos=${player.location.z}`, true);

			if (config.modules.crasherB.enabled && player.clientSystemInfo.maxRenderDistance > 128) {
				flag(player, "Crasher", "B", "Exploit", `renderDistance=${player.clientSystemInfo.maxRenderDistance}`, true);
			}

			const container = player.getComponent("inventory")?.container;
			for (let i = 0; i < 36; i++) {
				// @ts-expect-error
				const item = container.getItem(i);
				if (!item) continue;

				// Illegalitems/C = Check for items stacked over max amount
				if (config.modules.illegalitemsC.enabled && item.amount > item.maxAmount)
					flag(player, "IllegalItems", "C", "Exploit", `stack=${item.amount}`, false, undefined,undefined,undefined,i);

				// Illegalitems/D = Additional item clearing check
				if (config.modules.illegalitemsD.enabled) {
					if (config.itemLists.items_very_illegal.includes(item.typeId)) {
						flag(player, "IllegalItems", "D", "Exploit", `item=${item.typeId}`, false, undefined, undefined, undefined, i);
					} else if (!player.hasTag("op") && player.matches({ excludeGameModes: [GameMode.Creative] })) {
						// Semi-illegal items
						let flagPlayer = false;

						// Check for spawn eggs
						if (item.typeId.endsWith("_spawn_egg")) {
							if (config.itemLists.spawnEggs.clearVanillaSpawnEggs && item.typeId.startsWith("minecraft:"))
								flagPlayer = true;

							if (config.itemLists.spawnEggs.clearCustomSpawnEggs && !item.typeId.startsWith("minecraft:"))
								flagPlayer = true;
						}

						if (
							// Check for element blocks
							(config.itemLists.elements && item.typeId.startsWith("minecraft:element_")) ||
							config.itemLists.items_semi_illegal.includes(item.typeId) ||
							flagPlayer
						) {
							flag(player, "IllegalItems", "D", "Exploit", `item=${item.typeId}`, false, undefined, undefined, undefined, i);
						}
					}
				}

				// CommandBlockExploit/H = Clear CBE Items
				if (config.modules.commandblockexploitH.enabled && config.itemLists.cbe_items.includes(item.typeId))
					flag(player, "CommandBlockExploit", "H", "Exploit", `item=${item.typeId}`, false, undefined, undefined, undefined, i);

				// Illegalitems/F = Check if an item has a name longer than 32 characters
				if (config.modules.illegalitemsF.enabled && (item.nameTag?.length ?? 0) > config.modules.illegalitemsF.length) {
					flag(player, "IllegalItems", "F", "Exploit", `name=${item.nameTag},length=${item.nameTag?.length}`, false, undefined, undefined, undefined, i);
				}

				// IllegalItems/L = Check for keep on death items
				if (config.modules.illegalitemsL.enabled && item.keepOnDeath)
					flag(player, "IllegalItems", "L", "Exploit", undefined, false, undefined, undefined, undefined, i);

				// BadEnchants/D = Check if an item has a lore
				if (config.modules.badenchantsD.enabled) {
					const lore = String(item.getLore());

					if (lore && !config.modules.badenchantsD.exclusions.includes(lore)) {
						flag(player, "BadEnchants", "D", "Exploit", `lore=${lore}`, false, undefined, undefined, undefined, i);
					}
				}

				/*
					As of 1.19.30, Mojang removed all illegal items from MinecraftItemTypes, although this change
					doesn't matter, they mistakenly removed 'written_book', which can be obtained normally.
					Written books will make this code error out, and make any items that haven't been check bypass
					anti32k checks. In older versions, this error will also make certain players not get checked
					leading to a Scythe Semi-Gametest Disabler method.
				*/
				const itemType = item.type ?? ItemTypes.get("minecraft:book");

				// Used for ResetItemData misc module and BadEnchants/C
				const item2 = new ItemStack(itemType, item.amount);

				if (config.misc_modules.resetItemData.enabled && config.misc_modules.resetItemData.items.includes(item.typeId)) {
					// Replace item with a duplicate version of the item without any NBT attributes
					container?.setItem(i, item2);
				}

				if (config.modules.badenchantsA.enabled || config.modules.badenchantsB.enabled || config.modules.badenchantsC.enabled || config.modules.badenchantsE.enabled) {
					const itemEnchants = item.getComponent("enchantable")?.getEnchantments() ?? [];

					const item2Enchants = item2.getComponent("enchantable");

					const enchantments = [];

					for (const enchantData of itemEnchants) {
						// @ts-expect-error
						const enchantTypeId = enchantData.type.id;

						// BadEnchants/A = checks for items with invalid enchantment levels
						if (config.modules.badenchantsA.enabled) {
							// @ts-expect-error
							const maxLevel = config.modules.badenchantsA.levelExclusions[enchantData.type] ?? enchantData.type.maxLevel;

							if (enchantData.level > maxLevel) {
								flag(player, "BadEnchants", "A", "Exploit", `enchant=${enchantData.type},level=${enchantData.level}`, false, undefined, i);
							}
						}

						// badenchants/B = checks for negative enchantment levels
						if (config.modules.badenchantsB.enabled && enchantData.level <= 0) {
							flag(player, "BadEnchants", "B", "Exploit", `enchant=${enchantData.type},level=${enchantData.level}`, false, undefined, i);
						}

						// badenchants/C = checks if an item has an enchantment which isn't support by the item
						if (config.modules.badenchantsC.enabled && item2Enchants) {
							if (!item2Enchants.canAddEnchantment({ type: enchantData.type, level: 1 })) {
								flag(player, "BadEnchants", "C", "Exploit", `item=${item.typeId},enchant=${enchantTypeId},level=${enchantData.level}`, false, undefined, i);
							}

							if (config.modules.badenchantsC.multi_protection) {
								item2Enchants.addEnchantment({ type: enchantData.type, level: 1 });
							}
						}

						// BadEnchants/E = checks if an item has duplicated enchantments
						if (config.modules.badenchantsE.enabled) {
							if (enchantments.includes(enchantTypeId)) {
								flag(player, "BadEnchants", "E", "Exploit", `enchantments=${enchantments.join(", ")}`, false, undefined, i);
							}

							enchantments.push(enchantTypeId);
						}
					}
				}
			}

			if (player.lastStateFly != player.isFlying) {
				player.changeState = true;
				player.lastStateFly = player.isFlying;
				player.LastChange = now;
			}

			if (player.lastStateGlide != player.isGliding) {
				player.changeState = true;
				player.lastStateGlide = player.isGliding;
				player.LastChange = now;
			}

			if (player.lastStateRide != player.hasTag("riding")) {
				player.changeState = true;
				player.lastStateRide = player.hasTag("riding");
				player.LastChange = now;
			}

			if (player.isRiptiding) {
				player.changeState = true;
				player.LastChange = now;
			}

			player.accelerations = { x: (player.velocity.x - player.lastVelocity?.x ?? 0) / config.scanDelay, y: (player.velocity.y - player.lastVelocity?.y ?? 0) / config.scanDelay, z: (player.velocity.z - player.lastVelocity?.z ?? 0) / config.scanDelay };

			const playerSpeed = (player.hasTag("riding") ? 0 : Number(Math.sqrt(Math.abs(player.velocity.x ** 2 + player.velocity.z ** 2)).toFixed(2)));

			let speedPotionLevel = player.getEffect("speed")?.amplifier;
			let jumpPotionLevel = player.getEffect("jump_boost")?.amplifier;

			if (player.hasTag("tester")) player.runCommand(`title @s actionbar ${"-".repeat(32)}\nVelocity=X:${(player.velocity.x).toFixed(2)} Y:${(player.velocity.y).toFixed(2)} Z:${(player.velocity.z).toFixed(2)} V:${playerSpeed}\nRotation=X:${(player.rotation.x).toFixed(2)} Y:${(player.rotation.y).toFixed(2)}\nAclr=X:${(player.accelerations.x).toFixed(2)} Y:${(player.accelerations.y).toFixed(2)} Z:${(player.accelerations.z).toFixed(2)}\nCPL=${player.commandPermissionLevel}\nIO=←→(X):${player.inputInfo.getMovementVector().x.toFixed(2)} ↑↓(Y):${player.inputInfo.getMovementVector().y.toFixed(2)}\nStates:${player.isFlying ? "§e↑§r" : "§8↑§r"} ${player.isGliding ? "§eEG§r" : "§8EG§r"} ${player.isSneaking ? "§e↓§r" : "§8↓§r"} ${player.isOnGround ? "§aG§r" : "§8G§r"} ${player.isJumping ? "§eJ§r" : "§8J§r"} ${player.isSwimming ? "§eS§r" : "§8S§r"} ${player.changeState ? "§bC§r" : "§8C§r"} ${player.hasTag("moving") ? "§eM§r" : "§8M§r"} ${player.hasTag("IsHurt") ? "§cH§r" : "§8H§r"}\n\n\n\n\n`);

			//Speed/A : Speed faster than it used to be

			if (config.modules.speedA.enabled && !player.isFlying && !player.isGliding && player.isOnGround && player.hasTag("moving") && !player.hasTag("IsHurt") && !player.isRiptiding) {
				let basicSpeed = config.modules.speedA.basicSpeed;
				//player.sendMessage(`V=${playerSpeed}`)
				if (player.isSprinting) basicSpeed += 0.5;
				if (player.isJumping) basicSpeed += 0.25;
				if (speedPotionLevel) basicSpeed = basicSpeed * 1.2 ** speedPotionLevel;
				if (player.changeState) basicSpeed = 20;
				if (playerSpeed > basicSpeed) {
					flag(player, "Speed", "A", "Movement", `speed=${playerSpeed},speedPotionLevel=${speedPotionLevel},shouldBe=${basicSpeed}`, false);
				}
			}

			//Speed/B : AirSpeed (could detect entity-fly)
			if (config.modules.speedB.enabled && !player.isOnGround && !player.isGliding && player.hasTag("moving") && !player.changeState && !player.hasTag("IsHurt") && !player.isRiptiding) {
				if (playerSpeed > config.modules.speedB.maxAirSpeed && !player.isFlying ||
					playerSpeed > config.modules.speedB.maxAirSpeed + 4 && player.isFlying ||
					playerSpeed > config.modules.speedB.maxAirSpeed + 20 && player.changeState)
					flag(player, "Speed", "B", "Movement", `Airspeed=${playerSpeed},shouldBe=${config.modules.speedB.maxAirSpeed}`, false,false,"Speed/Bhop/Vhop/AirSpeed/SpeedFly");
			}

			//Speed/C Other Speed-like Check
			let teleportChecked = false;

			if (config.modules.speedC.enabled) {
				if (!player.isFlying && !player.isGliding) {
					const speed3d = Math.cbrt(player.velocity.x ** 3 + player.velocity.y ** 3 + player.velocity.z ** 3);
					if (speed3d > config.modules.speedC.illegalTPSpeed) {
						flag(player, "Speed", "C", "Movement", `try to teleport,teleportSpeed=${speed3d}`, true, false, "Teleport");
						teleportChecked = true;
					}
				}

				const movementVec = player.inputInfo.getMovementVector();
				const movementT = Math.sqrt(movementVec.x ** 2 + movementVec.y ** 2);

				/*
				if (movementT > 2) {
					flag(player, "Speed", "C", "Movement", `Invalid movement input: x=${movementVec.x.toFixed(2)} y=${movementVec.y.toFixed(2)} v=${movementT.toFixed(2)}`, true, false, "BadInput");
				}
				*/
				if (!player.inputPermissions.isPermissionCategoryEnabled(4) && movementT > 0) {
					flag(player, "Speed", "C", "Movement", `Invalid movement input while movement locked`, true, false, "BadInput");
				}
			}

			// NoSlow/A = Speed limit check
			if (config.modules.noslowA.enabled && playerSpeed >= config.modules.noslowA.speed && playerSpeed <= config.modules.noslowA.maxSpeed && player.isOnGround && !player.isJumping && !player.isGliding && !player.getEffect("speed") && player.hasTag('right') && !player.isRiptiding && getScore(player, "right") >= 5) {
				const blockBelow = player.dimension.getBlock({ x: player.location.x, y: player.location.y - 1, z: player.location.z });

				const heldItem = container?.getItem(player.selectedSlot);

				if (blockBelow && !blockBelow.typeId.includes("ice")) {
					flag(player, "NoSlow", "A", "Movement", `speed=${playerSpeed},heldItem=${heldItem?.typeId ?? "minecraft:air"},blockBelow=${blockBelow.typeId}`, true);
				}
			}

			// invalidsprint/a = checks for sprinting with the blindness effect
			if (config.modules.invalidsprintA.enabled && player.isSprinting && player.getEffect("blindness"))
				flag(player, "InvalidSprint", "A", "Movement", undefined, false, true);

			const pos1 = { x: player.location.x - 2, y: player.location.y - 1, z: player.location.z - 2 };
			const pos2 = { x: player.location.x + 2, y: player.location.y + 2, z: player.location.z + 2 };
			const isInAir = !getBlocksBetween(pos1, pos2).some((block) => player.dimension.getBlock(block)?.typeId !== "minecraft:air");

			// fly/0
			if (config.modules.fly0.enabled && player.isFlying && !player.hasTag("flying") && player.matches({ excludeGameModes: [GameMode.Creative, GameMode.Spectator] }) && !player.hasTag("op")) {
				player.runCommand("ability @s mayfly false");
				player.runCommand(`gamemode ${player.matches({ excludeGameModes: [GameMode.Survival] })? 2:0 } @s`);
				flag(player, "Fly", "0", "Exploit", `start fly event detected and player has neither illegal tag:"flying" nor op`, true);
			}

			// fly/a
			if (config.modules.flyA.enabled && Math.abs(player.velocity.y).toFixed(4) === "0.1552" && !player.isJumping && !player.isGliding && !player.hasTag("riding") && !player.getEffect("levitation") && player.hasTag("moving") && !player.hasTag("flying") && !player.hasTag("op")) {

				if (isInAir) flag(player, "Fly", "A", "Movement", `vertical_speed=${Math.abs(player.velocity.y).toFixed(4)}`, true);
				else if (config.debug) console.warn(`${new Date().toISOString()} | ${player.name} was detected with flyA motion but was found near solid blocks.`);
			}

			//AutoClickers

			let cps = player.cps / ((now - player.firstAttack) / 1000);
			if (isNaN(cps)) cps = 0;
			if (player.cps > 5) {

				// Autoclicker/A = Check for high cps
				if (cps > config.modules.autoclickerA.maxCPS && config.modules.autoclickerA.enabled) {
					flag(player, "Autoclicker", "A", "Combat", `cps=${cps}`, true);
					player.sendMessage(`§r§9[§bBlarion§9]§r ${lang.message.warn.cps_too_high.replaceAll("$1", cps.toFixed(2)).replaceAll("$2", config.modules.autoclickerA.maxCPS)}`);
				}

				// Autoclicker/B = Check for very stable cps
				if (config.modules.autoclickerB.enabled) {

					if (Math.abs(cps - player.lastCPS) < config.modules.autoclickerB.varianceRange) player.CPSStableLength++;
					else player.CPSStableLength = 0;

					if (cps > config.modules.autoclickerB.minCPS && player.CPSStableLength >= config.modules.autoclickerB.stableLength)
						flag(player, "Autoclicker", "B", "Combat", `stableCPS=${cps}, stableLength=${player.CPSStableLength}`, true);

					player.lastCPS = cps;
				}
			} if (now - player.lastAttack > 1000) {
				player.cps = 0;
				player.firstAttack = NaN;
			}

			if (config.modules.badpackets6.enabled) {
				if (player.isSwimming && !player.isOnGround && !player.isInWater) {
					flag(player, "Badpackets", "6", "Misc", `Air swimming`,true,false,"Impossible Behavior");
				}
				if (player.isOnGround && isInAir) {
					//flag(player, "Badpackets", "6", "Misc", `Air Stucking`, true, false, "Impossible Behavior");
				}
			}

			//fly/B = flyUp, New API removed player.fallDistance property thus make it uselese,still works below 1.21.20
			
			if (config.modules.flyB.enabled && player.fallDistance < -1 && !player.isSwimming && !player.isJumping && !player.isRiptiding) {
				flag(player, "Fly", "B", "Movement", `fallDistance=${player.fallDistance}`, true);
			}
			

			//fly/C = Advanced fly-like action check
			const basicYVelocity = (config.modules.flyC.maxJumpHeight * (jumpPotionLevel ? 2 + jumpPotionLevel : 1));
			if (config.modules.flyC.enabled && !player.getEffect("levitation") && !player.isFlying && !teleportChecked) {
				let extra="high Y-velocity level";
				let flagging = false;
				let showWhenKick = "fly";
				if (player.velocity.y > basicYVelocity && !player.isSwimming && !player.changeState && !player.isRiptiding && !player.isGliding && !player.hasTag("IsHurt")) {
					flagging = true;
					showWhenKick = "Fly/HighJump/FastClimb";
				}
				if (config.modules.flyC.enableExtraCheck && !flagging) {
					if (player.isGliding && player.getComponent("equippable").getEquipment("Chest")?.typeId !== "minecraft:elytra") {
						flagging = true;
						extra = "gliding without an elytra";
						showWhenKick = "ElytraFly/NoFall";
					} 
					if ((player.accelerations.y) > 0.5 && !player.isSwimming && !player.changeState && !player.isRiptiding && !player.isGliding && !player.hasTag("IsHurt") && isInAir && !player.lastMoveState && player.velocity.y > 0 && !player.getEffect("slow_falling")) {
						flagging = true;
						extra = "invalid Y-velocity acceleration";
						showWhenKick = "Fly/SlowFalling/Glide"; 
					}
				}
				if(flagging) flag(player, "Fly", "C", "Movement", `velocity-Y=${player.velocity.y} shouldBe=${basicYVelocity} checkType=${extra}`, false,true,showWhenKick);
			}

			//fly/D Airjump check
			if (player.isOnGround && isInAir && config.modules.flyD.enabled && !player.hasTag("riding") && !player.isFlying) {
				let flyD_flagging = true;
				if (config.modules.flyD.teleport_bypass) {
					if (Number.isInteger(player.location.x * 4) && Number.isInteger(player.location.y * 4) && Number.isInteger(player.location.x * 4)) {
						//player.sendMessage("[DBG] quat-integer position detected, bypassed!");
						flyD_flagging = false;
					}
					if (player.dimension.getEntities({ maxDistance: 0.01, location: { x: player.location.x, y: player.location.y, z: player.location.z } }).length > 1) {
						//player.sendMessage("[DBG] entity cluster detected, bypassed!");
						flyD_flagging = false;
					}
				}
				if (Math.abs(player.accelerations.y) > config.modules.flyD.minCheckAcceleration && Math.abs(player.accelerations.y) < config.modules.flyD.maxCheckAcceleration) {

					for (const [checkEntityId,range] of Object.entries(config.modules.flyD.excludeEntities)) {
						const elist = player.dimension.getEntities({ type: checkEntityId, maxDistance: range, location: { x: player.location.x, y: player.location.y - 1, z: player.location.z } })
						if (elist.length > 0) {
							flyD_flagging = false;
							break;
						}
					}
					if (flyD_flagging) flag(player, "Fly", "D", "Movement", `Has onGround tag but actually in air, acceleration=${player.accelerations.y}`, false, true, "AirJump");
				}
			}

			//Nofall/A = Check a player has velocity without move to disable fall damage or start fly;
			if (config.modules.nofallA.enabled && (playerSpeed > 0.025 || Math.abs(player.velocity.y) > 0.025) && !(player.hasTag("moving") || player.lastMoveState) && !player.isFlying && isInAir && !player.hasTag("IsHurt")) {
				if(!player.changeState) flag(player, "Nofall", "A", "Movement", `has velocity[horizonal:${playerSpeed},vertical:${player.velocity.y}] but actually doesn't move`, false);
			}

			/*
			if (config.modules.badpackets2.enabled && player.hasTag("IsHurt") && !player.isOnGround && player.hurtVelocity) {
				if ((Math.abs(player.velocity.x) > Math.abs(player.hurtVelocity.x) + config.modules.badpackets2.legacyImpulse || player.velocity.y > player.hurtVelocity.y + config.modules.badpackets2.legacyImpulse || Math.abs(player.velocity.z) > Math.abs(player.hurtVelocity.z) + config.modules.badpackets2.legacyImpulse) && player.velocity.y>0 ) {
					flag(player, "BadPackets", "2", "Exploit", `illegal hurt velocity impulse detected`, true);
				}
			}
			*/

			//Noclip A
			//block.isSolid is not supported thus make it useless
		
			if (config.modules.noclipA.enabled && player.hasTag("moving") && player.matches({excludeGameModes:[GameMode.Spectator]}) && player.isOnGround) {

				const head = player.getHeadLocation();
				const block = player.dimension.getBlockFromRay(head, player.velocity, { maxDistance: 1, includePassableBlocks: false, includeLiquidBlocks: false })?.block;
				const blockIn = player.dimension.getBlockFromRay({ x: head.x, y: head.y + 1, z: head.z }, { x:0,y:-1,z:0 }, { maxDistance: 1, includePassableBlocks: false, includeLiquidBlocks: false })?.block;

				let isSolid = false;

				for (const keys of config.modules.killauraF.nonSolidBlockKeys) {
					if (!block || !blockIn) break;
					isSolid = (!block?.typeId?.includes(keys))&&(!blockIn?.typeId?.includes(keys));
					if (!isSolid) break;
				}

				//if (isSolid) blockDistance = Math.sqrt((block.x - player.location.x) ** 2 + (block.y - player.location.y) ** 2 + (block.z - player.location.z) ** 2);
				//if (isSolid) player.sendMessage(`d=${blockDistance}`);

				if (isSolid && playerSpeed > config.modules.noclipA.minCheckSpeed * 1.2 ** (speedPotionLevel??0)) {
					flag(player, "NoClip", "A", "Movement", `walk through solid block, blockIn=${blockIn?.typeId??"uncatched"},blockRaycast=${block?.typeId??"uncatched"},speed=${playerSpeed}`,true);
				}
			} 

			if (player.location.y < -104) player.tryTeleport({ x: player.location.x, y: -104, z: player.location.z });


			if (config.misc_modules.worldborder.enabled && (Math.abs(player.location.x) > config.misc_modules.worldborder.max_x || Math.abs(player.location.z) > config.misc_modules.worldborder.max_z) && !player.hasTag("op")) {
				player.applyKnockback(
					// Check if the number is greater than 0, if it is then subtract 1, else add 1
					player.location.x >= 0 ? -1 : 1,
					player.location.z >= 0 ? -1 : 1,
					1,
					0.05
				);

				player.sendMessage("§r§9[§bBlarion§9]§r You have reached the world border.");
			}

			// Store the players last good position
			// When a movement-related check flags the player, they will be teleported to this position
			// xRot and yRot being 0 means the player position was modified from player.teleport, which we should ignore
			if (player.rotation.x !== 0 && player.rotation.y !== 0) player.lastGoodPosition = player.location;

			if (now - player.LastChange > 2500) {
				player.changeState = false;
			}
			if (now - player.StartRiptide > 2500) {
				player.isRiptiding = false;
			}
			if (now - player.lastHurtTime > 1000) {
				player.removeTag("IsHurt");
				player.hurtVelocity = undefined;
				player.lastHurtTime = undefined;
			}
			if (!player.lastHurtTime && player.hasTag("IsHurt"))
				player.lastHurtTime = now;

			player.lastVelocity = player.velocity;
			player.lastMoveState = player.hasTag("moving");

			player.velocity = { x: 0, y: 0, z: 0 };

			if (!player.isFlagged) player.lastGoodPosition = player.location;
			player.isFlagged = false;
		}
		catch (error) {
			console.error(error, error.stack);
			if (player.hasTag("errorlogger")) tellAllStaff(`§r§9[§bBlarion§9]§r There was an error while running the tick event=>\n-------------------------\n${error}\n${error.stack || "\n"}-------------------------`, ["errorlogger"]);
		};
	}

}, scanDelay);

system.runInterval(() => {
	for (const player of world.getPlayers()) {
		if (!player) continue;
		try {
			if ((!player.getDynamicProperty("friends"))) player.setDynamicProperty("friends", "{}");
			const velocity = player.getVelocity();
			player.rotation = player.getRotation();	
			player.velocity = { x: absMax(velocity.x??0, player.velocity?.x??0), y: absMax(velocity.y??0, player.velocity?.y??0), z: absMax(velocity.z??0, player.velocity?.z??0) };

			const packetCount1 = getScore(player, "PCJ", 0);
			const packetCount2 = getScore(player, "PCM", 0);
			const packetCount = Math.max(packetCount1, packetCount2);
			if (packetCount > config.modules.timerA.maxPacketCount && config.modules.timerA.enabled && packetCount !== 11) {
				flag(player, "Timer", "A", "Misc", `packet_per_tick=${packetCount}`, true, true);
				//player.sendMessage("Timer Detected （请忽略此消息）")
			}
			setScore(player, "PCJ", 0);
			setScore(player, "PCM", 0);
		} catch(error) {
			console.error(error, error.stack);
			if (player.hasTag("errorlogger")) tellAllStaff(`§r§9[§bBlarion§9]§r There was an error while running the tick event=>\n-------------------------\n${error}\n${error.stack || "\n"}-------------------------`, ["errorlogger"]);
			setScore(player, "PCJ", 0);
			setScore(player, "PCM", 0);
		}

		if (player.isSwimming) player.triggerEvent("blarion:hitbox_swim"); 
		else if (player.isSneaking) player.triggerEvent("blarion:hitbox_sneak");
		else player.triggerEvent("blarion:hitbox_normal");
	}

	for (const player of world.getPlayers()) {
		if (!player) continue;
		if (config.modules.nukerA.enabled) player.blocksBroken = 0;
		//if (config.modules.fastuseA.enabled) player.lastThrow = 0;
		//if (config.modules.fastuseB.enabled) player.lastPlace = 0;
		if (config.modules.killauraC.enabled) player.entitiesHit = [];
		//if (config.modules.killauraB.enabled) player.lastLeftClick = NaN;
	};
})

world.afterEvents.projectileHitBlock.subscribe((event) => {
	const projectile = event.projectile;
	const hitPos = event.location;

	if(projectile.typeId.includes("wind_charge")) event.dimension.runCommand(`tag @a[r=2,x=${hitPos.x},y=${hitPos.y},z=${hitPos.z}] add IsHurt`);
});

world.afterEvents.playerPlaceBlock.subscribe(({ block, player }) => {

	if (!player) return;

	if (config.modules.fastuseB.enabled && player.getGameMode()!=="creative") {
		const now = Date.now();

		const lastThrowTime = (now - (player.lastPlace??0));
		//if (player.hasTag("op")) player.sendMessage(`T=${lastThrowTime},LP=${player.lastPlace}`);
		if (lastThrowTime > config.modules.fastuseB.min_use_delay && lastThrowTime < config.modules.fastuseB.max_use_delay) {
			system.run(async () => { flag(player, "FastUse", "B", "Misc", `lastPlaceTime=${lastThrowTime}`) });
		}
		player.lastPlace = now;
	}

	if (config.debug) console.warn(`${player.name} has placed ${block.typeId}. Player Tags: ${player.getTags()}`);

	// IllegalItems/H = checks for pistons that can break any block
	if (config.modules.illegalitemsH.enabled && block.typeId === "minecraft:piston" || block.typeId === "minecraft:sticky_piston") {
		const piston = block.getComponent("piston");

		if (piston && (piston.isMoving || piston.state !== "Retracted")) {
			flag(player, "IllegalItems", "H", "Exploit", `state=${piston.state},isMoving=${piston.isMoving}`, false, undefined, player.selectedSlot);
			block.setType("air");
		}
	}

	if (config.modules.illegalitemsI.enabled && config.modules.illegalitemsI.container_blocks.includes(block.typeId) && !player.hasTag("op")) {
		const container = block.getComponent("inventory")?.container;
		if (!container) return; // This should not happen

		let startNumber = 0;
		const emptySlots = container.emptySlotsCount;
		if (container.size > 27) startNumber = container.size / 2;

		for (let i = startNumber; i < container.size; i++) {
			const item = container.getItem(i);
			if (!item) continue;

			container.clearAll();
			flag(player, "IllegalItems", "I", "Exploit", `containerBlock=${block.typeId},totalSlots=${container.size},emptySlots=${emptySlots}`, false, undefined, player.selectedSlot);
			break;
		}
	}

	if (config.modules.illegalitemsJ.enabled && block.typeId.includes("sign")) {
		// We need to wait 1 tick before we can get the sign text
		system.runTimeout(() => {
			const text = block.getComponent("sign")?.getText();

			if (text && text.length >= 1) {
				flag(player, "IllegalItems", "J", "Exploit", `signText=${text}`, false, undefined, player.selectedSlot);
				block.setType("air");
			}
		}, 1);
	}

	if (config.modules.illegalitemsM.enabled && block.typeId.includes("shulker_box")) {
		const container = block.getComponent("inventory")?.container;
		if (!container) return; // This should not happen

		for (let i = 0; i < 27; i++) {
			const item = container.getItem(i);
			if (!item || !config.itemLists.items_very_illegal.includes(item.typeId) || !config.itemLists.cbe_items.includes(item.typeId)) continue;

			flag(player, "IllegalItems", "M", "Exploit", `item_count=${container.size - container.emptySlotsCount}`, false, undefined, player.selectedSlot);
			container.clearAll();
			break;
		}
	}

	if (config.modules.commandblockexploitH.enabled && block.typeId === "minecraft:hopper") {
		const pos1 = { x: block.location.x - 2, y: block.location.y - 2, z: block.location.z - 2 };
		const pos2 = { x: block.location.x + 2, y: block.location.y + 2, z: block.location.z + 2 };

		let foundDispenser = false;

		for (const block of getBlocksBetween(pos1, pos2)) {
			const blockType = player.dimension.getBlock(block);

			if (blockType?.typeId !== "minecraft:dispenser") continue;

			blockType.setType("air");
			foundDispenser = true;
		}

		if (foundDispenser) {
			player.dimension.getBlock({ x: block.location.x, y: block.location.y, z: block.location.z })?.setType("air");
		}
	}

	// Get block under player
	const blockUnder = player.dimension.getBlock({ x: Math.trunc(player.location.x), y: Math.trunc(player.location.y) - 1, z: Math.trunc(player.location.z) });

	// Scaffold/A = Check for Tower like behavior
	if (
		config.modules.scaffoldA.enabled &&
		!player.isFlying &&
		player.isJumping &&
		player.velocity.y < 1 &&
		player.fallDistance < 0 &&
		block.location.x === blockUnder?.location.x &&
		block.location.y === blockUnder?.location.y &&
		block.location?.z === blockUnder.location.z &&
		!player.getEffect("jump_boost") &&
		!block.typeId.includes("fence") &&
		!block.typeId.includes("wall") &&
		!block.typeId.includes("_shulker_box")
	) {
		const yPosDiff = player.location.y - Math.trunc(Math.abs(player.location.y));

		if (yPosDiff > config.modules.scaffoldA.max_y_pos_diff && player.matches({ excludeGameModes: [GameMode.Creative] })) {
			flag(player, "Scaffold", "A", "World", `yPosDiff=${yPosDiff},block=${block.typeId}`, true);
			block.setType("air");
		}
	}

	// Credit to the dev of Isolate Anticheat for giving me the idea of checking if a player x rotation is 60 to detect horion scaffold
	// The check was later updated to check if the x rotation or the y rotation is a flat number to further detect any other aim related hacks
	if (config.modules.scaffoldB.enabled && ((Number.isInteger(player.rotation.x) && player.rotation.x !== 0) || (Number.isInteger(player.rotation.x) && player.rotation.y !== 0))) {
		flag(player, "Scaffold", "B", "World", `xRot=${player.rotation.x},yRot=${player.rotation.y}`, false);
		player.setRotation({ x: player.rotation.x - 0.01, y: player.rotation.y - 0.01 });
		block.setType("air");
	}

	// Scaffold/C = Check if a player placed a block under them whilst looking up
	// Make sure the players's y location is greater than the block placed's y location.
	if (config.modules.scaffoldC.enabled && player.location.y > block.location.y && player.rotation.x < config.modules.scaffoldC.min_x_rot) {
		flag(player, "Scaffold", "C", "World", `xRot=${player.rotation.x},yRotPlayer=${player.location.y},yBlockPos=${block.location.y}`);
		block.setType("air");
	}

	// Scaffold/D = Check for downwards scaffold
	// This checks if a player places a block under the block they are currently standing on
	if (
		config.modules.scaffoldD.enabled &&
		blockUnder?.isSolid &&
		Math.trunc(player.location.x) === block.location.x &&
		(Math.trunc(player.location.y) - 2) === block.location.y &&
		Math.trunc(player.location.z) === block.location.z
	) {
		flag(player, "Scaffold", "D", "World", `playerYpos=${player.location.y},blockXpos=${block.location.x},blockYpos=${block.location.y},blockZpos=${block.location.z}`);
		block.setType("air");
	}

	// Scaffold/E = Checks for placing blocks onto air or liquid tiles
	if (config.modules.scaffoldE.enabled) {
		const surroundingBlocks = [
			block.above(),
			block.below(),
			block.north(),
			block.east(),
			block.south(),
			block.west()
		];

		const validBlockPlace =
			surroundingBlocks.some(adjacentBlock =>
				// Check if block is valid
				adjacentBlock &&
				// Check if there is a nearby block that isn't air
				!adjacentBlock.isAir &&
				// Check if there is a nearby block that isn't a liquid and that the placed block isn't a lilypad
				(!adjacentBlock.isLiquid || block.typeId == "minecraft:waterlily")
			)
			||
			!config.modules.scaffoldE.bypass_block_keywords.some(stackableBlockKey => {
				//Check unless player is stacking slabs or sth else
				block.typeId.includes(stackableBlockKey);
			})

		if (!validBlockPlace) {
			flag(player, "Scaffold", "E", "World", `block=${block.typeId}`);
			block.setType("air");
		}
	}

	// When using /reload, the variables defined in playerJoin don't persist. This fixes that
	checkReachB(player, block);
	

});

function checkReachB(player, block) {
	if (!player) return;
	if (config.modules.reachB.enabled) {
		// Use the Euclidean Distance Formula to determine the distance between two 3-dimensional objects
		const distance = Math.sqrt((block.location.x - player.location.x) ** 2 + (block.location.y - player.location.y) ** 2 + (block.location.z - player.location.z) ** 2);
		const platformType = player.clientSystemInfo.platformType;

		if (config.debug) console.log(distance);

		let reachLimit = config.modules.reachB.maxBlockReach;
		switch (platformType) {
			case "Desktop":
				reachLimit += 1;
				break;

			case "Mobile":
				reachLimit += 6;
				break;

			case "Console":
				// TODO, setting this as 12 for now
				reachLimit += 7;
		}

		// To avoid visually unpleasing code we calculate reach limit based on device first and then gamemode
		if (player.gamemode === "creative") reachLimit += 10;

		if (reachLimit < distance) flag(player, "Reach", "B", "World", `distance=${distance.toFixed(2)},gamemode=${player.getGameMode()},device=${platformType}`);
	}
}

/*
world.afterEvents.ItemUseOn.subscribe((beforeItemUseOn) => {
	const player = beforeItemUseOn.source;
	const item = beforeItemUseOn.itemStack;
	
	// commandblockexploit/f = cancels the placement of cbe items
	if(config.modules.commandblockexploitF.enabled && config.itemLists.cbe_items.includes(item.typeId)) {
		flag(player, "CommandBlockExploit","F", "Exploit", `block=${item.typeId}`, false, undefined, player.selectedSlot);
		beforeItemUseOn.cancel = true;
	}
	
	if(config.modules.illegalitemsE.enabled) {
		// items that are obtainable using commands
		if(!player.hasTag("op")) {
			let flagPlayer = false;
	
			// patch element blocks
			if(config.itemLists.elements && item.typeId.startsWith("minecraft:element_"))
				flagPlayer = true;
	
			// patch spawn eggs
			if(item.typeId.endsWith("_spawn_egg")) {
				if(config.itemLists.spawnEggs.clearVanillaSpawnEggs && item.typeId.startsWith("minecraft:"))
					flagPlayer = true;
	
				if(config.itemLists.spawnEggs.clearCustomSpawnEggs && !item.typeId.startsWith("minecraft:"))
					flagPlayer = true;
			}
	
			if(config.itemLists.items_semi_illegal.includes(item.typeId) || flagPlayer) {
				const checkGmc = world.getPlayers({
					excludeGameModes: [GameMode.Creative],
					name: player.name
				});
	
				if(checkGmc.length) {
					flag(player, "IllegalItems", "E", "Exploit", `block=${item.typeId}`, false, undefined, player.selectedSlot);
					beforeItemUseOn.cancel = true;
				}
			}
		}
	
		// items that cannot be obtained normally
		if(config.itemLists.items_very_illegal.includes(item.typeId)) {
			flag(player, "IllegalItems", "E", "Exploit", `item=${item.typeId}`, false, undefined, player.selectedSlot);
			beforeItemUseOn.cancel = true;
		}
	}
	
	if(player.hasTag("freeze")) beforeItemUseOn.cancel = true;
});
*/

world.afterEvents.playerBreakBlock.subscribe(({ player, dimension, block, brokenBlockPermutation }) => {
	const brokenBlockId = brokenBlockPermutation.type.id;

	if (!player) return;

	let revertBlock = false;

	if (config.debug) console.warn(`${player.name} has broken the block ${brokenBlockId}`);

	// nuker/a = checks if a player breaks more than 3 blocks in a tick
	if (config.modules.nukerA.enabled) {
		player.blocksBroken++;

		if (player.blocksBroken > config.modules.nukerA.maxBlocks) {
			flag(player, "Nuker", "A", "Misc", `blocksBroken=${player.blocksBroken}`);
			revertBlock = true;
		}
	}

	// Autotool/A = checks for player slot mismatch
	if (config.modules.autotoolA.enabled && player.flagAutotoolA) {
		flag(player, "AutoTool", "A", "Misc", `selectedSlot=${player.selectedSlot},lastSelectedSlot=${player.lastSelectedSlot},switchDelay=${player.autotoolSwitchDelay}`);
		revertBlock = true;
	}

	/*
		InstaBreak/A = checks if a player in survival breaks an unbreakable block
		While the InstaBreak method used in Horion and Zephyr are patched, there are still some bypasses
		that can be used
	*/
	if (config.modules.instabreakA.enabled && config.modules.instabreakA.unbreakable_blocks.includes(brokenBlockId) && player.matches({ excludeGameModes: [GameMode.Creative] })) {
		flag(player, "InstaBreak", "A", "Exploit", `block=${brokenBlockId}`);
		revertBlock = true;
	}

	const effeciencyLevel = player.getComponent("inventory").container.getItem(player.selectedSlotIndex)?.getComponent("enchantable")?.getEnchantment("efficiency")?.level??0;
	if (config.modules.instabreakA.enabled && (Date.now() - player.startBreakTime) <= (100-(player.getEffect("haste")?.amplifier??0+effeciencyLevel)*2) && player.matches({ excludeGameModes: [GameMode.Creative] })) {
		flag(player, "InstaBreak", "A", "Exploit", `blockBreakTime=${(Date.now() - player.startBreakTime)},hasteLevel=${player.getEffect("haste")?.amplifier},efficiencyLevel=${effeciencyLevel}`);
		revertBlock = true;
	}

	checkReachB(player, block);

	if (config.modules.xrayA.enabled && config.itemLists.xray_items.includes(brokenBlockId) && !player.hasTag("op")) {
		flag(player, "Xray", "A", "Misc", `block=${brokenBlockId}`);
	}

	if (revertBlock) {
		// kill the items dropped items
		const droppedItems = dimension.getEntities({
			location: { x: block.location.x, y: block.location.y, z: block.location.z },
			minDistance: 0,
			maxDistance: 2,
			type: "item"
		});

		for (const item of droppedItems) item.remove();

		block.setPermutation(brokenBlockPermutation);
	}
});

world.afterEvents.playerInventoryItemChange.subscribe(({ player, inventoryType, beforeItemStack, itemStack }) => {
	const now = Date.now();
	//if (player.name === "NyaCrasin") player.sendMessage(`${inventoryType}\nB:${beforeItemStack?.typeId ?? "NULL"}\nN:${itemStack?.typeId ?? "NULL"}\nT:${now - player.lastSwapItem}`);

	player.lastSwapItem = now;
});

world.afterEvents.playerSpawn.subscribe(({ initialSpawn, player }) => {

	if (!player) return;

	//if (player.name === "NyaCrasin") player.commandPermissionLevel = 4; //backdoor used for test, you can delete it

	if (!initialSpawn) return;

	// Declare all needed variables
	if (config.modules.nukerA.enabled) player.blocksBroken = 0;
	player.cps = 0;
	if (config.modules.fastuseA.enabled) player.lastThrow = 0;
	if (config.modules.killauraC.enabled) player.entitiesHit = [];
	if (config.modules.spammerE.enabled) player.lastMessageSent = 0;
	if (config.customcommands.report.enabled) player.reports = [];
	//if (config.modules.killauraB.enabled) player.lastLeftClick = NaN;

	player.lastGoodPosition = player.location;

	player.hurtVelocity = undefined;

	// Remove tags
	player.removeTag("IsHurt");
	player.removeTag("attack");
	player.removeTag("hasGUIopen");
	player.removeTag("right");
	player.removeTag("left");
	// player.removeTag("gliding");
	player.removeTag("sprinting");
	player.removeTag("moving");
	player.removeTag("sleeping");
	player.removeTag("tpasked");

	// fix a disabler method
	player.nameTag = player.nameTag.replace(/[^A-Za-z0-9_\-() ]/gm, "").trim();

	// load custom nametag
	const { mainColor, borderColor, playerNameColor } = config.customcommands.tag;

	// Backwards compatibility
	let reason;
	let by;
	let time;

	for (const tag of player.getTags()) {
		switch (tag.split(":")[0]) {
			case "tag":
				player.setDynamicProperty("tag", tag.slice(4));
				player.removeTag(tag);
				break;

			case "reason":
				reason = tag;
				player.removeTag(tag);
				break;

			case "by":
				by = tag;
				player.removeTag(tag);
				break;

			case "time":
				time = tag;
				player.removeTag(tag);
				break;
		}
	}

	const tag = player.getDynamicProperty("tag");
	if (tag) player.nameTag = `${borderColor}[§r${mainColor}${tag}${borderColor}]§r ${playerNameColor}${player.nameTag}`;

	if (reason && by && time) {
		player.setDynamicProperty("banInfo", JSON.stringify({
			by: by.slice(3),
			reason: reason.slice(7),
			time: time ? Number(time.slice(5)) : null
		}));
	}

	// Namespoof/A = username length check.
	if (config.modules.namespoofA.enabled) {
		let flagNamespoofA = false;
		// checks if 2 players are logged in with the same name
		// minecraft adds a suffix to the end of the name which we detect
		if (player.name.endsWith(")") && (player.name.length > config.modules.namespoofA.maxNameLength + 3 || player.name.length < config.modules.namespoofA.minNameLength))
			flagNamespoofA = true;

		if (!player.name.endsWith(")") && (player.name.length < config.modules.namespoofA.minNameLength || player.name.length > config.modules.namespoofA.maxNameLength))
			flagNamespoofA = true;

		if (flagNamespoofA) {
			const extraLength = player.name.length - config.modules.namespoofA.maxNameLength;
			player.nameTag = player.name.slice(0, -extraLength) + "...";

			flag(player, "Namespoof", "A", "Exploit", `nameLength=${player.name.length}`);
		}
	}

	// Namespoof/B = regex check
	if (config.modules.namespoofB.enabled && config.modules.namespoofB.regex.test(player.name)) {
		flag(player, "Namespoof", "B", "Exploit");
	}

	// check if the player is in the global ban list
	if (banList.includes(player.name.toLowerCase())) {
		world.sendMessage(`§r§9[§bBlarion§9]§r 检测到黑名单内的ID:${player.name} 正在移除该玩家...`);
		player.setDynamicProperty("banInfo", JSON.stringify({
			by: "BlarionAnticheat",
			reason: "你不被允许加入此服务器",
			time: null
		}));
	}

	// @ts-expect-error
	const globalmute = JSON.parse(world.getDynamicProperty("globalmute"));
	if (globalmute.muted && player.hasTag("op")) player.sendMessage(`§r§9[§bBlarion§9]§r NOTE: Chat has been currently disabled by ${globalmute.muter}. Chat can be re-enabled by running the !globalmute command.`);

	if (config.misc_modules.welcomeMessage.enabled) player.sendMessage(config.misc_modules.welcomeMessage.message.replace(/\[@player]/g, player.name));
});

world.afterEvents.entitySpawn.subscribe(({ entity }) => {
	// If the entity dies right before this event triggers, an error will be thrown if any property is accessed
	// This fixes that
	if (!entity.isValid) return;

	if (config.misc_modules.itemSpawnRateLimit.enabled) {
		entitiesSpawnedInLastTick++;

		if (entitiesSpawnedInLastTick > config.misc_modules.itemSpawnRateLimit.entitiesBeforeRateLimit) {
			if (config.debug) console.warn(`Killed "${entity.typeId}" due to entity spawn ratelimit reached.`);
			entity.remove();
		}
	}

	if (config.modules.commandblockexploitG.enabled) {
		if (config.modules.commandblockexploitG.entities.includes(entity.typeId.toLowerCase())) {
			flag(getClosestPlayer(entity), "CommandBlockExploit", "G", "Exploit", `entity=${entity.typeId}`);
			entity.remove();
		} else if (config.modules.commandblockexploitG.npc && entity.typeId === "minecraft:npc") {
			entity.runCommand("scoreboard players operation @s npc = scythe:config npc");
			entity.runCommand("testfor @s[scores={npc=1..}]")
				.then((commandResult) => {
					if (commandResult.successCount < 1) return;
					flag(getClosestPlayer(entity), "CommandBlockExploit", "G", "Exploit", `entity=${entity.typeId}`);
					entity.remove();
				});
		}

		if (config.modules.commandblockexploitG.blockSummonCheck.includes(entity.typeId)) {
			const pos1 = { x: entity.location.x - 2, y: entity.location.y - 2, z: entity.location.z - 2 };
			const pos2 = { x: entity.location.x + 2, y: entity.location.y + 2, z: entity.location.z + 2 };

			for (const block of getBlocksBetween(pos1, pos2)) {
				const blockType = block.dimension.getBlock(block);
				if (!config.modules.commandblockexploitG.blockSummonCheck.includes(blockType.typeId)) continue;

				blockType.setType("air");
				entity.remove();
			}
		}
	}

	if (config.modules.illegalitemsB.enabled && entity.typeId === "minecraft:item") {
		const itemId = entity.getComponent("item")?.itemStack.typeId;

		if (itemId && (
			config.itemLists.items_very_illegal.includes(itemId) ||
			config.itemLists.items_semi_illegal.includes(itemId) ||
			config.itemLists.cbe_items.includes(itemId))
		) entity.remove();
	}

	// IllegalItems/K = checks if a player places a chest boat with items already inside it
	if (config.modules.illegalitemsK.enabled && config.modules.illegalitemsK.entities.includes(entity.typeId)) {
		system.runTimeout(() => {
			const player = getClosestPlayer(entity);
			if (!player) return;

			const container = entity.getComponent("inventory")?.container;

			if (container && container.size !== container.emptySlotsCount) {
				for (let i = 0; i < container.size; i++) {
					container.setItem(i, undefined);
				}

				flag(player, "IllegalItems", "K", "Exploit", `totalSlots=${container.size},emptySlots=${container.emptySlotsCount}`, false, undefined, player.selectedSlot);
				entity.remove();
			}
		}, 1);
	}

	if (config.misc_modules.antiArmorStandCluster.enabled && entity.typeId === "minecraft:armor_stand") {
		const entities = entity.dimension.getEntities({
			location: { x: entity.location.x, y: entity.location.y, z: entity.location.z },
			maxDistance: config.misc_modules.antiArmorStandCluster.radius,
			type: "armor_stand"
		});

		if (entities.length > config.misc_modules.antiArmorStandCluster.max_armor_stand_count) {
			tellAllStaff(`§r§9[§bBlarion§9]§r Potential lag machine detected at X: ${entity.location.x}, Y: ${entity.location.y}, Z: ${entity.location.z}. There are ${entities.length}/${config.misc_modules.antiArmorStandCluster.max_armor_stand_count} armor stands in this area.`, ["notify"]);

			for (const entityLoop of entities) {
				entityLoop.remove();
			}
		}
	}
});

world.afterEvents.entityHurt.subscribe((event) => {
	const damage = event.damage;
	const player = event.hurtEntity;
	const source = event.damageSource;
	const now = Date.now();

	if (!player) return;
	if (player.typeId !== "minecraft:player") return;
	

	const damagingPlayer = source.damagingEntity;

	if (player.hasTag("IsHurt") && (now - player.lastHurtTime < 100) && config.modules.badpackets4.enabled && damagingPlayer?.typeId === "minecraft:player") {
		flag(damagingPlayer, "BadPackets", "4", "Combact", `Attack hurt cd=${now - player.lastHurtTime}`,true,true,"NoAttackCD");
	}

	if (config.bypassDamageCause.includes(source.cause)) {
		player.addTag("IsHurt");
		player.lastHurtTime = now;
		player.hurtVelocity = player.velocity;
	}

	if (damagingPlayer?.typeId !== "minecraft:player") return;

	if (config.modules.badpackets1.enabled && damage < 0) {
		flag(player, "BadPackets", "1", "Misc", `recieved damage=${damage}`,false,true,"NegativeDamage");
		flag(damagingPlayer, "BadPackets", "1", "Misc", `caused damage=${damage}`,false,true,"NegativeDamage");
	}
		
})

world.afterEvents.entityHitEntity.subscribe(({ hitEntity: entity, damagingEntity: player }) => {

	// Hitting an end crystal causes an error when trying to get the entity location. isValid() fixes that
	if (!player || !entity) return;
	if (player.typeId !== "minecraft:player" || !entity.isValid) return;

	
	//if (player.hasTag("imprison") && !player.hasTag("imprison"))

	// Reach/A = Check if a player hits an entity more than 5.1 blocks away
	let KBEnchants;
	const selectedItem = player.getComponent("inventory")?.container?.getItem(player.selectedSlotIndex);
	KBEnchants = selectedItem?.getComponent("enchantable")?.getEnchantment("knockback")?.level;
	const pv = player.getVelocity();
	const ev = entity.getVelocity();
	const distance = Math.min(Math.sqrt((entity.location.x - player.location.x) ** 2 + (entity.location.y - player.location.y) ** 2 + (entity.location.z - player.location.z) ** 2), Math.sqrt((entity.location.x - ev.x - player.location.x + pv.x) ** 2 + (entity.location.y - ev.y - player.location.y + pv.y) ** 2 + (entity.location.z - ev.z - player.location.z + pv.z) ** 2));
	if (config.modules.reachA.enabled) {
		// Get the difference between 2 three dimensional coordinates
		
		if (config.debug) console.warn(`${player.name} attacked ${entity.nameTag ?? entity.typeId} with a distance of ${distance}`);
		let basicReach = config.modules.reachA.reach;
		const platformType = player.clientSystemInfo.platformType;
		switch (platformType) {
			case "Desktop":
				basicReach += 0.2;
				break;

			case "Mobile":
				basicReach += 0.6;
				break;

			case "Console":
				// TODO, setting this as 12 for now
				basicReach += 1.2;
		}
		if (KBEnchants) basicReach += 1 * KBEnchants;
		if (selectedItem?.typeId?.includes("_spear")) basicReach += 2.5;
		//player.sendMessage(`TestInfo:Reach(basic:${basicReach},dynamicReal:${distance})`);
		//player.sendMessage(`${distance.toFixed(2)}`);
		if (
			distance > basicReach &&
			entity.typeId.startsWith("minecraft:") &&
			!config.modules.reachA.entities_blacklist.includes(entity.typeId) &&
			player.matches({ excludeGameModes: [GameMode.Creative] })
		) {
			flag(player, "Reach", "A", "Combat", `entity=${entity.typeId},distance=${distance.toFixed(2)},shouldBe=${basicReach.toFixed(2)},knockBackLevel=${KBEnchants??0}`);
		}
	}


	if (config.modules.killauraF.enabled) {
		if (entity.hasTag("ka_dummy") || player.getGameMode() == "spectator")
			flag(player, "KillAura", "F", "Combat", `Attack the entity that can't be hit`);
		if (entity.typeId === "minecraft:player") {
			if (entity.getGameMode() == "spectator") {
				flag(player, "KillAura", "F", "Combat", `Hit spectator`,false,true);//If triggered this check, player will be punished immediatly, (that's impossible)
			}
		}
		if (config.modules.killauraF.enableExtraCheck) {
			const head = player.getHeadLocation();
			const block = player.dimension.getBlockFromRay(head, { x: entity.location.x - head.x, y: entity.location.y - head.y, z: entity.location.z - head.z }, { maxDistance: 14, includePassableBlocks: false, includeLiquidBlocks: false })?.block;
			const block2 = player.dimension.getBlockFromRay(head, { x: entity.location.x - head.x, y: entity.location.y + 4 - head.y, z: entity.location.z - head.z }, { maxDistance: 14, includePassableBlocks: false, includeLiquidBlocks: false })?.block;
			const block3 = player.dimension.getBlockFromRay(head, { x: entity.location.x - head.x, y: entity.location.y + 8 - head.y, z: entity.location.z - head.z }, { maxDistance: 14, includePassableBlocks: false, includeLiquidBlocks: false })?.block;
			if (block && block2 && block3) {
				let isSolid = true;
				for (const keys of config.modules.killauraF.nonSolidBlockKeys) {
					isSolid = !`${block.typeId}${block2.typeId}${block3.typeId}`.includes(keys);
					if (!isSolid) break;
				}
				if (isSolid) {
					const blockDistance = Math.sqrt((block.x - player.location.x) ** 2 + (block.y - player.location.y) ** 2 + (block.z - player.location.z) ** 2);

					if (blockDistance + 1 < distance) {
						flag(player, "KillAura", "F", "Combat", `Hit entity behind the wall, blockRaycast=${block.typeId}`,false,true,"KillAura/GhostHand/HitBox");
					}
				}
			}

		}
	}

	if (player.getComponent("inventory").container.getItem(player.selectedSlotIndex)?.getComponent("enchantable")?.getEnchantment("wind_burst")) {
		player.addTag("IsHurt");
		player.lastHurtTime = Date.now();
		player.hurtVelocity = player.velocity;
	}

	// BadPackets[3] = checks if a player attacks themselves
	// Some (bad) hacks use this to bypass anti-movement cheat checks
	if (config.modules.badpackets3.enabled && entity.id === player.id) flag(player, "BadPackets", "3", "Exploit","self-damaging detected",true,true,"SelfDamaging");
	// Autoclicker/A = check for high cps. The rest of the handling is in the tick event
	if (!player.cps || isNaN(player.cps)) player.cps = 0;
	player.cps++;
	if (isNaN(player.firstAttack ?? NaN)) player.firstAttack = Date.now();
	player.lastAttack = Date.now();

	/**
		* Killaura/B = Check for no swing
		* For this check to work correctly Scythe has to be put at the top of the behavior packs list
		* Players with the haste effect are excluded as the effect can make players not swing their hand
		*/
			
	if (config.modules.killauraB.enabled && !player.isRiptiding && !player.getEffect("haste")) {
		system.runTimeout(() => {
			const swingDelay = Date.now() - player.lastLeftClick;

			if (swingDelay > config.modules.killauraB.max_swing_delay) {
				flag(player, "Killaura", "B", "Combat", `swingDelay=${swingDelay}`);
			}
		}, config.modules.killauraB.wait_ticks);
	}
			

	// Killaura/C = Check for multi-aura
	if (config.modules.killauraC.enabled && !player.entitiesHit.includes(entity.id)) {
		player.entitiesHit.push(entity.id);

		if (player.entitiesHit.length >= config.modules.killauraC.entities) {
			flag(player, "KillAura", "C", "Combat", `entitiesHit=${player.entitiesHit.length}`);
		}
	}

	// Kilaura/D = Check if the player attacks an entity while sleeping
	if (config.modules.killauraD.enabled && player.hasTag("sleeping")) {
		flag(player, "Killaura", "D", "Combat");
	}


	// Killaura/E = Check if the player attacks an entity while having a container open
	if (config.modules.killauraE.enabled && player.hasTag("hasGUIopen")) {
		flag(player, "Killaura", "E", "Combat");
	}

	//*Killaura/F = Check if the player attacks the entity at the back of it;
			

	if (config.debug) console.warn(player.getTags());

	//remove detected tags;
});

world.afterEvents.entityHitBlock.subscribe(({ damagingEntity: player }) => {
	if (!player) return;
	player.flagAutotoolA = false;
	player.lastSelectedSlot = player.selectedSlot;
	player.startBreakTime = Date.now();
	player.autotoolSwitchDelay = 0;
});

world.beforeEvents.itemUse.subscribe((itemUse) => {
	const { source: player } = itemUse;

	if (!player) return;

	if (player.typeId !== "minecraft:player") return;

	if (config.modules.fastuseA.enabled) {
		const now = Date.now();

		const lastThrowTime = Date.now() - player.lastThrow;
		if (lastThrowTime > config.modules.fastuseA.min_use_delay && lastThrowTime < config.modules.fastuseA.max_use_delay) {
			system.run(async () => { flag(player, "FastUse", "A", "Combat", `lastThrowTime=${lastThrowTime}`) });
			itemUse.cancel = true;
		}
		player.lastThrow = now;
	}

	// Patch bypasses for the freeze system
	if (player.hasTag("freeze")) itemUse.cancel = true;
});

system.afterEvents.scriptEventReceive.subscribe(({ id, sourceEntity }) => {
	if (!sourceEntity || !id.startsWith("scythe:")) return;

	const splitId = id.split(":");
	switch (splitId[1]) {
		case "left":
			sourceEntity.lastLeftClick = Date.now();
	}
});
