import { Guild, User } from "discord.js";
import { Console, bot, chanList, db } from "../../main.js";
import { PartialServer, Server } from "../constants/types.js";
import { Utils } from "../utils.js";
import { Translations } from "../constants/translations.js";
import { DiscordValues } from "../constants/values.js";

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
        if(!dbPresence) {
            await db.createServer(this.guild.id, this.guild.name);
        }
        else if(!await this.isActive()){
            this.editServerData({active: 1});
        }
        let owner = await bot.users.fetch(this.guild.ownerId);

        this.sendDmToServerOwner(owner);
        this.logServerUpdate("add", owner);
    }

    async editServerData(edits: PartialServer): Promise<void> {
        let oldData = await db.fetchServerData(this.guild.id);
        if(!oldData)
            oldData = await ServerManager.buildBaseServerObject(this.guild.id);
        let active:0 | 1;
        edits.active === 0 ? active = 0 : active = 1;
        let data:Server = {
            id: edits.id || oldData.id,
            name: edits.name || oldData.name,
            active: active,
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

    logServerUpdate(type: "add" | "remove", owner: User):void {
        let text = {
            add: {
                symbol: "(+)",
                emote: "📥",
            },
            remove: {
                symbol: "(-)",
                emote: "📤",
            }
        }

        Console.info(`${text[type].symbol} ${this.guild.name} (${this.guild.id})`);
        chanList.LOGS_SERVERS?.send(`${text[type].emote} ${this.guild.name} (${this.guild.id})\nMembres: ${this.guild.memberCount}\nOwner: ${owner.username} (${owner.id})`);
    }

    async sendDmToServerOwner(owner: User): Promise<void> {
        let embed = Utils.EmbedBaseBuilder("fr")
            .setTitle(`:flag_fr: Bonjour ${owner.username} !`)
            .setDescription(Translations.displayText().fr.global.welcomeMsg)
            .addFields([
                {name: `:flag_gb: Hello ${owner.username} !`, value: Translations.displayText().en.global.welcomeMsg}
            ])
            .setThumbnail(DiscordValues.botIcon.base)

        
        owner.send({embeds: [embed]})
        .catch(e => {
            Console.error(`Impossible d'envoyer un mp de bienvenue à l'utilisateur ${owner.tag} (${owner.id})`)
        })
    }
}