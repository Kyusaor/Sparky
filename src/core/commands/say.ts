import { Attachment, CacheType, ChannelType, CommandInteractionOptionResolver, MessageCreateOptions, MessagePayload, PermissionFlagsBits, SlashCommandAttachmentOption, SlashCommandChannelOption, SlashCommandStringOption, TextChannel } from "discord.js";
import { CommandInterface } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { bot } from "../../main.js";
import { Translations } from "../constants/translations.js";

export const say: CommandInterface = {
    permissionLevel: 3,

    cacheLockScope: "none",

    commandStructure: CommandManager.baseSlashCommandBuilder("say", "dev")
        .addChannelOption(
            Command.generateCommandOptionBuilder("say", "channel", "channel") as SlashCommandChannelOption
        )
        .addStringOption(
            Command.generateCommandOptionBuilder("say", "id", "string") as SlashCommandStringOption
        )
        .addStringOption(
            Command.generateCommandOptionBuilder("say", "content", "string") as SlashCommandStringOption
        )
        .addAttachmentOption(
            Command.generateCommandOptionBuilder("say", "files", "file") as SlashCommandAttachmentOption
        ),

    async run({ intera, commandText }) {

        let entries = intera.options;
        let channel = await checkIfQueryIsCorrect(commandText, entries);

        if (typeof channel == "string")
            return Command.prototype.reply(channel, intera);

        let payload: MessagePayload | MessageCreateOptions = {
            content: entries.getString('content') || "",
        };
        if(entries.getAttachment('files'))
            payload.files = [entries.getAttachment('files') as Attachment]

        channel.send(payload);
        payload.content = 
            Translations.displayText(commandText.successHeader, { name: channel.guild.name, id: channel.guildId }) +
            Translations.displayText(commandText.success, {name: channel.name, id:channel.id, text: payload.content });
        Command.prototype.reply({content: payload.content, files: payload.files }, intera);
    },
}

async function checkIfQueryIsCorrect(
    commandText: Record<string, string>,
    entries: Omit<CommandInteractionOptionResolver<CacheType>, "getMessage" | "getFocused">
): Promise<string | TextChannel> {

    let channelID = entries.getChannel('channel')?.id || entries.getString('id')

    if (!channelID)
        return commandText.noChannelProvided;

    let channel = await bot.channels.fetch(channelID);
    if (!channel)
        return commandText.channel404;

    if (channel.type !== ChannelType.GuildText)
        return commandText.notATextChannel;

   if (!entries.getString('content') && !entries.getAttachment('files'))
        return commandText.noContent;

    let missingPerm = await Command.getMissingPermissions([PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.AttachFiles], channel, channel.guildId);
    if (missingPerm.length > 0) {
        let response = await Command.returnMissingPermissionMessage(missingPerm, channel.guildId)
        return response
    }

    return channel;
}