import { SlashCommandUserOption } from "discord.js";
import { CommandInterface } from "../constants/types";
import { CommandManager, Command } from "../managers/commands.js";

export const info:CommandInterface = {
    permissionLevel: 1,

    commandStructure: CommandManager.baseSlashCommandBuilder("info", "member")
        .addSubcommand(
            Command.generateSubcommandBuilder("info", "user")
            .addUserOption(
                Command.generateCommandOptionBuilder("info", "user", "user", true) as SlashCommandUserOption
            )
        ),

    async run(args) {
        
    },
}