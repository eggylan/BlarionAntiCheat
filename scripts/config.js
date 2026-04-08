export default {
  "packetSenderId": "blarion:main_lite",
  "language":"zh_cn",//avaliable: en_us|fr_fr|de_de|ru_ru|ja_jp|ko_kr|zh_cn|zh_tr
  "resetDp": true,
  "debug": false,
  "scanDelay": 5,
  // If checks can auto-ban
  "autoban": false,
  "flagWhitelist": [],
  /*
	By enabling this toggle, you can prevent anybody will scythe op from getting flagged from the anticheat
	Although this may be a useful feature, it can be exploited by hackers to completely disable the anticheat for themselves.
	It is a much better idea to add "exclude_scythe_op" for each individual check instead of globally
	*/
  "op_bypass": false,
  "force_op_blocker": { //check and block ForceOP connections
    "enabled": true,
    "mode": "strict",
    /*
		"lite":only checks account token data when login
		"strict":checks account token and player name when login
		"very_strict":checks both login data and gaming permissions
		*/
    "send_global_alert": true //if enabled, will send a world message after blocked a hacker
  },
  "modules": {
    "exampleA": {
      // If the check should be enabled or not.
      "enabled": true,
      // If players with scythe-op can bypass this check (Optional)
      "exclude_scythe_op": false,
      // The punishment. Can either be "none", "mute", "kick" or "ban"
      "punishment": "none",
      // PunishmentLength can be either a length ('7d', '2w 1h'), how long the ban should be in milliseconds
      // To perm ban the user the should string be empty.
      "punishmentLength": "",
      // How much violations the player must first have to start punishing them
      "minVlbeforePunishment": 1
    },
    "autoclickerA": {
      "description": "Checks for high CPS.",
      "enabled": true,
      "maxCPS": 16,
      "punishment": "kick",
      "minVlbeforePunishment": 3
    },
    "autoclickerB": {
      "description": "(WaitForFix) Checks for very stable CPS.",
      "enabled": false,
      "minCPS": 5,
      "varianceRange": 0.01,
      "stableLength": 5,
      "punishment": "none",
      "minVlbeforePunishment": 0
      },
    "autoequipA": {
        "description": "Checks for very high rate equipting",
        "enabled": true,
        "minDelay": 90,
        "punishment": "none",
        "minVlbeforePunishment": 0
    },
    "autotoolA": {
      "description": "Checks if a player switches their slot right after they start breaking a block.",
      "enabled": true,
      "startBreakDelay": 90,
      "punishment": "none",
      "minVlbeforePunishment": 0
     },
    "badenchantsA": {
      "description": "Enchant level too high",
      "enabled": false,
      "levelExclusions": {
        /*
				If your realm uses enchantments with levels higher then vanilla then you need to exclude them here.
				To add an exclusion, add ' "<enchantment name>": <max level> ' below the examples
				Anything in this area will be considered as a comment, and wont take effect,

				"efficiency": 69,
				"sharpness": 420
				*/
      },
      "punishment": "kick",
      "minVlbeforePunishment": 1
    },
    "badenchantsB": {
      "description": "Checks for enchantment levels exceeding vanilla limits.",
      "enabled": false,
      "multi_protection": true,
      "punishment": "kick",
      "minVlbeforePunishment": 1
    },
    "badenchantsC": {
      "description": "Checks if an item is enchanted with an enchant that can't be applied to the item.",
      "enabled": false,
      "punishment": "kick",
      "minVlbeforePunishment": 1
    },
    "badenchantsD": {
      "description": "Checks if an item has a lore.",
      "enabled": false,
      "exclusions": [
        "(+DATA)"
      ],
      "punishment": "none",
      "minVlbeforePunishment": 0
    },
    "badenchantsE": {
      "description": "Checks if an item has duplicated enchantments.",
      "enabled": false,
      "punishment": "kick",
      "minVlbeforePunishment": 1
    },
    "badpackets1": {
      "description": "check a player recieved or cause negative damage (will flag both injured player and damaging player)",
      "enabled": false,
      "punishment": "kick",
      "minVlbeforePunishment": 1
    },
    "badpackets2": {
      "description": "check a player try to apply impulse while recieve damaging knockback",
      "enabled": true,
      "legacyImpulse": 0.5,
      "punishment": "kick",
      "minVlbeforePunishment": 1
    },
    "badpackets3": {
      "description": "Checks for self-hurt.",
      "enabled": false,
      "punishment": "ban",
      "punishmentLength": "",
      "minVlbeforePunishment": 1
    },
    "badpackets4": {
      "description": "Checks for no-cd attack damage",
      "enabled": false,
      "punishment": "kick",
      "punishmentLength": "",
      "minVlbeforePunishment": 4
    },
    "badpackets5": {
      "description": "Checks for x-rotation > 90 degrees",
      "enabled": true,
      "punishment": "none",
      "punishmentLength": "",
      "minVlbeforePunishment": 0
    },

    "badpackets6": {
      "description": "Impossible behavior check",
      "enabled": true,
      "punishment": "none",
      "punishmentLength": "",
      "minVlbeforePunishment": 0
    },
    "commandblockexploitF": {
      "description": "Prevents the placement of beehives, beenests and movingblocks.",
      "enabled": true,
      "punishment": "ban",
      "punishmentLength": "",
      "minVlbeforePunishment": 1
    },
    "commandblockexploitG": {
      "description": "Additional killing check.",
      "enabled": true,
      "npc": true,
      "entities": [
        "minecraft:command_block_minecart",
        "minecraft:agent",
        "minecraft:balloon",
        "minecraft:ice_bomb",
        "minecraft:tripod_camera"
      ],
      // Checks if a certain type of block is near where the entity summoned
      // This helps against more advanced bypasses
      "blockSummonCheck": [
        "minecraft:beehive",
        "minecraft:bee_nest",
        "minecraft:dispenser"
      ],
      "punishment": "kick",
      "minVlbeforePunishment": 0
    },
    "commandblockexploitH": {
      "description": "Additional item clearing check",
      "enabled": false,
      "punishment": "kick",
      "minVlbeforePunishment": 1
    },
    "commandblockexploitW": {
      "description": "(API) Websocket command request check",
      "enabled": true,
      "punishment": "kick",
      "minVlbeforePunishment": 1
    },
    "crasherA": {
      "description": "Checks for teleport out of border",
      "enabled": true,
      "punishment": "kick",
      "punishmentLength": "",
      "minVlbeforePunishment": 1
    },
    "crasherB": {
      "description": "Checks for very large render distance",
      "enabled": true,
      "punishment": "kick",
      "punishmentLength": "",
      "minVlbeforePunishment": 0
    },
    "crasherC": {
        "description": "(StarBloomAPI) Checks for invalid character crash",
        "enabled": true,
        "punishment": "kick",
        "punishmentLength": "",
        "minVlbeforePunishment": 0
    },
    "fastuseA": {
      "description": "Checks for using/throwing items at a very fast rate. & Checks for fly-like motion.",
      "enabled": false,
      "min_use_delay": 10,
      "max_use_delay": 50,
      "punishment": "none",
      "minVlbeforePunishment": 0
    },
    "fastuseB": {
      "description": "Checks for placing blocks at a very fast rate. i.e. SpeedScaffold",
      "enabled": true,
      "min_use_delay": 5,
      "max_use_delay": 40,
      "punishment": "kick",
      "minVlbeforePunishment": 5
    },
    "fly0": {
      "description": "(outdated) Check and cancel for player enabling fly illegally (For version below 1.21)",
      "enabled": true,
      "punishment": "kick",
      "minVlbeforePunishment": 5
    },
    "flyA": {
      "description": "(outdated) Check for player has stuck in the air (For version below 1.20)",
      "enabled": false,
      "punishment": "kick",
      "minVlbeforePunishment": 2
    },
    "flyB": {
      "description": "(outdated) Check for player's uplift distance (For version below 1.21)",
      "enabled": false,
      "punishment": "none",
      "minVlbeforePunishment": 0
    },
    "flyC": {
      "description": "Advanced check for player's up distance (For version above 1.21)\n Extra:\n1.Check gliding without elytra (solstice)\n2.Check invalid Y-velocity acceleration in air",
      "enabled": true,
      "maxJumpHeight": 3.00,
      "enableExtraCheck": true,
      "punishment": "kick",
      "minVlbeforePunishment": 5
    },
    "flyD": {
      "description": "Check airjump / fake scaffold fly",
      "minCheckAcceleration": 0.02,
      "maxCheckAcceleration": 2,
      "teleport_bypass":true,
      "excludeEntities": {
        "happy_ghast": 5,
        "shulker": 2
      },
      "enabled": true,
      "punishment": "kick",
      "minVlbeforePunishment": 5
    },
    "illegalitemsB": {
      "description": "",
      "enabled": false,
      "punishment": "none",
      "minVlbeforePunishment": 0
    },
    "illegalitemsC": {
      "description": "",
      "enabled": false,
      "punishment": "none",
      "minVlbeforePunishment": 0
    },
    "illegalitemsD": {
      "description": "",
      "enabled": false,
      "punishment": "none",
      "minVlbeforePunishment": 0
    },
    "illegalitemsE": {
      "description": "",
      "enabled": false,
      "punishment": "none",
      "punishmentLength": "",
      "minVlbeforePunishment": 1
    },
    "illegalitemsF": {
      "description": "",
      "enabled": false,
      "length": 33,
      "punishment": "none",
      "minVlbeforePunishment": 0
    },
    "illegalitemsH": {
      "description": "",
      "enabled": true,
      "punishment": "none",
      "minVlbeforePunishment": 0
    },
    "illegalitemsI": {
      "description": "",
      "enabled": false,
      "exclude_scythe_op": true,
      "container_blocks": [
        "minecraft:chest",
        "minecraft:trapped_chest",
        "minecraft:barrel",
        "minecraft:beacon",
        "minecraft:furnace",
        "minecraft:blast_furnace",
        "minecraft:brewing_stand",
        "minecraft:dispenser",
        "minecraft:dropper",
        "minecraft:hopper",
        "minecraft:jukebox",
        "minecraft:lectern",
        "minecraft:smoker"
      ],
      "punishment": "none",
      "minVlbeforePunishment": 0
    },
    "illegalitemsJ": {
      "description": "",
      "enabled": false,
      "exclude_scythe_op": true,
      "punishment": "none",
      "minVlbeforePunishment": 0
    },
    "illegalitemsK": {
      "description": "",
      "enabled": false,
      "exclude_scythe_op": true,
      "entities": [
        "minecraft:chest_boat",
        "minecraft:chest_minecart"
      ],
      "punishment": "none",
      "minVlbeforePunishment": 0
    },
    "illegalitemsL": {
      "description": "",
      "enabled": false,
      "punishment": "none",
      "minVlbeforePunishment": 0
    },
    "illegalitemsM": {
      "description": "",
      "enabled": false,
      "punishment": "none",
      "minVlbeforePunishment": 0
    },
    // This should only be enabled if your realm/server is being targetted by advanced hacking groups
    "instabreakA": {
      "description": "Break a block instantly",
      "enabled": false,
      "unbreakable_blocks": [
        "minecraft:bedrock",
        "minecraft:end_portal",
        "minecraft:end_portal_gateway",
        "minecraft:barrier",
        "minecraft:command_block",
        "minecraft:chain_command_block",
        "minecraft:repeating_command_block",
        "minecraft:end_gateway",
        "minecraft:light_block"
      ],
      "punishment": "kick",
      "minVlbeforePunishment": 1
    },
    "invalidsprintA": {
      "description": "Check for sprinting while have blindness effect",
      "enabled": true,
      "punishment": "none",
      "minVlbeforePunishment": 0
    },
    "killauraB": {
      "description": "(outdated) Checks for no swing/client riptide. (Instantly detects toolbox killaura, version below 1.20.80)",
      "enabled": false,
      "punishment": "kick",
      "minVlbeforePunishment": 0
    },
    "killauraC": {
      "description": "Multi attack check",
      "enabled": true,
      "entities": 3,
      "punishment": "kick",
      "minVlbeforePunishment": 4
    },
    "killauraD": {
      "description": "Checks for attack while sleeping",
      "enabled": false,
      "punishment": "kick",
      "minVlbeforePunishment": 0
    },
    "killauraE": {
      "description": "Checks for attacking while having a container open.",
      "enabled": false,
      "punishment": "kick",
      "minVlbeforePunishment": 0
    },
    "killauraF": {
      "description": "Advanced aura(s) check.",
      "enableExtraCheck": false,
      "enabled": true,
      "nonSolidBlockKeys": [
        "slab",
        "stairs",
        "ladder",
        "door",
        "plate",
        "carpet",
        "pane",
        "fence",
        "wall",
        "bars"
      ],
      "punishment": "kick",
      "minVlbeforePunishment": 4
    },
    "namespoofA": {
      "description": "Checks if a player's name is longer than 16 characters.",
      "enabled": true,
      "minNameLength": 3,
      "maxNameLength": 16,
      "punishment": "kick",
      "minVlbeforePunishment": 1
    },
    "namespoofB": {
      "description": "Name has illegal characters",
      "enabled": true,
      "regex": /[ ^A-Za-z0-9_\-() ]/,
      "punishment": "kick",
      "minVlbeforePunishment": 1
    },
    "noslowA": {
      "description": "Check a player isn't slowdown in special blocks or eating",
      "enabled": false,
      "speed": 0.12,
      "maxSpeed": 0.16,
      "punishment": "none",
      "minVlbeforePunishment": 0
    },
    "noclipA": {
      "description": "Check a player is moving below a block's surface",
      "enabled": false,
      "minCheckSpeed": 0.25,
      "punishment": "kick",
      "minVlbeforePunishment": 2
    },
    "nofallA": {
      "description": "(outdated) Check if a player has velocity without any movement (For version below 1.21.40)",
      "enabled": false,
      "punishment": "kick",
      "minVlbeforePunishment": 20
    },
    "nukerA": {
      "description": "Multi break check",
      "enabled": true,
      "maxBlocks": 6,
      "punishment": "none",
      "minVlbeforePunishment": 0
    },
    "reachA": {
      "description": "Long entity reach level check",
      "enabled": true,
      "reach": 5.6,
      "entities_blacklist": [
        "minecraft:enderman",
        "minecraft:fireball",
        "minecraft:ender_dragon",
        "minecraft:ghast",
        "minecratft:wind_charge_projectile"
      ],
      "punishment": "kick",
      "minVlbeforePunishment": 5
    },
    "reachB": {
      "description": "Long block reach level check",
      "enabled": true,
      "maxBlockReach": 6,
      "punishment": "kick",
      "minVlbeforePunishment": 0
    },
    /* //stable version removed spammer detect to avoid conflicts
		"spammerA": {
			"description": "Send a message while moving",
			"enabled": false,
			"punishment": "none",
			"minVlbeforePunishment": 0
		},
		"spammerB": {
			"description": "Send a message while swinging",
			"enabled": false,
			"punishment": "none",
			"minVlbeforePunishment": 0
		},
		"spammerC": {
			"description": "Send a message while using items",
			"enabled": false,
			"punishment": "none",
			"minVlbeforePunishment": 0
		},
		"spammerD": {
			"description": "Send a message while opening GUI(Without ChatGUI)",
			"enabled": false,
			"punishment": "none",
			"minVlbeforePunishment": 0
		},
		"spammerE": {
			"description": "Fast sent",
			"enabled": true,
			// How fast players can send messages in milliseconds
			"messageRatelimit": 500,
			// If a warning message should be sent to the spammer
			"sendWarningMessage": true,
			"punishment": "none",
			"minVlbeforePunishment": 0
		},
		*/
    "scaffoldA": {
      "description": "Fast tower check",
      "enabled": true,
      "max_y_pos_diff": 0.35,
      "punishment": "kick",
      "minVlbeforePunishment": 0
    },
    "scaffoldB": {
      "description": "Place blocks with wrong rotation",
      "enabled": true,
      "punishment": "none",
      "minVlbeforePunishment": 5
    },
    "scaffoldC": {
      "description": "Checks if a player places a block under them while looking upwards.",
      "enabled": true,
      "punishment": "none",
      "minVlbeforePunishment": 0
    },
    "scaffoldD": {
      "description": "Checks for downwards scaffold.",
      "enabled": false,
      "punishment": "none",
      "minVlbeforePunishment": 0
    },
    "scaffoldE": {
      "description": "Checks for placing blocks on liquids or air.",
      "enabled": true,
      "punishment": "none",
      "bypass_block_keywords": [
          "slab",
          "snow_layer",
          "cake"
      ],
      "minVlbeforePunishment": 0
    },
    "xrayA": {
      "enabled": false,
      "punishment": "none",
      "minVlbeforePunishment": 0
    },
    "speedA": {
      "description": "Check if player's land speed faster than Vallina",
      "basicSpeed": 3.00,
      "enabled": false,
      "punishment": "kick",
      "minVlbeforePunishment": 2
    },
    "speedB": {
      "description": "Check a player is using BunnyHop/VoidHop/LongJump/SpeedFly",
      "enabled": false,
      "punishment": "kick",
      "punishmentLength": "",
      "maxAirSpeed": 4,
      "minVlbeforePunishment": 2
    },
    "speedC": { //still developing
      "description": "Check other speed-like movement",
      "enabled": true,
      "punishment": "kick",
      "punishmentLength": "",
      "minCheckSpeed": 1,
      "illegalTPSpeed": 25.0,
      "minVlbeforePunishment": 2
    },
    "timerA": {
      "description": "Check player's tickrate",
      "enabled": false,
      "maxPacketCount": 2,
      "punishment": "none",
      "punishmentLength": "",
      "minVlbeforePunishment": 2
    }
  },
  "misc_modules": {
    "antiArmorStandCluster": {
      "enabled": true,
      "radius": 5,
      "max_armor_stand_count": 50
    },
    "filterUnicodeChat": {
      "enabled": false
    },
    "itemSpawnRateLimit": {
      "enabled": false,
      "entitiesBeforeRateLimit": 45
    },
    /*
        Enabling this module is highly discouraged, as it breaks items names, enchantments, durability
        and item data relating to it.
        These items can contain large nbt data which can cause the world file size to dramatically increase.
        In anarchy environments, this module can help greatly to prevent world corruption.
        Your welcome, Carthe.
        */
    "resetItemData": {
      "enabled": false,
      "items": [
        "minecraft:armor_stand",
        "minecraft:barrel",
        "minecraft:blast_furnace",
        "minecraft:brewing_stand",
        "minecraft:campfire",
        "minecraft:soul_campfire",
        "minecraft:cauldron",
        "minecraft:chest",
        "minecraft:trapped_chest",
        "minecraft:dropper",
        "minecraft:flower_pot",
        "minecraft:hopper",
        "minecraft:frame",
        "minecraft:glow_frame",
        "minecraft:jukebox",
        "minecraft:lectern",
        "minecraft:chest_minecart",
        "minecraft:hopper_minecart",
        "minecraft:smoker",
        "minecraft:end_gateway",
        "minecraft:sponge"
      ]
    },
    "welcomeMessage": {
      "enabled": false,
      // You can use [@player] to mention the player name
      "message": "§l§b| 欢迎玩家 [@player] 加入了CRS小游戏服务器！ |"
    },
    "worldborder": {
      "enabled": false,
      "max_x": 64,
      "max_z": 64
    }
  },
  "itemLists": {
    "spawnEggs": {
      "clearVanillaSpawnEggs": true,
      "clearCustomSpawnEggs": false
    },
    "elements": true,
    "xray_items": [
      "minecraft:diamond_ore",
      "minecraft:ancient_debris"
    ],
    "cbe_items": [
      "minecraft:beehive",
      "minecraft:bee_nest",
      "minecraft:moving_block",
      "minecraft:axolotl_bucket",
      "minecraft:cod_bucket",
      "minecraft:powder_snow_bucket",
      "minecraft:pufferfish_bucket",
      "minecraft:salmon_bucket",
      "minecraft:tropical_fish_bucket",
      "minecraft:tadpole_bucket",
      "minecraft:dispenser"
    ],
    "items_semi_illegal": [
      "minecraft:bedrock",
      "minecraft:end_portal_frame",
      "minecraft:dragon_egg",
      "minecraft:monster_egg",
      "minecraft:infested_deepslate",
      "minecraft:mob_spawner",
      "minecraft:budding_amethyst",
      "minecraft:command_block",
      "minecraft:repeating_command_block",
      "minecraft:chain_command_block",
      "minecraft:barrier",
      "minecraft:structure_block",
      "minecraft:structure_void",
      "minecraft:jigsaw",
      "minecraft:allow",
      "minecraft:deny",
      "minecraft:light_block",
      "minecraft:border_block",
      "minecraft:chemistry_table",
      "minecraft:frosted_ice",
      "minecraft:npc_spawn_egg",
      "minecraft:reinforced_deepslate",
      "minecraft:farmland"
    ],
    "items_very_illegal": [
      "minecraft:flowing_water",
      "minecraft:water",
      "minecraft:flowing_lava",
      "minecraft:lava",
      "minecraft:fire",
      "minecraft:lit_furnace",
      "minecraft:standing_sign",
      "minecraft:wall_sign",
      "minecraft:lit_redstone_ore",
      "minecraft:unlit_redstone_ore",
      "minecraft:portal",
      "minecraft:unpowered_repeater",
      "minecraft:powered_repeater",
      "minecraft:pumpkin_stem",
      "minecraft:melon_stem",
      "minecraft:end_portal",
      "minecraft:lit_redstone_lamp",
      "minecraft:carrots",
      "minecraft:potatoes",
      "minecraft:unpowered_comparator",
      "minecraft:powered_comparator",
      "minecraft:double_wooden_slab",
      "minecraft:standing_banner",
      "minecraft:wall_banner",
      "minecraft:daylight_detector_inverted",
      "minecraft:chemical_heat",
      "minecraft:underwater_torch",
      "minecraft:end_gateway",
      "minecraft:stonecutter",
      "minecraft:glowingobsidian",
      "minecraft:netherreactor",
      "minecraft:bubble_column",
      "minecraft:bamboo_sapling",
      "minecraft:spruce_standing_sign",
      "minecraft:spruce_wall_sign",
      "minecraft:birch_standing_sign",
      "minecraft:birch_wall_sign",
      "minecraft:jungle_standing_sign",
      "minecraft:jungle_wall_sign",
      "minecraft:acacia_standing_sign",
      "minecraft:acacia_wall_sign",
      "minecraft:darkoak_standing_sign",
      "minecraft:darkoak_wall_sign",
      "minecraft:lit_smoker",
      "minecraft:lava_cauldron",
      "minecraft:soul_fire",
      "minecraft:crimson_standing_sign",
      "minecraft:crimson_wall_sign",
      "minecraft:warped_standing_sign",
      "minecraft:warped_wall_sign",
      "minecraft:blackstone_double_slab",
      "minecraft:polished_blackstone_brick_double_slab",
      "minecraft:polished_blackstone_double_slab",
      "minecraft:unknown",
      "minecraft:camera",
      "minecraft:reserved6",
      "minecraft:info_update",
      "minecraft:info_update2",
      "minecraft:lit_deepslate_redstone_ore",
      "minecraft:hard_stained_glass_pane",
      "minecraft:hard_stained_glass",
      "minecraft:colored_torch_rg",
      "minecraft:colored_torch_bp",
      "minecraft:balloon",
      "minecraft:ice_bomb",
      "minecraft:medicine",
      "minecraft:sparkler",
      "minecraft:glow_stick",
      "minecraft:compound",
      "minecraft:powder_snow",
      "minecraft:lit_blast_furnace",
      "minecraft:redstone_wire",
      "minecraft:crimson_double_slab",
      "minecraft:warped_double_slab",
      "minecraft:cobbled_deepslate_double_slab",
      "minecraft:polished_deepslate_double_slab",
      "minecraft:deepslate_tile_double_slab",
      "minecraft:deepslate_brick_double_slab",
      "minecraft:agent_spawn_egg",
      "minecraft:client_request_placeholder_block",
      "minecraft:rapid_fertilizer",
      "minecraft:hard_glass",
      "minecraft:hard_glass_pane",
      "minecraft:exposed_double_cut_copper_slab",
      "minecraft:oxidized_double_cut_copper_slab",
      "minecraft:waxed_double_cut_copper_slab",
      "minecraft:waxed_exposed_double_cut_copper_slab",
      "minecraft:waxed_oxidized_double_cut_copper_slab",
      "minecraft:waxed_weathered_double_cut_copper_slab",
      "minecraft:weathered_double_cut_copper_slab",
      "minecraft:double_wooden_slab",
      "minecraft:double_cut_copper_slab",
      "minecraft:invisible_bedrock",
      "minecraft:piston_arm_collision",
      "minecraft:sticky_piston_arm_collision",
      "minecraft:trip_wire",
      "minecraft:brewingstandblock",
      "minecraft:real_double_stone_slab",
      "minecraft:item.acacia_door",
      "minecraft:item.bed",
      "minecraft:item.beetroot",
      "minecraft:item.birch_door",
      "minecraft:item.cake",
      "minecraft:item.camera",
      "minecraft:item.campfire",
      "minecraft:item.cauldron",
      "minecraft:item.chain",
      "minecraft:item.crimson_door",
      "minecraft:item.dark_oak_door",
      "minecraft:item.flower_pot",
      "minecraft:item.frame",
      "minecraft:item.glow_frame",
      "minecraft:item.hopper",
      "minecraft:item.iron_door",
      "minecraft:item.jungle_door",
      "minecraft:item.kelp",
      "minecraft:item.nether_sprouts",
      "minecraft:item.nether_wart",
      "minecraft:item.reeds",
      "minecraft:item.skull",
      "minecraft:item.soul_campfire",
      "minecraft:item.spruce_door",
      "minecraft:item.warped_door",
      "minecraft:item.wheat",
      "minecraft:item.wooden_door",
      "minecraft:real_double_stone_slab3",
      "minecraft:real_double_stone_slab4",
      "minecraft:cave_vines",
      "minecraft:cave_vines_body_with_berries",
      "minecraft:cave_vines_head_with_berries",
      "minecraft:real_double_stone_slab2",
      "minecraft:spawn_egg",
      "minecraft:coral_fan_hang",
      "minecraft:coral_fan_hang2",
      "minecraft:coral_fan_hang3",
      "minecraft:cocoa",
      "minecraft:mangrove_standing_sign",
      "minecraft:item.mangrove_door",
      "minecraft:mangrove_wall_sign",
      "minecraft:mud_brick_double_slab",
      "minecraft:mangrove_double_slab",
      "minecraft:item.brewing_stand",
      "minecraft:double_stone_block_slab",
      "minecraft:bleach",
      "minecraft:double_stone_block_slab2",
      "minecraft:double_stone_block_slab3",
      "minecraft:double_stone_block_slab4",
      "minecraft:black_candle_cake",
      "minecraft:blue_candle_cake",
      "minecraft:brown_candle_cake",
      "minecraft:candle_cake",
      "minecraft:cyan_candle_cake",
      "minecraft:gray_candle_cake",
      "minecraft:green_candle_cake",
      "minecraft:light_blue_candle_cake",
      "minecraft:light_gray_candle_cake",
      "minecraft:lime_candle_cake",
      "minecraft:magenta_candle_cake",
      "minecraft:orange_candle_cake",
      "minecraft:pink_candle_cake",
      "minecraft:purple_candle_cake",
      "minecraft:red_candle_cake",
      "minecraft:sweet_berry_bush",
      "minecraft:unlit_redstone_torch",
      "minecraft:white_candle_cake",
      "minecraft:yellow_candle_cake"
    ]
  },
  "bypassDamageCause": [
    //https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/entitydamagecause?view=minecraft-bedrock-stable
    "blockExplosion",
    "entityExplosion",
    "entityAttack",
    "ramAttack",
    "selfDestruct",
    "sonicBoom"
  ]
};
