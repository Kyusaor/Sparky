import { CacheType, ChannelType, ChatInputCommandInteraction, Interaction, Message } from "discord.js";
import { Translations } from "../constants/translations.js";
import { Utils } from "../utils.js";
import { DiscordValues } from "../constants/values.js";
import { Console, bot, chanList, db } from "../../main.js";
import { ServerManager } from "./servers.js";

export abstract class EventManager {

    static interactionHandler(intera: Interaction<CacheType>): void {
        if(intera.isChatInputCommand())
            this.slashCommandManager(intera);
    }

    static MessageCreateHandler(msg: Message<boolean>): void {
        if (msg.author.bot) return;

        msg.channel.type === ChannelType.DM ? this.DmToBotHandler(msg) : this.MessageInServerHandler(msg);
    };

    static async MessageInServerHandler(msg: Message): Promise<void> {
        if (!msg.guild || !msg.mentions.has(bot.user!.id, { ignoreRoles: true, ignoreEveryone: true, ignoreRepliedUser: true })) return;
        let translation = await Translations.getServerTranslation(msg.guild.id);
        if (!translation)
            throw `Impossible de récupérer la traduction du serveur ${msg.guild.id}`;

        let embed = (await Utils.EmbedBaseBuilder(translation.language))
            .setThumbnail(DiscordValues.botIcon.help)
            .setTitle(translation.text.helpMention.title)
            .setDescription(translation.text.helpMention.description)

        msg.channel.send({ embeds: [embed] })
    };

    static async slashCommandManager(intera: ChatInputCommandInteraction) {
        if(!intera.guildId && !['lien', 'aide'].includes(intera.commandName))
            return intera.reply(`${Translations.displayText().fr.global.noCommandOffServer}\n\n${Translations.displayText().en.global.noCommandOffServer}`);

        if(intera.guild && !await db.checkIfServerIsPresent(intera.guild))
            await db.createServer(intera.guild.id, intera.guild.name);

        
    }

    static DmToBotHandler(msg: Message): void {
        if (msg.author.bot || msg.channel.type !== ChannelType.DM) return;

        let msgFiles: string[] = [];
        let chanDM = chanList.LOGS_DM;
        if (!chanDM)
            throw "Logs DM impossible à récupérer"

        msg.attachments.forEach(e =>
            msgFiles.push(e.url)
        );

        chanDM.send(msg.author.id);
        chanDM.send(`__**${msg.author.tag} a envoyé:**__`);

        if (msg.stickers.size == 1)
            chanDM.send(`sticker: ${msg.stickers.first()?.name}`)
        else
            chanDM.send({ content: msg.content, files: msgFiles });

        if(msg.content.includes('discord.gg/'))
            msg.channel.send(`${Translations.displayText().fr.global.noLinkInDm}\n\n${Translations.displayText().en.global.noLinkInDm}\n\n${Utils.displayBotLink()}`)
    };
}