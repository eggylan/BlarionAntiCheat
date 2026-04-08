import { setlang } from "util.js";

setlang({
    message: {
        global: {
            kick: "プレイヤー $1 がチート行為のためキックされます、検出トリガー: $2",
            ban: "プレイヤー $1 がチート行為のためBANされました、検出トリガー: $2",
            mute: "プレイヤー $1 がスパム行為のためミュートされました、検出トリガー: $2",
            freeze: "プレイヤー $1 がチート行為のためフリーズされました、検出トリガー: $2",
            imprison: "プレイヤー $1 がチート行為のため管理キューに追加されました、検出トリガー: $2",

            load_successfully: "BlarionAntiCheat メインプログラムの初期化が完了しました、インターセプトシステムの起動を待っています...",
            block_system_loaded: "BlarionAntiCheat インターセプトシステムが起動しました!"
        },
        disconnect: {
            kick: "こんにちは $1 さん、チート行為 ($2) が検出されたため、キックされました"
        },
        warn: {
            cps_too_high: "警告、CPSが高すぎます: $1/$2 CPSを制御してください!"
        }
    },
    commands: {
        description: {
            getinv: "プレイヤーのインベントリを2つのシュルカーボックスにコピーします（注意：開けた場所で実行してください、ボックスはブロックとして生成されます!）",
            forcekick: "対象を強制的に切断します（AntiKick対策用）",
            scan: "NBTチートの痕跡をスキャンするために使用されます（製作中、不安定）",
            blac: "Blarionメインコマンド",
            flag: "プレイヤーをマークし、拡張モジュールとの連携に使用されます"
        }
    }
})