import { CacheType, ChannelType, Interaction, InteractionType, Message } from "discord.js";
import { Translations } from "../constants/translations.js";
import { Utils } from "../utils.js";
import { DiscordValues } from "../constants/values.js";
import { Console, StatusCache, TranslationsCache, bot, chanList, db } from "../../main.js";
import { CommandManager, WatcherManager } from "./commands.js";
import { ServerManager } from "./servers.js";

export abstract class EventManager {

    static async interactionHandler(intera: Interaction<CacheType>): Promise<void> {
        if(intera.guild)
            ServerManager.createIfServerIsNotInDb(intera.guild.id);

        let language = (await db.fetchUserData(intera.user.id))?.preferredLanguage;
        if (!language)
            language = await Translations.getServerLanguage(intera.guildId);

        try {
            if (intera.isChatInputCommand())
                await CommandManager.slashCommandManager(intera, language);

            if (intera.isButton())
                await CommandManager.buttonInteractionManager(intera, language);

            if (intera.isStringSelectMenu())
                await WatcherManager.selectMenuManager(intera, language);

        } catch (e) {
            Console.error(e);
            if (intera.isButton())
                StatusCache.unlock(intera.guildId || intera.user.id, intera.user.id, "setglobalping")
        }
    }

    static MessageCreateHandler(msg: Message<boolean>): void {
        if (msg.author.bot) return;

        msg.channel.type === ChannelType.DM ? this.DmToBotHandler(msg) : this.MessageInServerHandler(msg);
    };

    static async MessageInServerHandler(msg: Message): Promise<void> {
        if (!msg.guild || !msg.mentions.has(bot.user!.id, { ignoreRoles: true, ignoreEveryone: true, ignoreRepliedUser: true })) return;
        let language = await Translations.getServerLanguage(msg.guild.id);
        if (!language)
            throw `Impossible de récupérer la langue du serveur ${msg.guild.id}`;

        let embed = (await Utils.EmbedBaseBuilder(language))
            .setThumbnail(DiscordValues.botIcon.help)
            .setTitle(TranslationsCache[language].helpMention.title)
            .setDescription(TranslationsCache[language].helpMention.description)

        msg.channel.send({ embeds: [embed] })
    };


    static async DmToBotHandler(msg: Message): Promise<void> {
        if (msg.author.bot || msg.channel.type !== ChannelType.DM) return;

        let msgFiles: string[] = [];
        let chanDM = chanList.LOGS_DM;
        if (!chanDM)
            throw "Logs DM impossible à récupérer"

        msg.attachments.forEach(e =>
            msgFiles.push(e.url)
        );

        try {
            await chanDM.send(msg.author.id);
            await chanDM.send(`__**${msg.author.tag} a envoyé:**__`);

            if (msg.stickers.size == 1)
                await chanDM.send(`sticker: ${msg.stickers.first()?.name}`)
            else
                await chanDM.send({ content: msg.content, files: msgFiles });

            if (msg.content.includes('discord.gg/'))
                await msg.channel.send(`${TranslationsCache.fr.global.noLinkInDm}\n\n${TranslationsCache.en.global.noLinkInDm}\n\n${Utils.displayBotLink()}`)
            if(msg.content.startsWith('!') || msg.content.startsWith('/'))
                msg.channel.send(`${TranslationsCache.fr.global.noCommandOffServer}\n\n${TranslationsCache.en.global.noCommandOffServer}`)

        }
        catch (err) {
            Console.error(err);
        }
    };
}
