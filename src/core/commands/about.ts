import { PermissionFlagsBits, SlashCommandStringOption } from "discord.js";
import { CommandInterface } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";

export const about:CommandInterface = {

    permissionLevel: 1,

    cacheLockScope: "none",

    commandStructure: CommandManager.baseSlashCommandBuilder("about", "member")
        .addStringOption(
            (Command.generateCommandOptionBuilder("about", "topic", "string") as SlashCommandStringOption)
                .addChoices(...Command.getChoices("about", "topic"))
        ),

    neededPermissions: [PermissionFlagsBits.EmbedLinks],

    run({intera, commandText}) {
        let option = intera.options.getString('topic');

        let string = commandText[option as keyof typeof commandText];
        Command.prototype.reply(string, intera);
    }
}