import { world, system, ItemStack, CustomCommandParamType,GameMode } from "@minecraft/server";
import { ActionFormData, ModalFormData, MessageFormData, uiManager } from "@minecraft/server-ui"
import { transferPlayer, beforeEvents } from "@minecraft/server-admin";
import { flag,lang } from "./util.js";
import config from "config.js";

system.beforeEvents.startup.subscribe((startupOptions) => {
	startupOptions.customCommandRegistry.registerCommand(
		{
			name: "blarion:getinv",
			cheatsRequired: true,
			description: "get a player's inventory and spawn a two container blocks to storage item (CAUTION:Must use in open area, Or your buildings could be damaged)",
			permissionLevel: 1,
			mandatoryParameters: [
				{ name: "target", type: "PlayerSelector" }
			]
		},
		(origin,targetRaw) => {
			const caller = origin.sourceEntity;

			if (targetRaw.length > 1) return { status: 1, message: `§cToo many target expect 1 but receive ${targetRaw.length}` };
			else if (targetRaw.length < 1) return { status: 1, message: "§cCould not find that player" };

			const target = world.getEntity(targetRaw[0].id);

			system.run(() => {

				const opinv = caller.getComponent("inventory").container;

				caller.runCommand(`setblock ~ ~2 ~ barrel`);
				caller.runCommand(`setblock ~ ~3 ~ barrel`);

				const Inv = caller.dimension.getBlock({ x: caller.location.x, y: caller.location.y + 2, z: caller.location.z });
				const Equip = caller.dimension.getBlock({ x: caller.location.x, y: caller.location.y + 3, z: caller.location.z });

				Inv.nameTag = `§r§9${target.name}'s §eInventory§9 Copy Box§r`;
				Equip.nameTag = `§r§9${target.name}'s §eEquipment&Hotbar§9 Copy Box§r`;

				const InvContainer = Inv.getComponent("inventory").container;
				const EquipContainer = Equip.getComponent("inventory").container;

				const inventory = target.getComponent("inventory").container;
				for (let i = 0; i < 36; i++) {
					if (i < 9) {
						EquipContainer.setItem(i, inventory.getItem(i));
					}
					else {
						InvContainer.setItem(i-9, inventory.getItem(i));
					}
				}

				const equipment = target.getComponent("equippable");

				EquipContainer.setItem(9,equipment.getEquipment("Head"));
				EquipContainer.setItem(10,equipment.getEquipment("Chest"));
				EquipContainer.setItem(11,equipment.getEquipment("Legs"));
				EquipContainer.setItem(12,equipment.getEquipment("Feet"));
				EquipContainer.setItem(18,equipment.getEquipment("Offhand"));
			});

			return { status: 0, message: `§aLook Up! Successfully copy ${target.name}'s inventory as containers!` };
		}
	);

	startupOptions.customCommandRegistry.registerCommand(
		{
			name: "blarion:forcekick",
			cheatsRequired: true,
			description: "force remove a player including all data from world to prevent AntiKick Hacks",
			permissionLevel: 1,
			mandatoryParameters: [
				{ name: "target", type: "PlayerSelector" }
			]
		},
		(origin, targetRaw) => {
			const caller = origin.sourceEntity;

			if (targetRaw.length > 1) return { status: 0, message: `§cToo many target expect 1 but receive ${targetRaw.length}` };
			else if (targetRaw.length < 1) return { status: 0, message: "§cCould not find that player" };

			const target = world.getEntity(targetRaw[0].id);

			system.run(() => { target.triggerEvent("scythe:kick") });

			return { status: 0, message: `§eTried to kick ${target.name} ...` };
		}
	);

	startupOptions.customCommandRegistry.registerCommand(
		{
			name: "blarion:scan",
			cheatsRequired: true,
			description: "scan NBT cheaters",
			permissionLevel: 2,
			optionalParameters: [
				{ name: "target", type: "PlayerSelector" }
			]
		},
		(origin, targetRaw) => {
			const caller = origin.sourceEntity;

			if (targetRaw) {
				if (targetRaw.length > 1) return { status: 1, message: `§cToo many target expect 1 but receive ${targetRaw.length}` };
				else if (targetRaw.length < 1) return { status: 1, message: "§cCould not find that player" };

				const target = world.getEntity(targetRaw[0].id);
				system.run(async () => {
					scanPlayer(target);
				});
			} else {

				const players = world.getAllPlayers();

				world.sendMessage(`§e◆ §r§4[§cBlarion§4]§r ${caller.name} call the SCAN PROGERSS, Starting cheat scanning progress...`);

				for (let i = 0; i < players.length; i++) {
					const p = players[i];
					system.runTimeout(() => {
						scanPlayer(p);
					}, i * 5);
				}
			}
		}
	); 

	startupOptions.customCommandRegistry.registerEnum("blarion:main_options", [
		"help",
		"version",
		"credits"
	]);

	startupOptions.customCommandRegistry.registerCommand(
		{
			name: "blarion:blac",
			cheatsRequired: true,
			description: "Blarion Anticheat Main Command",
			permissionLevel: 0,
			mandatoryParameters: [
				{ name: "blarion:main_options", type: "Enum" }
			]
		},
		(origin, option) => {
			const caller = origin.sourceEntity;

			switch (option) {
				case "help":
					if (caller.commandPermissionLevel < 1) return;
					caller.sendMessage("§r§9[§bBlarion§9]§r Command List:");
					for (const [cmd, data] of Object.entries(commandList)) {
						caller.sendMessage(`§b◆ /${cmd} §7§o${data.description}`);
						caller.sendMessage(`  > usage: ${data.usage}`);
					}
					break;
				case "version":
					caller.sendMessage("§r§9[§bBlarion§9]§r Blarion is now version §b2.1.5 §bRelease (Github Published)");
					break;
				case "credits":
					caller.sendMessage("§r§9[§bBlarion§9]§r Credits:\nNyaCrasin | Main developer, Detection provider, hack principle cracker\nNexShell | Game cheat/hack packet data provider\nNotWater_145 | Hack client provider");
					break;

			}

			return { status: 0 };
		}
	);

	startupOptions.customCommandRegistry.registerEnum("blarion:modules", Object.keys(config.modules));

	startupOptions.customCommandRegistry.registerCommand(
		{
			name: "blarion:flag",
			cheatsRequired: true,
			description: "Raise a cheat flag through extra anticheat",
			permissionLevel: 2,
			mandatoryParameters: [
				{ name: "target", type: "PlayerSelector" },
				{ name: "blarion:modules", type: "Enum" }
			],
			optionalParameters: [
				{ name: "hackType", type: "String" },
				{ name: "debugData", type: "String" },
				{ name: "shouldTP", type: "Boolean" },
				{ name: "addTotalVL", type: "Boolean" },
				{ name: "checkTypeShowWhenKick", type: "String" }
			]
		},
		(origin, targetRaw, moduleName, hackType = "External",debugData, shouldTP,addTotalVL,showWhenKick) => {
			const caller = origin.sourceEntity;

			if (targetRaw.length > 1) return { status: 1, message: `§cToo many target expect 1 but receive ${targetRaw.length}` };
			else if (targetRaw.length < 1) return { status: 1, message: "§cCould not find that player" };

			const target = world.getEntity(targetRaw[0].id);

			system.run(() => {
				try {
					flag(target, moduleName.substr(0, moduleName.length - 1), moduleName.at(-1), hackType,debugData, shouldTP, addTotalVL, showWhenKick);
				} catch (error) {
					if (caller) caller.sendMessage(`§r§4[§cBlarion§4]§c ${error}`);
				}
			});

			return { status: 0 };
		}
	);
});

let commandList;

system.runTimeout(() => {
	commandList = {
		"blac": {
			description: lang.commands.description.blac,
			usage: "<help|version|credits>"
		},
		"getinv": {
			description: lang.commands.description.getinv,
			usage: "<player>"
		},
		"forcekick": {
			description: lang.commands.description.forcekick,
			usage: "<player>"
		},
		"scan": {
			description: lang.commands.description.scan,
			usage: "[player]"
		},
		"flag": {
			description: lang.commands.description.flag,
			usage: "<player> <module_name> [hack_type] [dbg] [should_drag_back] [add_total_violations]"
		}
	}
},1);
function scanPlayer(p) {
	let cheats = 0;
	const gamemode = p.getGameMode();
	world.sendMessage(`§e◆ §r§6[§eBlarion§6]§r Scanning ${p.name} ...`);

	if (gamemode !== GameMode.Creative && gamemode !== GameMode.Spectator) {
		try {
			let result = 0;
			result += p.runCommand("damage @s 1 entity_attack").successCount;
			result += p.runCommand("damage @s 1 projectile").successCount;
			result += p.runCommand("damage @s 1 fall").successCount;
			result += p.runCommand("damage @s 1 fire").successCount;
			result += p.runCommand("damage @s 1 void").successCount;
			if (result === 0) {
				world.sendMessage(`§c◆ §r§4[§cBlarion§4]§r Invulnerable detected`);
				cheats += 1;
			}
		} catch (error) {
			world.sendMessage(`§c◆ §r§4[§cBlarion§4]§r Scan throws error:${error}`);
			world.sendMessage(`§c◆ §r§4[§cBlarion§4]§r Invulnerable detected`);
			cheats += 1;
		}
	}

	if (gamemode !== GameMode.Creative) {
		try {
			let result = 0;
			result += p.runCommand("damage @s 1 self_destruct").successCount;
			result += p.runCommand("damage @s 1 void").successCount;
			if (result === 0) {
				world.sendMessage(`§c◆ §r§4[§cBlarion§4]§r Invulnerable detected`);
				cheats += 1;
			}
		} catch (error) {
			world.sendMessage(`§c◆ §r§4[§cBlarion§4]§r Scan throws error:${error}`);
			world.sendMessage(`§c◆ §r§4[§cBlarion§4]§r Invulnerable detected`);
			cheats += 1;
		}
	}

	if (p.name.length <= 3 || p.name.length >= 32 || /[^a-zA-Z0-9\s\-_]/.test(p.name)) {
		world.sendMessage(`§c◆ §r§4[§cBlarion§4]§r NameSpoof detected`);
		cheats += 1;
	}

	system.runTimeout(() => {
		if (cheats <= 0) {
			world.sendMessage(`§a◆ §r§2[§aBlarion§2]§r ${p.name} passed!`);
		} else {
			world.sendMessage(`§c◆ §r§4[§cBlarion§4]§r found ${cheats} cheat data of ${p.name}, force kicked!`);
			//p.runCommand(`forcekick "${p.name}"`);
		}
	}, 4);
}

if (config.force_op_blocker.enabled) {
	system.runTimeout(async () => {

		beforeEvents.asyncPlayerJoin.subscribe((event) => {
			console.warn(`[Blarion-Blocker] PlayerJoin Detected: \nName:${event.name} PID:${event.persistentId}`);
			if (event.persistentId.replaceAll(" ", "") == "") {
				console.warn(`[Blarion-Blocker] LoginRefused: ${event.name} PFID:${event.persistentId}`);
				if (config.force_op_blocker.send_global_alert) world.sendMessage(`§a◆ §r§2[§aBlarion§2]§r Blocked Connect Session: ${event.name}`);
				event.disconnect(`[Blarion] Connection Rejected: Unexpected client data`);
				return false;
			} else if (config.force_op_blocker.mode !== "lite" && (event.name.length <= 3 || event.name.length >= 32 || /[^a-zA-Z0-9\s\-_]/.test(event.name))) {
				console.warn(`[Blarion-Blocker] LoginRefused: ${event.name} PFID:${event.persistentId}`);
				if (config.force_op_blocker.send_global_alert) world.sendMessage(`§a◆ §r§2[§aBlarion§2]§r Blocked Connect Session: ${event.name}`);
				event.disconnect(`[Blarion] Connection Rejected: Unexpected client data`);
				return false;
			} else {
				event.allowJoin();
				return true;
			}
		});

		world.sendMessage(`§a◆ §r§2[§aBlarion§2]§r ${lang.message.global.block_system_loaded}`)
	}, 200)
}

system.runInterval(() => {
	world.getDimension("overworld").runCommand(`scoreboard players set "blarion_is_still_alive" "blarion:script_running" 1`)
});