import { Guild } from "discord.js";
import { bot, db } from "../../main.js";
import { PartialServer, Server } from "../constants/types.js";

export class ServerManager {
    guild: Guild;

    constructor (providedGuild: Guild) {
        this.guild = providedGuild;
    }

    static async buildBaseServerObject(serverId: string): Promise<Server> {
        let guild = await bot.guilds.cache.get(serverId);
        if(!guild)
            throw new Error(`Le serveur ${serverId} est introuvable`);
        return { id: serverId, name:guild.name, active: true, language: "fr"}
    }

    async checklistNewServers() {
        let dbPresence = await this.isPresentInDatabase();
        if(!dbPresence) 
            await db.createServer(this.guild.id, this.guild.name);
        else if(await this.isActive()){
            this.editServerData({active: true});
        }
        //Finir ajouts (mp admin etc)
    }

    async editServerData(edits: PartialServer): Promise<void> {

    }

    async isActive(): Promise<boolean> {
        let isActive = await db.checkIfServerIsActive(this.guild.id);
        return isActive;
    }

    async isPresentInDatabase(): Promise<boolean> {
        let isPresent = await db.checkIfServerIsPresent(this.guild);
        return isPresent;
    }
}