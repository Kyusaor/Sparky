import { Guild } from "discord.js";
import { db } from "../../main.js";

export class ServerManager {
    guildObject: Guild;

    constructor (guild: Guild) {
        this.guildObject = guild;
    }

    static async isPresent(guild: Guild): Promise<boolean> {
        let isPresent = await db.checkIfServerIsPresent(guild);
        return isPresent;
    }
}