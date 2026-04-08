import { setlang } from "util.js";

setlang({
    message: {
        global: {
            kick: "玩家 $1 行止不端，用术不正，即将逐出戏局。所犯之禁：$2",
            ban: "玩家 $1 以邪术乱序，罪证昭然，已永锢于门外。所触之禁：$2",
            mute: "玩家 $1 喋喋不休，滥言乱众，已施以噤声之令。所触之禁：$2",
            freeze: "玩家 $1 舞弊确凿，已施定身之术，动弹不得。所触之禁：$2",
            imprison: "玩家 $1 罪无可逭，已收系狱，候待发落。所触之禁：$2",

            load_successfully: "兵马就位，蓄势待发，伏候罗网之张...",
            block_system_loaded: "罗网已张，诸邪莫近！"
        },

        disconnect: {
            kick: "敬告 $1：察君用术不正，行 $2 之举，已逐君于门外。"
        },

        warn: {
            cps_too_high: "警之哉！君之手速过疾：$1/$2，宜自抑之！"
        }
    },
    commands: {
        description: {

            getinv: "抄检玩家行囊，复刻为双匣之贮。（慎之：宜于旷野行之，匣将以实体现形！）",
            forcekick: "强行逐客，断其连接（以破防逐邪术）",
            scan: "搜神之术，以察邪器之痕（方在铸冶，未臻稳固）",
            blac: "总枢号令",
            flag: "朱批玩家，以通外援"
        }
    }
})