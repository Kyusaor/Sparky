import { ChannelType, Message } from "discord.js";
import { Translations } from "../constants/translations.js";
import { Utils } from "../utils.js";
import { DiscordValues } from "../constants/values.js";

export abstract class EventManager {

    static MessageCreateHandler(msg:Message<boolean>):void {
        if(msg.author.bot) return;

        msg.channel.type === ChannelType.DM ? this.DmToBotHandler(msg) : this.MessageInServerHandler(msg);
    };

    static async MessageInServerHandler(msg:Message):Promise<void> {
        if(!msg.guild) return;
        let translation = await Translations.getServerTranslation(msg.guild.id);
        if(!translation)
            throw `Impossible de récupérer la traduction du serveur ${msg.guild.id}`;

        let embed = (await Utils.EmbedBaseBuilder(translation.language))
            .setThumbnail(DiscordValues.botIcon.help)
            .setTitle(translation.text.helpMention.title)
            .setDescription(translation.text.helpMention.description)

        msg.channel.send({embeds: [embed]})
    };

    static DmToBotHandler(msg:Message):void {

    };
}