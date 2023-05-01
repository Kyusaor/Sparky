import { Guild } from "discord.js";
import { Console, bot, db } from "../../main.js";
import { PartialServer, Server } from "../constants/types.js";

export class ServerManager {
    guild: Guild;

    constructor (providedGuild: Guild) {
        this.guild = providedGuild;
    }

    static async buildBaseServerObject(serverId: string): Promise<Server> {
        let guild = await bot.guilds.cache.get(serverId);
        let data:Server = { id: serverId, name: guild?.name || "Serveur introuvable", active: 1, language: "fr"};
        return data
    }

    async checklistNewServers() {
        let dbPresence = await this.isPresentInDatabase();
        if(!dbPresence) 
            await db.createServer(this.guild.id, this.guild.name);
        else if(await this.isActive()){
            this.editServerData({active: 0});
        }
        //Finir ajouts (mp admin etc)
        //Changer format donnée "active" en autre chose que 0
    }

    async editServerData(edits: PartialServer): Promise<void> {
        let oldData = await db.fetchServerData(this.guild.id);
        if(!oldData)
            oldData = await ServerManager.buildBaseServerObject(this.guild.id);
        let data:Server = {
            id: edits.id || oldData.id,
            name: edits.name || oldData.name,
            active: edits.active || oldData.active,
            language: edits.language || oldData.language
        }
        await db.editServerDatabase(data);

        for(let dataName of Object.keys(edits)) {
            Console.log(`${dataName}: ${oldData[dataName as keyof Server]} => ${edits[dataName as keyof Server]}`)
        }
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