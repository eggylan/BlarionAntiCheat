import { world, system } from "@minecraft/server";
import config from "./config.js";

const commands = {};

class SFWNetworkError extends Error {
    constructor(message, datapack) {
        super(message);
        this.name = this.constructor.name;
        this.message = `${message}\nDataPack:${datapack}`;
        this.stack = new Error().stack;
    }
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
export class SfwScriptEventNetwork {
    constructor(data) {
        this.namespace = data.namespace; this.name = data.name; this.description = data.description;
        this.chatModifiers = [];
        system.afterEvents.scriptEventReceive.subscribe(({ id, message }) => {
            try {
                if (id === "sfw:udp") {
                    const datapack = JSON.parse(message);
                    if (datapack.receiver === `${this.namespace}:${this.name}`) {
                        switch (datapack.type) {
                            case "command_request":
                                commands[datapack.value.command_name.replace(`${this.namespace}:`, "")].execute({ sender: world.getEntity(datapack.sender) }, datapack.value.args);
                                break;
                            case "register_plugin_successful":
                                if (datapack.sender === "sfw:core") {
                                    world.sendMessage("§b◆ §r§9[§bBlarion§9]§r Blarion AntiCheat has successfully registered");
                                    receivedSfwResponse = true;
                                    break;
                                }
                            case "chat_send_before_event":
                                for (const modifier of this.chatModifiers) {
                                    modifier(datapack.value);
                                }

                        }
                    }
                }
            } catch (error) {
                throw new SFWNetworkError(error, message);
            }
        });
    }

    registerPlugin() {
        const datapack = {
            "type": "register_plugin",
            "sender": config.packetSenderId,
            "receiver": "sfw:core",
            "value": {
                namespace: this.namespace,
                name: this.name,
                description: this.description,
            }
        }
        this.sendPacket(datapack)
    }

    registerCommand(data) {
        const { namespace, name, execute } = data;

        if (typeof name !== "string") throw TypeError(`data.name is type of ${typeof name}. Expected "string"`);
        if (typeof execute !== "function") throw TypeError(`data.execute is type of ${typeof execute}. Expected "function"`);

        if (commands[`${namespace}:${name}`]) throw Error(`Command "${namespace}:${name}" has already been registered`);

        commands[`${namespace}:${name}`] = data;

        let newdata = data;

        newdata.namespace = data.namespace;
        newdata.requiredTags = data.requiredTags;

        const datapack = {
            "type": "register_command",
            "sender": `${this.namespace}:${this.name}`,
            "receiver": "sfw:core",
            "value": newdata
        }

        this.sendPacket(datapack)
    }

    chatModifier(modifier) {
        const datapack = {
            "type": "chat_modifier",
            "sender": `${this.namespace}:${this.name}`,
            "receiver": "sfw:core",
            "value": {
                id: generateUUID(),
                cancel_event: true
            }
        }
        this.sendPacket(datapack);
        this.chatModifiers.push(modifier);
    }

    sendPacket(datapack) {
        system.run(async () => { world.getDimension("overworld").runCommand(`scriptevent sfw:udp ${JSON.stringify(datapack)}`) });
    }
}

export function findPlayerByName(name) {
    const searchName = name.toLowerCase().replaceAll(" ", "-");

    let player;

    for (const pl of world.getPlayers()) {
        const lowercaseName = pl.name.toLowerCase().replaceAll(" ", "-");
        const lowercaseNameTag = pl.nameTag.toLowerCase().replaceAll(" ", "-");
        if (searchName !== lowercaseName && searchName !== lowercaseNameTag) continue;

        // Found a valid player
        player = pl;
        break;
    }

    return player;
}

export function findPlayerByID(id) {

    let player;

    for (const pl of world.getPlayers()) {
        if (pl.id!==id) continue;

        // Found a valid player
        player = pl;
        break;
    }

    return player;
}

export const seNetwork = new SfwScriptEventNetwork({ namespace: "blarion", name: "blarion_main", description: "Blarion Anticheat Main" });
seNetwork.registerPlugin();
