

// This is the initial file that runs. It is used to load everything for Scythe
import config from "config.js";
import { world, system } from "@minecraft/server";
import "./seudp.js";
import "./system.js";

system.runTimeout(() => {
	if (config.resetDp) {
		config.resetDp = false;
		console.warn("World Dynamic Property Is Resetting...");
		world.setDynamicProperty("config", JSON.stringify(config));
		console.warn("World Dynamic Property Reset Successful!");
	}

	const dpConfig = world.getDynamicProperty("config"); // Object
	if (dpConfig) {
		const parsedConfig = JSON.parse(dpConfig);

		for (const item of Object.keys(parsedConfig)) {
			config[item] = parsedConfig[item];
		}

		console.warn("Loaded Blarion Config from Dynamic Properties");
	}

	import("./main.js");
	//import("./net.js";
},60);