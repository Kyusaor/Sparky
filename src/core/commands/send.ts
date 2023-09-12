import { Attachment, InteractionReplyOptions, MessageCreateOptions, SlashCommandAttachmentOption, SlashCommandStringOption, SlashCommandUserOption } from "discord.js";
import { CommandInterface } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { Translations } from "../constants/translations.js";

export const send:CommandInterface = {
    permissionLevel: 3,

    cacheLockScope: "none",

    commandStructure: CommandManager.baseSlashCommandBuilder("send", "dev")
        .addUserOption(
            (Command.generateCommandOptionBuilder("send", "user", "user") as SlashCommandUserOption)
                .setRequired(true)
        )
        .addStringOption(
            (Command.generateCommandOptionBuilder("send", "message", "string") as SlashCommandStringOption)
        )
        .addAttachmentOption(
            (Command.generateCommandOptionBuilder("send", "files", "file") as SlashCommandAttachmentOption)
        ),

    async run({ intera, commandText }) {
        await intera.deferReply();
        let entries = intera.options;
        let user = await entries.getUser('user');
        if(!user) return intera.reply('User introuvable')
        if(!entries.getString('message') && !entries.getAttachment('files'))
            return Command.prototype.reply(commandText.noEntries, intera);
        
        let msgPayload:MessageCreateOptions = {};

        msgPayload.content = entries.getString('message') || "";
        if(entries.getAttachment('files'))
            msgPayload.files = [entries.getAttachment('files') as Attachment]
        
        try {
            await user.send(msgPayload)
        }
        catch {
            Command.prototype.reply(commandText.sendingFailed, intera)
        }

        msgPayload.content = Translations.displayText(commandText.success, { username: user.username, id: user.id, text: msgPayload.content});
        Command.prototype.reply(msgPayload as InteractionReplyOptions, intera)
    },
}