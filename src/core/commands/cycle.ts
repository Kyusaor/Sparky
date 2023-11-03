import { SlashCommandStringOption } from "discord.js";
import { CommandInterface } from "../constants/types";
import { Command, CommandManager } from "../managers/commands";
import { Utils } from "../utils";
import { Constants } from "../constants/values";

export const cycle:CommandInterface = {

    permissionLevel: 1,

    cacheLockScope: "none",

    commandStructure: CommandManager.baseSlashCommandBuilder("cycle", "member")
        .addStringOption(
            (Command.generateCommandOptionBuilder("cycle", "event", "string") as SlashCommandStringOption)
                .addChoices(...Command.getChoices("cycle", "event"))
        ),

    run({intera, language, commandText}) {

        let option = intera.options.getString('event') as keyof typeof Constants.cycleEvents
        let data = Constants.cycleEvents[option];
    }
}