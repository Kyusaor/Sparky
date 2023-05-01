import { Guild } from "discord.js";
import { Console, bot, db } from "../../main.js";
import { Server } from "../constants/types.js";

export class ServerManager {
    guildObject: Guild;

    constructor (guild: Guild) {
        this.guildObject = guild;
    }

    static async buildBaseServerObject(serverId: string): Promise<Server> {
        let guild = await bot.guilds.cache.get(serverId);
        if(!guild)
            throw new Error(`Le serveur ${serverId} est introuvable`);
        return { id: serverId, name:guild.name, active: true, language: "fr"}
    }

    async checklistNewServers() {
        let dbPresence = await this.isPresent();
        if(!dbPresence) 
            await db.createServer(this.guildObject.id, this.guildObject.name);
        
    }

    async isPresent(): Promise<boolean> {
        let isPresent = await db.checkIfServerIsPresent(this.guildObject);
        return isPresent;
    }
}