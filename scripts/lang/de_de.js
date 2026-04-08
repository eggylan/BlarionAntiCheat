import { setlang } from "util.js";

// de_de.js - 德语
setlang({
    message: {
        global: {
            kick: "Spieler $1 wird wegen Cheating gekickt, ausgelöste Erkennung: $2",
            ban: "Spieler $1 wurde wegen Cheating gebannt, ausgelöste Erkennung: $2",
            mute: "Spieler $1 wurde wegen Spam stummgeschaltet, ausgelöste Erkennung: $2",
            freeze: "Spieler $1 wurde wegen Cheating eingefroren, ausgelöste Erkennung: $2",
            imprison: "Spieler $1 wurde wegen Cheating zur Kontrollwarteschlange hinzugefügt, ausgelöste Erkennung: $2",

            load_successfully: "BlarionAntiCheat Hauptprogramm initialisiert, warte auf Interception-System...",
            block_system_loaded: "BlarionAntiCheat Interception-System ist online!"
        },
        disconnect: {
            kick: "Hallo $1, Cheating erkannt ($2), Sie wurden vom Spiel gekickt"
        },
        warn: {
            cps_too_high: "Warnung, Ihr CPS ist zu hoch: $1/$2, bitte kontrollieren Sie Ihr CPS!"
        }
    },
    commands: {
        description: {
            getinv: "Kopiert das Spielerinventar in zwei Shulker-Kisten (Achtung: Führen Sie dies im Freien aus, die Kisten erscheinen als Blöcke!)",
            forcekick: "Erzwingt die Trennung vom Ziel (zur AntiKick-Konterung)",
            scan: "Zum Scannen von NBT-Cheat-Spuren (in Entwicklung, instabil)",
            blac: "Blarion Hauptbefehl",
            flag: "Markiert einen Spieler, zur Integration mit Erweiterungsmodulen"
        }
    }
})