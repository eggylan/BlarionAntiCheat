import { setlang } from "util.js";

setlang({
    message: {
        global: {
            kick: "Le joueur $1 va être expulsé pour tricherie, détection déclenchée: $2",
            ban: "Le joueur $1 a été banni pour tricherie, détection déclenchée: $2",
            mute: "Le joueur $1 a été réduit au silence pour spam, détection déclenchée: $2",
            freeze: "Le joueur $1 a été gelé pour tricherie, détection déclenchée: $2",
            imprison: "Le joueur $1 a été ajouté à la file de contrôle pour tricherie, détection déclenchée: $2",

            load_successfully: "Programme principal BlarionAntiCheat initialisé, en attente du système d'interception...",
            block_system_loaded: "Système d'interception BlarionAntiCheat en ligne!"
        },
        disconnect: {
            kick: "Bonjour $1, tricherie détectée ($2), vous avez été expulsé du jeu"
        },
        warn: {
            cps_too_high: "Avertissement, votre CPS est trop élevé: $1/$2, veuillez contrôler votre CPS!"
        }
    },
    commands: {
        description: {
            getinv: "Copie l'inventaire du joueur dans deux boîtes de Shulker (Attention: exécutez dans une zone ouverte, les boîtes apparaîtront sous forme de blocs!)",
            forcekick: "Force la déconnexion de la cible (pour contrer l'AntiKick)",
            scan: "Utilisé pour scanner les traces de triche NBT (en développement, instable)",
            blac: "Commande principale Blarion",
            flag: "Marque un joueur, utilisé pour l'intégration avec des modules d'extension"
        }
    }
})