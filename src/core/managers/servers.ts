import { Guild, Role, User } from "discord.js";
import { Console, TranslationsCache, bot, chanList, db } from "../../main.js";
import { ChanData, PartialServer, RolesData, Server, fullServer } from "../constants/types.js";
import { Utils } from "../utils.js";
import { Constants, DiscordValues } from "../constants/values.js";

export class ServerManager {
    guild: Guild;

    constructor(providedGuild: Guild) {
        this.guild = providedGuild;
    }

    static async buildBaseServerObject(serverId: string): Promise<Server> {
        let guild = await bot.guilds.cache.get(serverId);
        let data: Server = { id: serverId, name: guild?.name || "Serveur introuvable", active: 1, hellEvent: '0', language: Utils.getLanguageFromLocale(guild?.preferredLocale!) || Constants.defaultLanguage };
        return data
    }

    async checklistNewServers(): Promise<void> {
        let dbPresence = await this.isPresentInDatabase();
        if (!dbPresence) {
            await db.createServer(this.guild.id, this.guild.name, Utils.getLanguageFromLocale(this.guild.preferredLocale));
        }
        else if (!await this.isActive()) {
            this.editServerData({ active: 1 });
        }
        let owner = await bot.users.fetch(this.guild.ownerId);

        this.sendDmToServerOwner(owner);
        this.logServerUpdate("add", owner);
    }

    async checkListRemoveServer(): Promise<void> {
        this.editServerData({ active: 0, hellEvent: '0' });
        let owner = await bot.users.fetch(this.guild.ownerId);
        this.logServerUpdate("remove", owner);
    }

    async registerHellData(channels: ChanData, roles: RolesData, update: boolean): Promise<void> {
        if (update) {
            await db.updateServerRoles(this.guild.id, this.guild.name, roles);
            await db.updateServerChannels(this.guild.id, this.guild.name, channels);
        } else {
            await db.createServerRoles(this.guild.id, this.guild.name, roles);
            await db.createServerChannels(this.guild.id, this.guild.name, channels);
        }

        await this.editServerData({ hellEvent: '1' })
    }

    async deleteHellData(): Promise<void> {
        await db.deleteServerChannels(this.guild.id, this.guild.name);
        await db.deleteServerRoles(this.guild.id, this.guild.name);
        await this.editServerData({ hellEvent: '0' })
    }

    displayInConsole(): string {
        return `${this.guild.name} (${this.guild.id})`
    }

    async editServerData(edits: PartialServer): Promise<void> {
        let oldData = await db.fetchServerData(this.guild.id);
        if (!oldData) {
            oldData = await ServerManager.buildBaseServerObject(this.guild.id);
            let guild = await bot.guilds.fetch(this.guild.id);
            await db.createServer(guild.id, guild.name, 'en');
        }
        let active: 0 | 1;
        edits.active === 0 ? active = 0 : active = 1;
        let data: Server = {
            id: edits.id || oldData.id,
            name: edits.name || oldData.name,
            active: active,
            hellEvent: edits.hellEvent || oldData.hellEvent,
            language: edits.language || oldData.language
        }
        await db.editServerDatabase(data);

        for (let dataName of Object.keys(edits)) {
            Console.log(`${dataName}: ${oldData[dataName as keyof Server]} => ${edits[dataName as keyof Server]}`)
        }
    }

    async getData(type: "full" | "roles" | "base" | "channels"): Promise<fullServer | Server | RolesData | ChanData | undefined> {
        switch (type) {
            case 'base':
                return await db.fetchServerData(this.guild.id);

            case 'roles':
                return await db.fetchServerRoles(this.guild.id);

            case 'full':
                return await db.fetchFullServerData(this.guild.id);

            case 'channels':
                return await db.fetchServerChannels(this.guild.id);

            default:
                break;
        }
    }

    async getHellRoles(): Promise<RolesData | undefined> {
        let roledata = await db.fetchServerRoles(this.guild.id)
        if (!roledata)
            Console.logDb(`Unable to fetch roles in db of ${this.guild.id} guild`);
        return roledata
    }

    async hasWatcher(): Promise<boolean> {
        return await db.checkIfWatcherEnabled(this.guild.id);
    }

    async isActive() {
        let isActive = await db.checkIfServerIsActive(this.guild.id);
        return isActive;
    }

    async isPresentInDatabase(): Promise<boolean | undefined> {
        let isPresent = await db.checkIfServerIsPresent(this.guild);
        return isPresent;
    }

    async logServerUpdate(type: "add" | "remove", owner: User): Promise<void> {
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
        try {
            await chanList.LOGS_SERVERS?.send(`${text[type].emote} ${this.guild.name} (${this.guild.id})\nMembres: ${this.guild.memberCount}\nOwner: ${owner.username} (${owner.id})`);
        } catch (e) {
            Console.error(e)
        }
    }

    async sendDmToServerOwner(owner: User): Promise<void> {
        let embed = (await Utils.EmbedBaseBuilder("fr"))
            .setTitle(`:flag_fr: Bonjour ${owner.username} !`)
            .setDescription(TranslationsCache.fr.global.welcomeMsg)
            .addFields([
                { name: `:flag_gb: Hello ${owner.username} !`, value: TranslationsCache.en.global.welcomeMsg }
            ])
            .setThumbnail(DiscordValues.botIcon.base)

        try {
            await owner.send({ embeds: [embed] })
        } catch {
            Console.error(`Impossible d'envoyer un mp de bienvenue à l'utilisateur ${owner.tag} (${owner.id})`)
        }
    }



    static async createIfServerIsNotInDb(guildId?: string): Promise<void> {
        if(!guildId)
            return Console.error(TranslationsCache[Constants.defaultLanguage].global.errors.notAGuild)
        try {
            let present = await db.checkIfServerIsPresent(guildId);
            if (!present) {
                let guild = await bot.guilds.cache.get(guildId);
                if (!guild)
                    return Console.error(TranslationsCache[Constants.defaultLanguage].global.errors.noServerInDbAndNotFound)
                await db.createServer(guild?.id, guild?.name, Constants.defaultLanguage);
            }
        } catch (e) {
            Console.error(`Erreur create server not in db:\n${e}`)
        }
    }
}
