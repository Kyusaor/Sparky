import { InteractionReplyOptions, SlashCommandStringOption } from "discord.js";
import { CommandInterface } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { existsSync } from "fs";

export const ressources:CommandInterface = {
    
    permissionLevel: 1,

    commandStructure: CommandManager.baseSlashCommandBuilder("ressources", "member")
        .addStringOption(
            (Command.generateCommandOptionBuilder("ressources", "target", "string") as SlashCommandStringOption)
                .addChoices(...Command.getChoices("ressources", "target"))
        ),

    cacheLockScope: "none",

    run({ intera, commandText }) {

        let option = intera.options.getString('target');

        let path = `../../../ressources/images/rss-cmd/${option}.png`
        let text = commandText[option as keyof typeof commandText];

        let payload:InteractionReplyOptions = {
        };

        if(existsSync(path))
            payload.files = [path];

        if(text)
            payload.content = text;

        Command.prototype.reply(payload, intera);
    },
}