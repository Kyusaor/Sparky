import { InteractionReplyOptions, SlashCommandStringOption } from "discord.js";
import { CommandInterface } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { existsSync } from "fs";
import { Translations } from "../constants/translations.js";

export const ressources:CommandInterface = {
    
    permissionLevel: 1,

    commandStructure: CommandManager.baseSlashCommandBuilder("ressources", "member")
        .addStringOption(
            (Command.generateCommandOptionBuilder("ressources", "target", "string") as SlashCommandStringOption)
                .addChoices(...Command.getChoices("ressources", "target"))
                .setRequired(true)
        ),

    cacheLockScope: "none",

    run({ intera, commandText }) {

        let option = intera.options.getString('target');

        let path = `../../../ressources/images/rss-cmd/${option}.png`
        let text = commandText[option as keyof typeof commandText];
        let reviver = commandText[`${option}-reviver` as keyof typeof commandText];
        if(commandText[`${option}-reviver` as keyof typeof commandText])
            text = Translations.displayText(text, { text: reviver });

        let payload:InteractionReplyOptions = {
        };

        if(existsSync(path))
            payload.files = [path];

        if(text)
            payload.content = text;

        Command.prototype.reply(payload, intera);
    },
}