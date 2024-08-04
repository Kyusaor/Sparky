import { SlashCommandIntegerOption } from "discord.js";
import { CommandInterface } from "../constants/types.js";
import { Command, CommandManager } from "../managers/commands.js";
import { Utils } from "../utils.js";
import { existsSync } from "fs";

export const logs:CommandInterface = {
    permissionLevel: 3,

    cacheLockScope: "none",

    commandStructure: CommandManager.baseSlashCommandBuilder("logs", "dev")
        .addIntegerOption(
            (Command.generateCommandOptionBuilder("logs", "day", "integer") as SlashCommandIntegerOption)
                .setMinValue(1)
                .setMaxValue(31)
                .setRequired(true)
        )
        .addIntegerOption(
            (Command.generateCommandOptionBuilder("logs", "month", "integer") as SlashCommandIntegerOption)
                .setMinValue(1)
                .setMaxValue(12)
                .setRequired(true)
        ),

    run({ intera, commandText }) {
        let month = Utils.format2DigitsNumber(intera.options.getInteger('month')!);
        let day = Utils.format2DigitsNumber(intera.options.getInteger('day')!);
        let year = new Date().getFullYear();
        let path = `./logs/${year}-${month}/logs-${day}-${month}-${year}.log`

        if(!existsSync(path))
            return Command.prototype.reply(commandText.noPath, intera);
        
        Command.prototype.reply({files: [path]}, intera);
    },
}