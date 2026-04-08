import { setlang } from "util.js";

setlang({
    message: {
        global: {
            kick: "Player $1 will be kicked because of: $2",
            ban: "Player $1 will be banned because of: $2",
            mute: "Player $1 will be mute because of spam, check: $2",
            freeze: "Player $1 will be freeze because of: $2",
            imprison: "Player $1 will be imprisoned because of: $2",

            load_successfully: "BlarionAntiCheat Main progress initialized,waiting for block system online...",
            block_system_loaded: "BlarionAntiCheat Block system online!"
        },
        disconnect: {
            kick: "Sorry $1 We've found that you are cheating: $2, You have been kicked"
        },
        warn: {
            cps_too_high: "Warning，Your CPS is too high: $1/$2 Please reduce your CPS!"
        }
    },
    commands: {
        description: {
            getinv: "Get a player's inventory and spawn a two container blocks to storage item (CAUTION:Must use in open area, Or your buildings could be damaged)",
            forcekick: "Force remove a player including all data from world to prevent AntiKick Hacks",
            scan: "Scan NBT cheaters (WIP, Unstable)",
            blac: "Blarion Main Command",
            flag: "Flag a player (for extensions)"
        }
    }
})