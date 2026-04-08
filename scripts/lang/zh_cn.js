import { setlang } from "util.js";

setlang({
    message: {
        global: {
            kick: "玩家 $1 因为作弊即将被踢出游戏，触发的检测: $2",
            ban: "玩家 $1 因为作弊被封禁，触发的检测: $2",
            mute: "玩家 $1 因为滥发信息被禁言，触发的检测: $2",
            freeze: "玩家 $1 因为作弊被锁定，触发的检测: $2",
            imprison: "玩家 $1 因为作弊被加入管制队列，触发的检测: $2",

            load_successfully: "BlarionAntiCheat 主程序初始化完成，等待拦截系统上线...",
            block_system_loaded: "BlarionAntiCheat 拦截系统已上线!"
        },
        disconnect: {
            kick: "您好 $1 发现您有作弊行为 $2, 您已被踢出游戏"
        },
        warn: {
            cps_too_high:"警告，您的CPS过高: $1/$2 请控制CPS!"
        }
    },
    commands: {
        description: {
            getinv: "将玩家物品栏复制为两个潜影盒（注意：请在开放地带运行，盒子将以方块形式生成！）",
            forcekick: "强行与目标断开连接（用于反制AntiKick）",
            scan: "用于扫描 NBT 作弊器痕迹 (制作中，不稳定)",
            blac: "Blarion主命令",
            flag: "标记玩家，用于对接扩展模块"
        }
    }
})