import { setlang } from "util.js";

setlang({
    message: {
        global: {
            kick: "玩家 $1 因爲作弊即將被踢出遊戲，觸發的檢測: $2",
            ban: "玩家 $1 因爲作弊被封禁，觸發的檢測: $2",
            mute: "玩家 $1 因爲濫發信息被禁言，觸發的檢測: $2",
            freeze: "玩家 $1 因爲作弊被鎖定，觸發的檢測: $2",
            imprison: "玩家 $1 因爲作弊被加入管制隊列，觸發的檢測: $2",

            load_successfully: "BlarionAntiCheat 主程式初始化完成，等待攔截系統上線...",
            block_system_loaded: "BlarionAntiCheat 攔截系統已上線!"
        },
        disconnect: {
            kick: "您好 $1 發現您有作弊行爲 $2, 您已被踢出遊戲"
        },
        warn: {
            cps_too_high: "警告，您的CPS過高: $1/$2 請控制CPS!"
        }
    },
    commands: {
        description: {
            getinv: "將玩家物品欄復制爲兩個潛影盒（注意：請在開放地帶運行，盒子將以方塊形式生成！）",
            forcekick: "強行與目標斷開連接（用於反制AntiKick）",
            scan: "用於掃描 NBT 作弊器痕跡 (制作中，不穩定)",
            blac: "Blarion主命令",
            flag: "標記玩家，用於對接擴展模塊"
        }
    }
})